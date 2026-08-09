import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useDiaryStore } from '@/src/stores/diary';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useWaterStore } from '@/src/stores/water';
import { useMeditationStore } from '@/src/stores/meditation';
import { useThemeColors } from '@/src/stores/theme';
import { getNutritionTargets } from '@/src/lib/nutritionTargets';
import { WebCard } from '../WebCard';
import { WEB_TOKENS } from '../tokens';

export function WebSummary({ date }: { date: string }) {
  useEffect(() => {
    try { require('@/src/lib/analytics').trackScreen('summary'); } catch {}
  }, []);

  const colors = useThemeColors();
  const onboarding = useOnboardingStore();
  const { getDailyCalories, getDailyMacros, getEntriesBySlot } = useDiaryStore();
  const waterMl = useWaterStore((s) => s.waterMl[date] || 0);
  const sessions = useMeditationStore((s) => s.sessions);
  const targets = getNutritionTargets(onboarding);
  const consumed = getDailyCalories(date);
  const macros = getDailyMacros(date);
  const totalMeals = (['breakfast', 'lunch', 'dinner', 'snack'] as const)
    .reduce((sum, slot) => sum + getEntriesBySlot(date, slot).length, 0);
  const meditationMinutes = sessions
    .filter((session) => session.completedAt.slice(0, 10) === date)
    .reduce((sum, session) => sum + session.durationMinutes, 0);
  const hasData = consumed > 0 || waterMl > 0 || totalMeals > 0 || meditationMinutes > 0;

  return (
    <ScrollView style={[styles.page, { backgroundColor: colors.bgSecondary }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Daily Summary</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{date}</Text>
        </View>
        <TouchableOpacity onPress={() => router.navigate('/(tabs)/diary' as never)} style={[styles.backButton, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.backText, { color: colors.primary }]}>Back to diary</Text>
        </TouchableOpacity>
      </View>

      {!hasData ? (
        <WebCard style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing logged for this day</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>Add a meal, water, or mindful session to see your daily picture here.</Text>
          <TouchableOpacity onPress={() => router.navigate('/(tabs)/diary' as never)} style={[styles.primaryButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.primaryButtonText}>Log food</Text>
          </TouchableOpacity>
        </WebCard>
      ) : (
        <>
          <WebCard accessibilityLabel="Summary calories and macros" style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Calories & macros</Text>
            <Metric label="Calories" value={`${consumed} / ${targets.calorieTarget} kcal`} progress={consumed / Math.max(targets.calorieTarget, 1)} color={colors.primary} colors={colors} />
            <View style={styles.metricGrid}>
              <Metric label="Protein" value={`${macros.protein} / ${targets.proteinTargetG}g`} progress={macros.protein / Math.max(targets.proteinTargetG, 1)} color={colors.protein} colors={colors} />
              <Metric label="Carbs" value={`${macros.carbs} / ${targets.carbsTargetG}g`} progress={macros.carbs / Math.max(targets.carbsTargetG, 1)} color={colors.carbs} colors={colors} />
              <Metric label="Fat" value={`${macros.fat} / ${targets.fatTargetG}g`} progress={macros.fat / Math.max(targets.fatTargetG, 1)} color={colors.fat} colors={colors} />
            </View>
          </WebCard>

          <WebCard style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Daily habits</Text>
            <View style={styles.metricGrid}>
              <Stat label="Water" value={`${waterMl} ml`} colors={colors} />
              <Stat label="Meals" value={String(totalMeals)} colors={colors} />
              <Stat label="Mindful" value={`${meditationMinutes} min`} colors={colors} />
            </View>
          </WebCard>
        </>
      )}
    </ScrollView>
  );
}

function Metric({ label, value, progress, color, colors }: { label: string; value: string; progress: number; color: string; colors: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricHeader}><Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text><Text style={[styles.value, { color: colors.text }]}>{value}</Text></View>
      <View style={[styles.track, { backgroundColor: colors.bgInput }]}><View style={[styles.fill, { backgroundColor: color, width: `${Math.min(100, Math.max(0, progress * 100))}%` }]} /></View>
    </View>
  );
}

function Stat({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useThemeColors> }) {
  return <View style={[styles.stat, { backgroundColor: colors.bgSecondary }]}><Text style={[styles.statValue, { color: colors.text }]}>{value}</Text><Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { padding: WEB_TOKENS.spacing.lg, gap: WEB_TOKENS.spacing.md, maxWidth: 900, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: WEB_TOKENS.spacing.md, marginBottom: WEB_TOKENS.spacing.sm },
  title: { ...WEB_TOKENS.typography.heading, fontSize: 30 },
  subtitle: { ...WEB_TOKENS.typography.caption, marginTop: 4 },
  backButton: { borderWidth: 1, borderRadius: WEB_TOKENS.radii.sm, paddingHorizontal: 12, paddingVertical: 9 },
  backText: { ...WEB_TOKENS.typography.label },
  card: { padding: WEB_TOKENS.spacing.lg },
  cardTitle: { ...WEB_TOKENS.typography.subheading, fontSize: 19, marginBottom: WEB_TOKENS.spacing.md },
  body: { ...WEB_TOKENS.typography.body, marginTop: 6 },
  emptyTitle: { ...WEB_TOKENS.typography.subheading },
  primaryButton: { alignSelf: 'flex-start', borderRadius: WEB_TOKENS.radii.sm, marginTop: WEB_TOKENS.spacing.lg, paddingHorizontal: 18, paddingVertical: 12 },
  primaryButtonText: { ...WEB_TOKENS.typography.label, color: '#FFFFFF' },
  metricGrid: { flexDirection: 'row', gap: WEB_TOKENS.spacing.md, flexWrap: 'wrap' },
  metric: { flex: 1, minWidth: 180, marginTop: WEB_TOKENS.spacing.sm },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 6 },
  label: { ...WEB_TOKENS.typography.caption, fontSize: 12 },
  value: { ...WEB_TOKENS.typography.label, fontSize: 12 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  stat: { alignItems: 'center', borderRadius: WEB_TOKENS.radii.sm, flex: 1, minWidth: 140, padding: WEB_TOKENS.spacing.md },
  statValue: { ...WEB_TOKENS.typography.subheading, fontSize: 20, marginBottom: 3 },
});
