import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/src/constants/theme';
import { useWorkoutStore } from '@/src/stores/workout';
import { trackScreen } from '@/src/lib/analytics';
import { useWorkoutPlanStore } from '@/src/stores/workoutPlan';
import { useThemeColors } from '@/src/stores/theme';
import { usePlanStore } from '@/src/stores/plan';
import {
  EXERCISES,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type Exercise,
} from '@/src/lib/exercises';
import type { ExerciseCategory, SetLog } from '@/src/types';
import type { WorkoutHistoryEntry } from '@/src/stores/workout';
import { ExerciseImage } from '@/src/components/ImageLoader';
import {
  Plus,
  Timer,
  Barbell,
  Trash,
  CheckCircle,
  X,
  Play,
} from 'phosphor-react-native';
import { WebWorkout } from '@/src/web/screens/WebWorkout';

const CATEGORIES: ExerciseCategory[] = ['bodyweight', 'dumbbell', 'barbell', 'cardio', 'stretching'];

function formatMin(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function WorkoutScreen() {
  if (Platform.OS === 'web') return <WebWorkout />;
  useEffect(() => { trackScreen('workout'); }, []);
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
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
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
    Alert.alert('Finish Workout', 'Are you sure you want to finish this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: () => {
          const result = finishWorkout();
          setSummary(result);
        },
      },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Workout', 'All progress will be lost.', [
      { text: 'Keep Going', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: cancelWorkout },
    ]);
  };

  if (summary) {
    return <WorkoutSummary entry={summary} onDone={() => setSummary(null)} />;
  }

  if (activeWorkout) {
    return (
      <ActiveWorkoutView
        workout={activeWorkout}
        elapsedSec={elapsedSec}
        volume={getVolume()}
        onAddExercise={(e) => { addExercise(e); setShowExercisePicker(false); }}
        onRemoveExercise={removeExercise}
        onAddSet={addSet}
        onUpdateSet={updateSet}
        onRemoveSet={removeSet}
        onFinish={handleFinish}
        onCancel={handleCancel}
        showPicker={showExercisePicker}
        onShowPicker={() => setShowExercisePicker(!showExercisePicker)}
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 pt-6 pb-2">
        <Text className="text-2xl font-bold text-gray-800">Workout</Text>
      </View>

      <TouchableOpacity
        onPress={startWorkout}
        className="mx-4 mt-2 mb-6 py-5 rounded-2xl items-center"
        style={{ backgroundColor: COLORS.primary }}
      >
        <Barbell size={28} color="white" />
        <Text className="text-white text-lg font-bold mt-2">Start Workout</Text>
        <Text className="text-white/70 text-xs mt-1">Log sets, track volume, set PRs</Text>
      </TouchableOpacity>

      <WorkoutTemplates onStartTemplate={(exerciseIds) => {
        startWorkout();
        exerciseIds.forEach((id) => {
          const ex = EXERCISES.find((e) => e.id === id);
          if (ex) addExercise(ex);
        });
      }} />

      <View className="px-4 mb-4">
        <Text className="text-sm font-bold text-gray-500 mb-3 ml-1">Recent Workouts</Text>
        {history.length === 0 ? (
          <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center">
            <Text className="text-gray-300 text-sm">No workouts yet</Text>
          </View>
        ) : (
          history.slice(0, 10).map((entry) => (
            <View
              key={entry.id}
              className="bg-white rounded-xl border border-gray-100 px-4 py-3 mb-2"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-sm font-semibold text-gray-700">
                    {new Date(entry.startTime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {entry.exercises.length} exercises · {entry.durationMinutes} min
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-bold text-gray-700">
                    {entry.totalVolume.toLocaleString()} kg
                  </Text>
                  <Text className="text-xs text-gray-400">volume</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
      <WorkoutPlanSection />
      <View className="h-16" />
    </ScrollView>
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
  onShowPicker,
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
  onShowPicker: () => void;
}) {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-6 pb-3 border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <Text className="text-xl font-bold text-gray-800">Workout</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={onCancel} className="p-1">
              <X size={22} color="#9CA3AF" weight="bold" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row items-center gap-6 mt-2">
          <View className="flex-row items-center gap-1.5">
            <Timer size={15} color="#6B7280" />
            <Text className="text-sm text-gray-500">{formatMin(elapsedSec)}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Barbell size={15} color="#6B7280" />
            <Text className="text-sm text-gray-500">{workout.exercises.length} exercises</Text>
          </View>
          <Text className="text-sm font-semibold text-gray-700">{volume.toLocaleString()} kg</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {workout.exercises.map((we, wi) => (
          <View key={wi} className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-sm font-bold text-gray-800">{we.exercise.name}</Text>
                <Text className="text-xs text-gray-400">{CATEGORY_LABELS[we.exercise.category]}</Text>
              </View>
              <TouchableOpacity onPress={() => onRemoveExercise(wi)}>
                <Trash size={16} color="#D1D5DB" weight="fill" />
              </TouchableOpacity>
            </View>

            <View className="flex-row mb-2 px-2">
              <Text className="flex-[2] text-xs font-medium text-gray-400">Set</Text>
              <Text className="flex-[3] text-xs font-medium text-gray-400">Weight (kg)</Text>
              <Text className="flex-[2] text-xs font-medium text-gray-400">Reps</Text>
              <View className="w-8" />
            </View>

            {we.sets.map((set, si) => (
              <View key={si} className="flex-row items-center px-2 py-1.5">
                <Text className="flex-[2] text-sm font-semibold text-gray-500">{set.set_number}</Text>
                <TextInput
                  className="flex-[3] bg-gray-50 rounded-lg px-3 py-1.5 text-sm text-gray-800"
                  value={set.weight_kg ? String(set.weight_kg) : ''}
                  onChangeText={(v) => onUpdateSet(wi, si, { weight_kg: v ? Number(v) : undefined })}
                  placeholder="0"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="numeric"
                />
                <TextInput
                  className="flex-[2] bg-gray-50 rounded-lg px-3 py-1.5 text-sm text-gray-800 ml-2"
                  value={set.reps ? String(set.reps) : ''}
                  onChangeText={(v) => onUpdateSet(wi, si, { reps: Number(v) || 0 })}
                  placeholder="0"
                  placeholderTextColor="#D1D5DB"
                  keyboardType="numeric"
                />
                <TouchableOpacity onPress={() => onRemoveSet(wi, si)} className="w-8 items-center ml-1">
                  <Text className="text-gray-300">×</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => onAddSet(wi, { set_number: 0, reps: 0 })}
              className="mt-2 py-2 rounded-lg bg-gray-50 items-center"
            >
              <Text className="text-xs font-semibold text-gray-400">+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={onShowPicker}
          className="py-4 rounded-2xl border-2 border-dashed border-gray-200 items-center mb-24"
        >
          <Plus size={20} color="#9CA3AF" />
          <Text className="text-sm font-semibold text-gray-400 mt-1">Add Exercise</Text>
        </TouchableOpacity>

        {showPicker && (
          <ExercisePicker onSelect={onAddExercise} categories={CATEGORIES} />
        )}
      </ScrollView>

      <View className="px-4 py-3 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={onFinish}
          className="py-4 rounded-2xl items-center"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-white text-base font-bold">Finish Workout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ExercisePicker({
  onSelect,
  categories,
}: {
  onSelect: (e: Exercise) => void;
  categories: ExerciseCategory[];
}) {
  const [selectedCat, setSelectedCat] = useState<ExerciseCategory>('bodyweight');
  const filtered = EXERCISES.filter((e) => e.category === selectedCat);

  return (
    <View className="bg-white rounded-2xl border border-gray-100 mb-4 p-4">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row gap-2">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCat(cat)}
              className="px-4 py-2 rounded-full"
              style={{
                backgroundColor:
                  selectedCat === cat ? CATEGORY_COLORS[cat] + '20' : '#F3F4F6',
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: selectedCat === cat ? CATEGORY_COLORS[cat] : '#6B7280' }}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {filtered.map((ex) => (
        <TouchableOpacity
          key={ex.id}
          onPress={() => onSelect(ex)}
          className="flex-row items-center py-2.5 border-b border-gray-50"
        >
          <ExerciseImage exerciseName={ex.name} size={40} />
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-gray-700">{ex.name}</Text>
            <Text className="text-xs text-gray-400">
              {ex.muscleGroup.replace(/_/g, ' ')} · {'●'.repeat(ex.difficulty)}{'○'.repeat(3 - ex.difficulty)}
            </Text>
          </View>
          <Plus size={16} color={CATEGORY_COLORS[ex.category]} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function WorkoutSummary({
  entry,
  onDone,
}: {
  entry: WorkoutHistoryEntry;
  onDone: () => void;
}) {
  const estimatedCalBurned = Math.round(
    entry.durationMinutes * 5.5
  );

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center pt-12 pb-6 bg-green-50">
        <CheckCircle size={56} color={COLORS.success} weight="fill" />
        <Text className="text-2xl font-bold text-gray-800 mt-4">Workout Complete!</Text>
        <Text className="text-sm text-gray-500 mt-1">Great job</Text>
      </View>

      <View className="px-6 pt-6">
        <View className="bg-gray-50 rounded-2xl p-5 mb-4">
          <SummaryRow label="Duration" value={`${entry.durationMinutes} min`} />
          <SummaryRow label="Exercises" value={String(entry.exercises.length)} />
          <SummaryRow label="Total Sets" value={String(entry.exercises.reduce((s, e) => s + e.sets.length, 0))} />
          <SummaryRow label="Total Volume" value={`${entry.totalVolume.toLocaleString()} kg`} />
          <View className="flex-row justify-between py-2">
            <Text className="text-sm text-orange-500">Est. Calories Burned</Text>
            <Text className="text-sm font-bold text-orange-600">{estimatedCalBurned} kcal</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-gray-500 mb-3 ml-1">Exercises</Text>
        {entry.exercises.map((we, i) => (
          <View key={i} className="bg-gray-50 rounded-xl px-4 py-3 mb-2">
            <Text className="text-sm font-semibold text-gray-700">{we.exercise.name}</Text>
            <Text className="text-xs text-gray-400 mt-1">
              {we.sets.length} sets · {we.sets.reduce((s, set) => s + (set.weight_kg || 0) * set.reps, 0).toLocaleString()} kg
            </Text>
          </View>
        ))}

        <TouchableOpacity
          onPress={onDone}
          className="mt-6 mb-12 py-4 rounded-2xl items-center"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-white text-base font-bold">Done</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-bold text-gray-700">{value}</Text>
    </View>
  );
}

function WorkoutPlanSection() {
  const colors = useThemeColors();
  const today = usePlanStore((s) => s.getToday());
  const toggleWorkout = usePlanStore((s) => s.toggleWorkout);

  if (!today) return null;

  return (
    <View className="px-4 mb-4">
      <TouchableOpacity
        onPress={() => router.navigate('/(tabs)/plan' as any)}
        className="rounded-2xl p-4"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}
      >
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-lg">📋</Text>
          <Text className="text-sm font-bold" style={{ color: colors.text }}>Today's Plan</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-sm font-semibold" style={{ color: colors.text }} numberOfLines={2}>
              🏋️ {today.workout.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleWorkout(today.date)}
            className={`px-3 py-1.5 rounded-full ${today.workout.completed ? 'bg-green-100' : 'bg-green-50'}`}
          >
            <Text className={`text-xs font-semibold ${today.workout.completed ? 'text-green-500' : 'text-green-700'}`}>
              {today.workout.completed ? 'Done ✓' : 'Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function WorkoutTemplates({ onStartTemplate }: { onStartTemplate: (exerciseIds: string[]) => void }) {
  const { templates, useTemplate } = useWorkoutPlanStore();
  const colors = useThemeColors();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <View className="px-4 mb-6">
      <Text className="text-sm font-bold mb-3 ml-1" style={{ color: colors.textSecondary }}>
        Workout Templates
      </Text>

      {templates.slice(0, 5).map((t) => (
        <TouchableOpacity
          key={t.id}
          onPress={() => setExpanded(expanded === t.id ? null : t.id)}
          className="rounded-xl border mb-2 overflow-hidden"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <View className="px-4 py-3 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-bold" style={{ color: colors.text }}>{t.name}</Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                {t.exercises.length} exercises · ~{t.estimatedMinutes} min · {t.category.replace('_', ' ')}
                {t.timesUsed > 0 ? ` · used ${t.timesUsed}x` : ''}
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  useTemplate(t.id);
                  onStartTemplate(t.exercises.map((e) => e.exercise.id));
                }}
                className="bg-green-500 px-3 py-1.5 rounded-lg flex-row items-center"
              >
                <Play size={12} color="#FFF" weight="fill" />
                <Text className="text-white text-xs font-bold ml-1">Start</Text>
              </TouchableOpacity>
            </View>
          </View>

          {expanded === t.id && (
            <View className="px-4 pb-3 border-t" style={{ borderColor: colors.border }}>
              <Text className="text-xs mt-2 mb-2" style={{ color: colors.textSecondary }}>
                {t.description}
              </Text>
              {t.exercises.map((ex, i) => (
                <View key={i} className="flex-row items-center justify-between py-1">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-xs font-semibold mr-2" style={{ color: colors.textMuted }}>
                      {i + 1}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.text }}>{ex.exercise.name}</Text>
                  </View>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>
                    {ex.sets}×{ex.reps}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
