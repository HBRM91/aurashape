import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useBodyStore } from '@/src/stores/body';
import { useInsightsStore } from '@/src/stores/insights';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { calculateBMI, estimateBodyFatPct } from '@/src/lib/calculator';
import { WebCard } from '../WebCard';
import { WebButton } from '../WebButton';
import { MetricCard } from '../MetricCard';
import { WEB_TOKENS } from '../tokens';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const TABS = ['weight', 'measurements', 'photos', 'insights'] as const;
type Tab = typeof TABS[number];

export function WebProgress() {
  useEffect(() => {
    try { require('@/src/lib/analytics').trackScreen('progress'); } catch {}
  }, []);

  const [tab, setTab] = useState<Tab>('weight');

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Progress</Text>
        <Text style={styles.pageSub}>Track your transformation</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabPill, tab === t ? styles.tabPillActive : undefined]}
            accessibilityRole="tab"
            accessibilityLabel={`${t} tab`}
            accessibilityState={{ selected: tab === t }}
          >
            <Text style={[styles.tabPillText, tab === t ? styles.tabPillTextActive : undefined]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.tabContent}>
          {tab === 'weight' && <WeightTab />}
          {tab === 'measurements' && <MeasurementsTab />}
          {tab === 'photos' && <PhotosTab />}
          {tab === 'insights' && <InsightsTab />}
        </View>
        <View style={{ height: WEB_TOKENS.spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

function WeightTab() {
  const { weightEntries, addWeight, removeWeight } = useBodyStore();
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const onboarding = useOnboardingStore();

  const handleAdd = () => {
    const w = parseFloat(weight);
    if (!w || w < 20 || w > 300) {
      Alert.alert('Invalid', 'Enter a valid weight (20-300 kg)');
      return;
    }
    addWeight({ date: todayStr(), weightKg: w, bodyFatPct: bodyFat ? parseFloat(bodyFat) : undefined });
    setWeight('');
    setBodyFat('');
  };

  const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const trend = latest && first ? latest.weightKg - first.weightKg : 0;
  const heightCm = onboarding.heightCm || 170;
  const bmi = latest ? calculateBMI(latest.weightKg, heightCm) : null;
  const estimatedBf = latest && (onboarding.sex === 'male' || onboarding.sex === 'female')
    ? estimateBodyFatPct(onboarding.sex, bmi?.bmi || 22, 30)
    : null;

  return (
    <View style={{ gap: WEB_TOKENS.spacing.md }}>
      <View style={styles.metricRow}>
        <MetricCard
          label="Current Weight"
          value={latest ? `${latest.weightKg} kg` : '--'}
        />
        <MetricCard
          label="Change"
          value={trend !== 0 ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)} kg` : '--'}
          accentColor={trend < 0 ? '#22C55E' : trend > 0 ? WEB_TOKENS.colors.error : undefined}
        />
      </View>

      {bmi && (
        <WebCard>
          <Text style={styles.sectionLabel}>Body Composition</Text>
          <View style={styles.metricRow}>
            <View style={styles.compCard}>
              <Text style={[styles.compValue, { color: bmi.color }]}>{bmi.bmi}</Text>
              <Text style={styles.compLabel}>BMI</Text>
              <Text style={[styles.compCategory, { color: bmi.color }]}>{bmi.category}</Text>
            </View>
            <View style={styles.compCard}>
              <Text style={styles.compValue}>{bmi.healthyMin}–{bmi.healthyMax}</Text>
              <Text style={styles.compLabel}>Healthy Range</Text>
              <Text style={styles.compCategory}>kg for {heightCm}cm</Text>
            </View>
            {estimatedBf !== null && (
              <View style={styles.compCard}>
                <Text style={[styles.compValue, { color: '#8B5CF6' }]}>{estimatedBf}%</Text>
                <Text style={styles.compLabel}>Est. Body Fat</Text>
                <Text style={[styles.compCategory, { color: '#8B5CF6' }]}>via US Navy</Text>
              </View>
            )}
          </View>
        </WebCard>
      )}

      <WebCard>
        <Text style={styles.sectionLabel}>Log Weight</Text>
        <View style={styles.formRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.fieldInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter weight"
              placeholderTextColor={WEB_TOKENS.colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Body Fat %</Text>
            <TextInput
              style={styles.fieldInput}
              value={bodyFat}
              onChangeText={setBodyFat}
              placeholder="Optional"
              placeholderTextColor={WEB_TOKENS.colors.textMuted}
              keyboardType="numeric"
            />
          </View>
        </View>
        <WebButton label="Add Entry" variant="primary" onPress={handleAdd} />
      </WebCard>

      {sorted.length > 0 && (
        <WebCard>
          <Text style={styles.sectionLabel}>History</Text>
          {[...sorted].reverse().slice(0, 14).map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyValue}>{entry.weightKg} kg</Text>
                <Text style={styles.historyDate}>{entry.date}</Text>
              </View>
              <TouchableOpacity onPress={() => removeWeight(entry.id)}>
                <Text style={styles.deleteBtn}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </WebCard>
      )}
    </View>
  );
}

const MEASURE_LABELS: Array<{ key: string; label: string }> = [
  { key: 'neckCm', label: 'Neck' },
  { key: 'shouldersCm', label: 'Shoulders' },
  { key: 'chestCm', label: 'Chest' },
  { key: 'waistCm', label: 'Waist' },
  { key: 'hipsCm', label: 'Hips' },
  { key: 'leftArmCm', label: 'Left Arm' },
  { key: 'rightArmCm', label: 'Right Arm' },
  { key: 'leftThighCm', label: 'Left Thigh' },
  { key: 'rightThighCm', label: 'Right Thigh' },
  { key: 'leftCalfCm', label: 'Left Calf' },
  { key: 'rightCalfCm', label: 'Right Calf' },
];

function MeasurementsTab() {
  const { measurements, addMeasurements, removeMeasurements } = useBodyStore();
  const [values, setValues] = useState<Record<string, string>>({});

  const handleAdd = () => {
    const entry: Record<string, number | undefined> = {};
    let hasValue = false;
    Object.entries(values).forEach(([k, v]) => {
      if (v) { entry[k] = parseFloat(v); hasValue = true; }
    });
    if (!hasValue) {
      Alert.alert('Empty', 'Enter at least one measurement');
      return;
    }
    addMeasurements({ date: todayStr(), ...entry } as any);
    setValues({});
  };

  return (
    <View style={{ gap: WEB_TOKENS.spacing.md }}>
      <WebCard>
        <Text style={styles.sectionLabel}>Log Measurements</Text>
        {MEASURE_LABELS.map((m) => (
          <View key={m.key} style={styles.measureRow}>
            <Text style={styles.measureLabel}>{m.label}</Text>
            <TextInput
              style={styles.measureInput}
              value={values[m.key] || ''}
              onChangeText={(v) => setValues((s) => ({ ...s, [m.key]: v }))}
              placeholder="cm"
              placeholderTextColor={WEB_TOKENS.colors.textMuted}
              keyboardType="numeric"
            />
          </View>
        ))}
        <View style={{ marginTop: WEB_TOKENS.spacing.md }}>
          <WebButton label="Save Measurements" variant="primary" onPress={handleAdd} />
        </View>
      </WebCard>

      {measurements.length > 0 && (
        <WebCard>
          <Text style={styles.sectionLabel}>History</Text>
          {measurements.slice(0, 10).map((entry) => (
            <View key={entry.id} style={styles.measureHistoryRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyValue}>{entry.date}</Text>
                <View style={styles.measureChipRow}>
                  {MEASURE_LABELS.map((m) => {
                    const val = (entry as any)[m.key];
                    if (!val) return null;
                    return (
                      <View key={m.key} style={styles.measureChip}>
                        <Text style={styles.measureChipText}>{m.label}: {val}cm</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              <TouchableOpacity onPress={() => removeMeasurements(entry.id)}>
                <Text style={styles.deleteBtn}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </WebCard>
      )}
    </View>
  );
}

function PhotosTab() {
  const { photos } = useBodyStore();

  return (
    <View style={{ gap: WEB_TOKENS.spacing.md }}>
      <WebCard>
        <Text style={styles.sectionLabel}>Progress Photos</Text>
        <Text style={styles.emptyText}>Photo management is available on mobile for camera access.</Text>
        {photos.length === 0 ? (
          <Text style={styles.emptyText}>No photos yet. Use the mobile app to capture progress photos.</Text>
        ) : (
          <View style={styles.photoGrid}>
            {photos.slice(0, 20).map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Text style={styles.photoType}>{photo.type}</Text>
                <Text style={styles.photoDate}>{photo.date}</Text>
                {photo.weightKg && <Text style={styles.photoWeight}>{photo.weightKg}kg</Text>}
              </View>
            ))}
          </View>
        )}
      </WebCard>
    </View>
  );
}

function InsightsTab() {
  const onboarding = useOnboardingStore();
  const today = todayStr();
  const calorieTarget = onboarding.calorieTarget || 2000;
  const proteinTarget = onboarding.proteinTargetG || 100;
  const carbsTarget = onboarding.carbsTargetG || 250;
  const fatTarget = onboarding.fatTargetG || 55;

  const insights = useInsightsStore.getState().getWeeklyInsights(
    today, calorieTarget, proteinTarget, carbsTarget, fatTarget
  );
  const daySummary = useInsightsStore.getState().getDaySummary(
    today, calorieTarget, proteinTarget, carbsTarget, fatTarget
  );

  const goalPct = calorieTarget > 0 ? Math.min(100, Math.round((daySummary.calories / calorieTarget) * 100)) : 0;

  return (
    <View style={{ gap: WEB_TOKENS.spacing.md }}>
      <WebCard>
        <Text style={styles.sectionLabel}>Nutrition Insights</Text>
        <View style={styles.insightGrid}>
          <MiniInsight label="Avg Daily Calories" value={String(insights.avgCalories)} target={`target: ${calorieTarget}`} bg="#ECFDF5" color="#166534" />
          <MiniInsight label="Avg Protein" value={`${insights.avgProtein}g`} target={`target: ${proteinTarget}g`} bg="#EFF6FF" color="#1E40AF" />
          <MiniInsight label="Avg Carbs" value={`${insights.avgCarbs}g`} target={`target: ${carbsTarget}g`} bg="#FFFBEB" color="#92400E" />
          <MiniInsight label="Avg Fat" value={`${insights.avgFat}g`} target={`target: ${fatTarget}g`} bg="#FDF2F8" color="#9D174D" />
        </View>
      </WebCard>

      <WebCard>
        <Text style={styles.sectionLabel}>Goal Completion</Text>
        <View style={styles.metricRow}>
          <MetricCard label="Cal Target Met" value={insights.calorieTargetMet} icon="🎯" />
          <MetricCard label="Protein Target Met" value={insights.proteinTargetMet} icon="💪" />
          <MetricCard label="Day Streak" value={insights.streak} icon="🔥" />
        </View>
        <View style={styles.goalProgress}>
          <View style={styles.goalBarBg}>
            <View style={[styles.goalBarFill, { width: `${goalPct}%` }]} />
          </View>
          <Text style={styles.goalText}>
            Today: {daySummary.calories} / {calorieTarget} kcal ({goalPct}%)
          </Text>
        </View>
      </WebCard>

      {insights.bestDay && (
        <WebCard>
          <Text style={styles.sectionLabel}>Highlights</Text>
          <View style={styles.metricRow}>
            <MetricCard label="Best Day" value={insights.bestDay} accentColor="#22C55E" />
            {insights.worstDay && (
              <MetricCard label="Needs Work" value={insights.worstDay} accentColor="#EF4444" />
            )}
          </View>
        </WebCard>
      )}

      {insights.topFoods.length > 0 && (
        <WebCard>
          <Text style={styles.sectionLabel}>Most Eaten Foods</Text>
          {insights.topFoods.map((food, i) => (
            <View key={i} style={styles.foodRow}>
              <View style={styles.foodRank}>
                <Text style={styles.foodRankText}>{i + 1}</Text>
              </View>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodCount}>{food.count}x</Text>
            </View>
          ))}
        </WebCard>
      )}
    </View>
  );
}

function MiniInsight({ label, value, target, bg, color }: { label: string; value: string; target: string; bg: string; color: string }) {
  return (
    <View style={[styles.miniInsight, { backgroundColor: bg }]}>
      <Text style={[styles.miniInsightLabel, { color }]}>{label}</Text>
      <Text style={[styles.miniInsightValue, { color }]}>{value}</Text>
      <Text style={[styles.miniInsightTarget, { color }]}>{target}</Text>
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
    paddingBottom: WEB_TOKENS.spacing.xs,
  },
  pageTitle: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.text,
  },
  pageSub: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: 4,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: WEB_TOKENS.spacing.lg,
    marginVertical: WEB_TOKENS.spacing.md,
    borderRadius: WEB_TOKENS.radii.md,
    backgroundColor: WEB_TOKENS.colors.surface,
    borderWidth: 1,
    borderColor: WEB_TOKENS.colors.border,
    padding: 3,
    gap: 3,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: WEB_TOKENS.radii.sm,
    alignItems: 'center',
  },
  tabPillActive: {
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  tabPillText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  tabPillTextActive: {
    color: WEB_TOKENS.colors.surface,
  },
  scroll: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    gap: WEB_TOKENS.spacing.md,
  },
  sectionLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    flexWrap: 'wrap',
  },
  compCard: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    padding: WEB_TOKENS.spacing.md,
  },
  compValue: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
  },
  compLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  compCategory: {
    ...WEB_TOKENS.typography.label,
    fontSize: 11,
    marginTop: 4,
  },
  formRow: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.md,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  fieldLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginBottom: 4,
    fontSize: 12,
  },
  fieldInput: {
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    borderWidth: 1,
    borderColor: WEB_TOKENS.colors.border,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: 10,
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
  },
  historyValue: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
  },
  historyDate: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  deleteBtn: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.error,
    fontSize: 12,
  },
  measureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
    gap: WEB_TOKENS.spacing.md,
  },
  measureLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    flex: 1,
  },
  measureInput: {
    width: 80,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    textAlign: 'right',
  },
  measureHistoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
  },
  measureChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  measureChip: {
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  measureChipText: {
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
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WEB_TOKENS.spacing.sm,
  },
  photoItem: {
    width: 100,
    height: 120,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  photoType: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    textTransform: 'capitalize',
  },
  photoDate: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 10,
  },
  photoWeight: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  insightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WEB_TOKENS.spacing.sm,
  },
  miniInsight: {
    flex: 1,
    minWidth: '45%',
    borderRadius: WEB_TOKENS.radii.sm,
    padding: WEB_TOKENS.spacing.md,
  },
  miniInsightLabel: {
    ...WEB_TOKENS.typography.caption,
    fontWeight: '600',
    fontSize: 11,
    marginBottom: 4,
  },
  miniInsightValue: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
  },
  miniInsightTarget: {
    ...WEB_TOKENS.typography.caption,
    fontSize: 11,
    marginTop: 4,
  },
  goalProgress: {
    marginTop: WEB_TOKENS.spacing.md,
  },
  goalBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    overflow: 'hidden',
    marginBottom: WEB_TOKENS.spacing.xs,
  },
  goalBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  goalText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
    gap: WEB_TOKENS.spacing.sm,
  },
  foodRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: WEB_TOKENS.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodRankText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 11,
  },
  foodName: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    flex: 1,
  },
  foodCount: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
});
