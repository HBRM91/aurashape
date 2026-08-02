import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useWorkoutStore, type WorkoutHistoryEntry } from '@/src/stores/workout';
import { useWorkoutPlanStore } from '@/src/stores/workoutPlan';
import {
  EXERCISES,
  CATEGORY_LABELS,
  type Exercise,
} from '@/src/lib/exercises';
import type { ExerciseCategory, SetLog } from '@/src/types';
import { WebCard } from '../WebCard';
import { WebButton } from '../WebButton';
import { WEB_TOKENS } from '../tokens';

function formatMin(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function WebWorkout() {
  useEffect(() => {
    try { require('@/src/lib/analytics').trackScreen('workout'); } catch {}
  }, []);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    activeWorkout,
    history,
    startWorkout,
    cancelWorkout,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    finishWorkout,
    getVolume,
    getElapsedMinutes,
  } = useWorkoutStore();

  const [summary, setSummary] = useState<WorkoutHistoryEntry | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('bodyweight');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeWorkout) {
      timerRef.current = setInterval(() => {
        setElapsedSec(getElapsedMinutes() * 60);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeWorkout]);

  const handleFinish = () => {
    Alert.alert('Finish Workout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Finish', onPress: () => { const r = finishWorkout(); setSummary(r); } },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Workout', 'All progress will be lost.', [
      { text: 'Keep Going', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: cancelWorkout },
    ]);
  };

  if (summary) {
    return <WorkoutSummaryView entry={summary} onDone={() => setSummary(null)} />;
  }

  if (activeWorkout) {
    return (
      <ActiveWorkoutView
        workout={activeWorkout}
        elapsedSec={elapsedSec}
        volume={getVolume()}
        onAddExercise={(e) => { addExercise(e); setShowPicker(false); }}
        onRemoveExercise={removeExercise}
        onAddSet={addSet}
        onUpdateSet={updateSet}
        onRemoveSet={removeSet}
        onFinish={handleFinish}
        onCancel={handleCancel}
        showPicker={showPicker}
        onTogglePicker={() => setShowPicker(!showPicker)}
      />
    );
  }

  const filteredExercises = useMemo(() => {
    let list = EXERCISES;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q));
    }
    return list.filter((e) => e.category === selectedCategory || search.trim() !== '');
  }, [search, selectedCategory]);

  const categories: ExerciseCategory[] = ['bodyweight', 'dumbbell', 'barbell', 'cardio', 'stretching'];

  const leftColumn = (
    <View style={styles.column}>
      <WebCard>
        <Text style={styles.cardHeading}>Start Workout</Text>
        <WebButton label="Start Empty Workout" variant="primary" onPress={startWorkout} />
        <WorkoutTemplates onStart={(ids) => {
          startWorkout();
          ids.forEach((id) => {
            const ex = EXERCISES.find((e) => e.id === id);
            if (ex) addExercise(ex);
          });
        }} />
      </WebCard>

      <WebCard>
        <Text style={styles.cardHeading}>Exercise Library</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercises..."
          placeholderTextColor={WEB_TOKENS.colors.textMuted}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => { setSelectedCategory(cat); setSearch(''); }}
              style={[styles.catPill, selectedCategory === cat ? styles.catPillActive : undefined]}
            >
              <Text style={[styles.catPillText, selectedCategory === cat ? styles.catPillTextActive : undefined]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {filteredExercises.slice(0, 20).map((ex) => (
          <TouchableOpacity
            key={ex.id}
            onPress={() => {
              if (!activeWorkout) startWorkout();
              addExercise(ex);
            }}
            style={styles.exerciseRow}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.exName}>{ex.name}</Text>
              <Text style={styles.exMeta}>
                {ex.muscleGroup.replace(/_/g, ' ')} · {CATEGORY_LABELS[ex.category]}
              </Text>
            </View>
            <Text style={styles.exDiff}>{'●'.repeat(ex.difficulty)}{'○'.repeat(3 - ex.difficulty)}</Text>
          </TouchableOpacity>
        ))}
      </WebCard>
    </View>
  );

  const rightColumn = (
    <View style={styles.column}>
      <WebCard>
        <Text style={styles.cardHeading}>Recent Workouts</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No workouts yet</Text>
        ) : (
          history.slice(0, 10).map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyDate}>
                  {new Date(entry.startTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.historyMeta}>
                  {entry.exercises.length} exercises · {entry.durationMinutes} min
                </Text>
              </View>
              <View style={styles.historyVolWrap}>
                <Text style={styles.historyVol}>
                  {entry.totalVolume.toLocaleString()} kg
                </Text>
                <Text style={styles.historyVolLabel}>volume</Text>
              </View>
            </View>
          ))
        )}
      </WebCard>
    </View>
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Workout</Text>
      </View>
      <ScrollView style={styles.scroll}>
        <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
          {isDesktop ? (
            <>{leftColumn}{rightColumn}</>
          ) : (
            <>{rightColumn}{leftColumn}</>
          )}
        </View>
        <View style={{ height: WEB_TOKENS.spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function WorkoutTemplates({ onStart }: { onStart: (exerciseIds: string[]) => void }) {
  const { templates, useTemplate } = useWorkoutPlanStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View style={{ marginTop: WEB_TOKENS.spacing.md }}>
      <Text style={tStyles.heading}>Templates</Text>
      {templates.slice(0, 5).map((t) => (
        <TouchableOpacity
          key={t.id}
          onPress={() => setExpanded(expanded === t.id ? null : t.id)}
          style={tStyles.templateCard}
        >
          <View style={tStyles.templateHeader}>
            <View style={{ flex: 1 }}>
              <Text style={tStyles.templateName}>{t.name}</Text>
              <Text style={tStyles.templateMeta}>
                {t.exercises.length} exercises · ~{t.estimatedMinutes} min
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                useTemplate(t.id);
                onStart(t.exercises.map((e) => e.exercise.id));
              }}
              style={tStyles.startBtn}
            >
              <Text style={tStyles.startBtnText}>Start</Text>
            </TouchableOpacity>
          </View>
          {expanded === t.id && (
            <View style={tStyles.expanded}>
              {t.exercises.map((ex, i) => (
                <View key={i} style={tStyles.templateExercise}>
                  <Text style={tStyles.exerciseNum}>{i + 1}.</Text>
                  <Text style={tStyles.exerciseNameText}>{ex.exercise.name}</Text>
                  <Text style={tStyles.exerciseReps}>{ex.sets}×{ex.reps}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ActiveWorkoutView({
  workout,
  elapsedSec,
  volume,
  onAddExercise,
  onRemoveExercise,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onFinish,
  onCancel,
  showPicker,
  onTogglePicker,
}: {
  workout: NonNullable<ReturnType<typeof useWorkoutStore.getState>['activeWorkout']>;
  elapsedSec: number;
  volume: number;
  onAddExercise: (e: Exercise) => void;
  onRemoveExercise: (i: number) => void;
  onAddSet: (i: number, set: SetLog) => void;
  onUpdateSet: (i: number, si: number, s: Partial<SetLog>) => void;
  onRemoveSet: (i: number, si: number) => void;
  onFinish: () => void;
  onCancel: () => void;
  showPicker: boolean;
  onTogglePicker: () => void;
}) {
  const [searchEx, setSearchEx] = useState('');
  const [catEx, setCatEx] = useState<ExerciseCategory>('bodyweight');

  const filtered = useMemo(() => {
    let list = EXERCISES;
    if (searchEx.trim()) {
      const q = searchEx.toLowerCase();
      list = list.filter((e) => e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q));
    }
    if (!searchEx.trim()) list = list.filter((e) => e.category === catEx);
    return list;
  }, [searchEx, catEx]);

  return (
    <View style={styles.page}>
      <View style={styles.activeHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Active Workout</Text>
          <View style={styles.activeMeta}>
            <Text style={styles.activeMetaText}>{formatMin(elapsedSec)}</Text>
            <Text style={styles.activeMetaText}>{workout.exercises.length} exercises</Text>
            <Text style={styles.activeMetaText}>{volume.toLocaleString()} kg</Text>
          </View>
        </View>
        <View style={styles.activeActions}>
          <WebButton label="Cancel" variant="ghost" onPress={onCancel} />
          <WebButton label="Finish" variant="primary" onPress={onFinish} />
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.activeContent}>
          {workout.exercises.map((we, wi) => (
            <WebCard key={wi}>
              <View style={styles.activeExHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeExName}>{we.exercise.name}</Text>
                  <Text style={styles.activeExCat}>{CATEGORY_LABELS[we.exercise.category]}</Text>
                </View>
                <TouchableOpacity onPress={() => onRemoveExercise(wi)}>
                  <Text style={styles.removeBtn}>Remove</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.setHeaderRow}>
                <Text style={[styles.setHeaderCell, { flex: 2 }]}>Set</Text>
                <Text style={[styles.setHeaderCell, { flex: 3 }]}>Weight (kg)</Text>
                <Text style={[styles.setHeaderCell, { flex: 2 }]}>Reps</Text>
                <View style={{ width: 32 }} />
              </View>

              {we.sets.map((set, si) => (
                <View key={si} style={styles.setRow}>
                  <Text style={[styles.setNum, { flex: 2 }]}>{set.set_number}</Text>
                  <TextInput
                    style={styles.setInput}
                    value={set.weight_kg ? String(set.weight_kg) : ''}
                    onChangeText={(v) => onUpdateSet(wi, si, { weight_kg: v ? Number(v) : undefined })}
                    placeholder="0"
                    placeholderTextColor={WEB_TOKENS.colors.textMuted}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.setInput}
                    value={set.reps ? String(set.reps) : ''}
                    onChangeText={(v) => onUpdateSet(wi, si, { reps: Number(v) || 0 })}
                    placeholder="0"
                    placeholderTextColor={WEB_TOKENS.colors.textMuted}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity onPress={() => onRemoveSet(wi, si)} style={styles.setRemoveBtn}>
                    <Text style={styles.setRemoveBtnText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity onPress={() => onAddSet(wi, { set_number: 0, reps: 0 })} style={styles.addSetBtn}>
                <Text style={styles.addSetBtnText}>+ Add Set</Text>
              </TouchableOpacity>
            </WebCard>
          ))}

          <TouchableOpacity onPress={onTogglePicker} style={styles.addExBtn}>
            <Text style={styles.addExBtnText}>+ Add Exercise</Text>
          </TouchableOpacity>

          {showPicker && (
            <WebCard>
              <TextInput
                style={styles.searchInput}
                value={searchEx}
                onChangeText={setSearchEx}
                placeholder="Search exercises..."
                placeholderTextColor={WEB_TOKENS.colors.textMuted}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {(['bodyweight', 'dumbbell', 'barbell', 'cardio', 'stretching'] as ExerciseCategory[]).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCatEx(cat)}
                    style={[styles.catPill, catEx === cat ? styles.catPillActive : undefined]}
                  >
                    <Text style={[styles.catPillText, catEx === cat ? styles.catPillTextActive : undefined]}>
                      {CATEGORY_LABELS[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {filtered.slice(0, 15).map((ex) => (
                <TouchableOpacity key={ex.id} onPress={() => onAddExercise(ex)} style={styles.exerciseRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{ex.name}</Text>
                    <Text style={styles.exMeta}>{ex.muscleGroup.replace(/_/g, ' ')}</Text>
                  </View>
                  <Text style={styles.exDiff}>{'●'.repeat(ex.difficulty)}{'○'.repeat(3 - ex.difficulty)}</Text>
                </TouchableOpacity>
              ))}
            </WebCard>
          )}

          <View style={{ height: WEB_TOKENS.spacing.xxl }} />
        </View>
      </ScrollView>
    </View>
  );
}

function WorkoutSummaryView({ entry, onDone }: { entry: WorkoutHistoryEntry; onDone: () => void }) {
  const estimatedCalBurned = Math.round(entry.durationMinutes * 5.5);
  return (
    <View style={styles.page}>
      <ScrollView style={styles.scroll}>
        <View style={styles.summaryContainer}>
          <WebCard>
            <Text style={styles.summaryTitle}>Workout Complete!</Text>
            <View style={styles.summaryGrid}>
              <SummaryStat label="Duration" value={`${entry.durationMinutes} min`} />
              <SummaryStat label="Exercises" value={String(entry.exercises.length)} />
              <SummaryStat label="Total Sets" value={String(entry.exercises.reduce((s, e) => s + e.sets.length, 0))} />
              <SummaryStat label="Volume" value={`${entry.totalVolume.toLocaleString()} kg`} />
              <SummaryStat label="Est. Calories" value={`${estimatedCalBurned} kcal`} />
            </View>
            <View style={{ marginTop: WEB_TOKENS.spacing.lg }}>
              <WebButton label="Done" variant="primary" onPress={onDone} />
            </View>
          </WebCard>

          {entry.exercises.map((we, i) => (
            <WebCard key={i}>
              <Text style={styles.summaryExName}>{we.exercise.name}</Text>
              <Text style={styles.summaryExMeta}>
                {we.sets.length} sets · {we.sets.reduce((s, set) => s + (set.weight_kg || 0) * set.reps, 0).toLocaleString()} kg
              </Text>
            </WebCard>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryStatLabel}>{label}</Text>
      <Text style={styles.summaryStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: WEB_TOKENS.colors.page,
  },
  header: {
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    paddingTop: WEB_TOKENS.spacing.xl,
    paddingBottom: WEB_TOKENS.spacing.md,
  },
  pageTitle: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.text,
  },
  scroll: {
    flex: 1,
  },
  desktopGrid: {
    flexDirection: 'row',
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    gap: WEB_TOKENS.spacing.lg,
  },
  mobileStack: {
    paddingHorizontal: WEB_TOKENS.spacing.md,
    gap: WEB_TOKENS.spacing.md,
  },
  column: {
    flex: 1,
    gap: WEB_TOKENS.spacing.md,
  },
  cardHeading: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  searchInput: {
    ...WEB_TOKENS.typography.body,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    borderWidth: 1,
    borderColor: WEB_TOKENS.colors.border,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  catScroll: {
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  catPill: {
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    marginRight: WEB_TOKENS.spacing.sm,
  },
  catPillActive: {
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  catPillText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  catPillTextActive: {
    color: WEB_TOKENS.colors.surface,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
    gap: WEB_TOKENS.spacing.sm,
  },
  exName: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
  },
  exMeta: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  exDiff: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primary,
    fontSize: 10,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
    gap: WEB_TOKENS.spacing.sm,
  },
  historyDate: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
  },
  historyMeta: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  historyVolWrap: {
    alignItems: 'flex-end',
  },
  historyVol: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primary,
  },
  historyVolLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 10,
  },
  emptyText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: WEB_TOKENS.spacing.lg,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    paddingTop: WEB_TOKENS.spacing.xl,
    paddingBottom: WEB_TOKENS.spacing.md,
    backgroundColor: WEB_TOKENS.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: WEB_TOKENS.colors.border,
  },
  activeMeta: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.md,
    marginTop: 4,
  },
  activeMetaText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  activeActions: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
  },
  activeContent: {
    padding: WEB_TOKENS.spacing.lg,
    gap: WEB_TOKENS.spacing.md,
  },
  activeExHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: WEB_TOKENS.spacing.md,
  },
  activeExName: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
  },
  activeExCat: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  removeBtn: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.error,
    fontSize: 12,
  },
  setHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: WEB_TOKENS.spacing.xs,
    marginBottom: 4,
  },
  setHeaderCell: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontWeight: '600',
    fontSize: 11,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: WEB_TOKENS.spacing.xs,
    gap: WEB_TOKENS.spacing.sm,
  },
  setNum: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontWeight: '600',
  },
  setInput: {
    flex: 3,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    textAlign: 'center',
  },
  setRemoveBtn: {
    width: 24,
    alignItems: 'center',
  },
  setRemoveBtnText: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.textMuted,
  },
  addSetBtn: {
    marginTop: WEB_TOKENS.spacing.sm,
    paddingVertical: 8,
    borderRadius: WEB_TOKENS.radii.sm,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    alignItems: 'center',
  },
  addSetBtnText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  addExBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: WEB_TOKENS.colors.border,
    borderRadius: WEB_TOKENS.radii.md,
    padding: WEB_TOKENS.spacing.lg,
    alignItems: 'center',
  },
  addExBtnText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
  },
  summaryContainer: {
    padding: WEB_TOKENS.spacing.lg,
    gap: WEB_TOKENS.spacing.md,
  },
  summaryTitle: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    textAlign: 'center',
    marginBottom: WEB_TOKENS.spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WEB_TOKENS.spacing.sm,
  },
  summaryStat: {
    flex: 1,
    minWidth: 130,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    padding: WEB_TOKENS.spacing.md,
    alignItems: 'center',
  },
  summaryStatLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  summaryStatValue: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginTop: 2,
    fontSize: 14,
  },
  summaryExName: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
  },
  summaryExMeta: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: 2,
  },
});

const tStyles = StyleSheet.create({
  heading: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontWeight: '600',
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  templateCard: {
    borderRadius: WEB_TOKENS.radii.sm,
    borderWidth: 1,
    borderColor: WEB_TOKENS.colors.border,
    marginBottom: WEB_TOKENS.spacing.sm,
    overflow: 'hidden',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: WEB_TOKENS.spacing.md,
    gap: WEB_TOKENS.spacing.sm,
  },
  templateName: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
  },
  templateMeta: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  startBtn: {
    backgroundColor: WEB_TOKENS.colors.primary,
    borderRadius: WEB_TOKENS.radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  startBtnText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.surface,
    fontSize: 12,
  },
  expanded: {
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.border,
    padding: WEB_TOKENS.spacing.md,
  },
  templateExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: WEB_TOKENS.spacing.sm,
  },
  exerciseNum: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    width: 24,
    fontSize: 12,
  },
  exerciseNameText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    flex: 1,
    fontSize: 13,
  },
  exerciseReps: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
});
