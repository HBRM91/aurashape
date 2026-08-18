import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useIsDesktop } from '@/src/web/useIsDesktop';
import { router } from 'expo-router';
import { Svg, Polyline, Circle, Line } from 'react-native-svg';
import { getWebTokens, WEB_TOKENS } from './tokens';
import { useIsDark } from '@/src/stores/theme';
import { useAuthStore } from '@/src/stores/auth';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useDiaryStore } from '@/src/stores/diary';
import { useAchievementsStore } from '@/src/stores/achievements';
import { useWaterStore } from '@/src/stores/water';
import { useBodyStore } from '@/src/stores/body';
import { usePlanStore } from '@/src/stores/plan';
import { useCoachStore } from '@/src/stores/coach';
import { DAILY_TIPS } from '@/src/lib/tips';
import { MetricCard } from './MetricCard';
import { ScienceTipCard } from './ScienceTipCard';
import { QuickActionGrid } from './QuickActionGrid';
import { WebButton } from './WebButton';
import { CoachInsightPanel } from './CoachInsightPanel';
import { buildLocalCoachContext, getDailyRecommendations } from '@/src/lib/localCoach';
import { LocalCoachCard } from './LocalCoachCard';
import { LocalWeeklyReview } from './LocalWeeklyReview';

function todayStr(): string { return new Date().toISOString().slice(0, 10); }

function computeStreak(entries: { date: string }[]): number {
  const dates = new Set(entries.map((e) => e.date));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const s = d.toISOString().slice(0, 10);
    if (dates.has(s)) streak++;
    else if (i === 0) continue;
    else break;
  }
  return streak;
}

export function HomeDashboard() {
  const isDesktop = useIsDesktop();
  const tokens = getWebTokens(useIsDark());

  const user = useAuthStore((s) => s.user);
  const onboarding = useOnboardingStore();
  const { getDailyCalories, getDailyMacros } = useDiaryStore();
  const achievements = useAchievementsStore();
  const water = useWaterStore();
  const { entries } = useDiaryStore();

  const today = todayStr();
  const consumed = getDailyCalories(today);
  const macros = getDailyMacros(today);
  const calorieTarget = onboarding.calorieTarget || 2000;
  const proteinTarget = onboarding.proteinTargetG || 100;
  const carbsTarget = onboarding.carbsTargetG || 200;
  const fatTarget = onboarding.fatTargetG || 55;
  const waterMl = water.waterMl[today] || 0;
  const waterPercent = Math.min(100, Math.round((waterMl / 2000) * 100));
  const firstName = user?.email?.split('@')[0] || 'there';
  const healthStreak = computeStreak(entries);

  const tipIndex = new Date().getDate() % DAILY_TIPS.length;
  const dailyTip = DAILY_TIPS[tipIndex];

  const recentAchievements = achievements.achievements
    .filter((a) => a.unlocked && a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  const weightEntries = useBodyStore((s) => s.weightEntries);
  const { generatePlan, getToday, toggleMeal, toggleWorkout, toggleFasting, toggleRecovery } = usePlanStore();
  const planToday = getToday();
  const { weeklyPlan, applyRecommendation } = useCoachStore();
  const [dismissedCoachIds, setDismissedCoachIds] = useState<Set<string>>(new Set());
  const [dismissedLocalIds, setDismissedLocalIds] = useState<Set<string>>(new Set());
  const [weeklyReviewVisible, setWeeklyReviewVisible] = useState(true);

  const localContexts = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return buildLocalCoachContext(d.toISOString().slice(0, 10));
  });
  const localRec = getDailyRecommendations(localContexts[0]).find((r) => !dismissedLocalIds.has(r.id));
  const hasLocalData = localContexts.some((c) => c.diaryDaysLogged > 0 || c.workoutsCompleted > 0);

  const remainingCal = Math.max(0, calorieTarget - consumed);
  const col = tokens.colors;
  const spacing = tokens.spacing;

  return (
    <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: col.page }]}>
      <View style={[styles.container, isDesktop ? styles.containerDesktop : undefined]}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={[styles.greeting, { color: col.text }]}>Hey, {firstName}</Text>
            <Text style={[styles.date, { color: col.textMuted }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.calSummary}>
            <Text style={[styles.calValue, { color: col.primary }]}>{consumed}</Text>
            <Text style={[styles.calLabel, { color: col.textMuted }]}>cal consumed</Text>
            <Text style={[styles.calSub, { color: col.textMuted }]}>{remainingCal} kcal remaining</Text>
          </View>
        </View>

        {healthStreak > 0 && (
          <View style={[styles.streakCard, { backgroundColor: col.surface, borderColor: col.border }]}>
            <Text style={styles.streakIcon}>⭐</Text>
            <View style={styles.streakTextWrap}>
              <Text style={[styles.streakTitle, { color: col.text }]}>{healthStreak}-Day Health Streak</Text>
              <Text style={[styles.streakSub, { color: col.textMuted }]}>
                {healthStreak >= 7 ? "You're on fire! Keep it going." : healthStreak >= 3 ? 'Building momentum. Stay consistent!' : 'Every day counts. You\'ve got this!'}
              </Text>
            </View>
            <View style={styles.streakCount}>
              <Text style={styles.streakNum}>{healthStreak}</Text>
              <Text style={[styles.streakNumLabel, { color: col.textMuted }]}>days</Text>
            </View>
          </View>
        )}

        <View style={isDesktop ? styles.twoCol : undefined}>
          <View style={isDesktop ? styles.leftCol : undefined}>
            {consumed > 0 ? (
              <Card style={styles.macroCard}>
                <View style={styles.macroRow}>
                  <MetricCard label="Protein" value={`${Math.round(macros.protein)}g`} subtext={`target ${proteinTarget}g`} accentColor="#3B82F6" />
                  <MetricCard label="Carbs" value={`${Math.round(macros.carbs)}g`} subtext={`target ${carbsTarget}g`} accentColor="#EAB308" />
                  <MetricCard label="Fat" value={`${Math.round(macros.fat)}g`} subtext={`target ${fatTarget}g`} accentColor="#EC4899" />
                </View>
                <View style={styles.cardActions}>
                  <WebButton label="Open Food Diary" onPress={() => router.navigate('/(tabs)/diary')} />
                  <WebButton label="View Summary" variant="ghost" onPress={() => router.push('/summary' as any)} />
                </View>
              </Card>
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={[styles.emptyHeading, { color: col.text }]}>No meals logged today</Text>
                <Text style={[styles.emptySub, { color: col.textMuted }]}>Tap to start your food diary</Text>
                <WebButton label="Log Your First Meal" onPress={() => router.navigate('/(tabs)/diary')} style={{ marginTop: spacing.md }} />
              </Card>
            )}

            {weightEntries.length >= 2 && <WeightTrendCard entries={weightEntries} />}

            {planToday ? (
              <Card>
                <Text style={[styles.sectionTitle, { color: col.text }]}>Today's Plan</Text>
                {planToday.meals.map((meal, i) => (
                  <PlanRow key={meal.slot} label={meal.slot} desc={meal.description} done={meal.completed} onToggle={() => toggleMeal(planToday.date, i)} />
                ))}
                <PlanRow label="Workout" desc={planToday.workout.name} done={planToday.workout.completed} onToggle={() => toggleWorkout(planToday.date)} />
                <PlanRow label="Fasting" desc={planToday.fasting.plan} done={planToday.fasting.completed} onToggle={() => toggleFasting(planToday.date)} />
                <PlanRow label="Recovery" desc={planToday.recovery.action} done={planToday.recovery.completed} onToggle={() => toggleRecovery(planToday.date)} />
              </Card>
            ) : (
              <Card>
                <Text style={[styles.sectionTitle, { color: col.text }]}>Today's Plan</Text>
                <Text style={[styles.caption, { color: col.textMuted }]}>No plan yet. Generate one to get started.</Text>
                <WebButton label="Generate My Plan" onPress={() => generatePlan(onboarding.goal || 'improve_health')} style={{ marginTop: spacing.sm }} />
              </Card>
            )}

            <WeeklyCalCard calorieTarget={calorieTarget} getDailyCalories={getDailyCalories} />

            <Card>
              <Text style={[styles.sectionTitle, { color: col.text }]}>Trackers</Text>
              <View style={styles.macroRow}>
                <MetricCard label="Water" value={`${waterMl}ml`} icon="💧" subtext={`${waterPercent}% of 2000ml`} accentColor="#0EA5E9" />
                <MetricCard label="Fruits" value={water.fruitCount[today] || 0} icon="🍎" subtext="servings today" />
                <MetricCard label="Vegetables" value={water.vegCount[today] || 0} icon="🥬" subtext="servings today" />
              </View>
            </Card>

            {recentAchievements.length > 0 && (
              <Card>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: col.text }]}>Achievements</Text>
                  <Text style={styles.achBadge}>{achievements.totalUnlocked()}/18</Text>
                </View>
                <View style={styles.achRow}>
                  {recentAchievements.map((a) => (
                    <View key={a.id} style={styles.achItem}>
                      <Text style={styles.achIcon}>{a.icon}</Text>
                      <Text style={[styles.achName, { color: col.text }]} numberOfLines={2}>{a.name}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}
          </View>

          {isDesktop && (
            <View style={styles.rightCol}>
              <QuickActionGrid />
              {weeklyPlan.filter((r) => !r.applied && !dismissedCoachIds.has(r.id)).map((r) => (
                <CoachInsightPanel key={r.id} recommendation={r} onApply={applyRecommendation} onDismiss={(id) => setDismissedCoachIds((p) => new Set(p).add(id))} />
              ))}
              {localRec && <LocalCoachCard recommendation={localRec} onDismiss={(id) => setDismissedLocalIds((p) => new Set(p).add(id))} onSnooze={(id) => setDismissedLocalIds((p) => new Set(p).add(id))} />}
              {weeklyReviewVisible && hasLocalData && <LocalWeeklyReview contexts={localContexts} onDelete={() => setWeeklyReviewVisible(false)} />}
              <ScienceTipCard tip={dailyTip} />
            </View>
          )}
        </View>

        {!isDesktop && (
          <>
            <QuickActionGrid />
            {weeklyPlan.filter((r) => !r.applied && !dismissedCoachIds.has(r.id)).map((r) => (
              <CoachInsightPanel key={r.id} recommendation={r} onApply={applyRecommendation} onDismiss={(id) => setDismissedCoachIds((p) => new Set(p).add(id))} />
            ))}
            {localRec && <LocalCoachCard recommendation={localRec} onDismiss={(id) => setDismissedLocalIds((p) => new Set(p).add(id))} onSnooze={(id) => setDismissedLocalIds((p) => new Set(p).add(id))} />}
            {weeklyReviewVisible && hasLocalData && <LocalWeeklyReview contexts={localContexts} onDelete={() => setWeeklyReviewVisible(false)} />}
            <ScienceTipCard tip={dailyTip} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[styles.card, style]}>{children}</View>
  );
}

function PlanRow({ label, desc, done, onToggle }: { label: string; desc: string; done: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity style={styles.planItem} onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: done }}>
      <Text style={[styles.planCheck, done && { color: WEB_TOKENS.colors.primary }]}>{done ? '✓' : '○'}</Text>
      <View style={styles.planItemText}>
        <Text style={[styles.planItemLabel, done && styles.planItemDone]}>{label}</Text>
        <Text style={styles.planItemDesc}>{desc}</Text>
      </View>
    </TouchableOpacity>
  );
}

function WeightTrendCard({ entries }: { entries: Array<{ date: string; weightKg: number }> }) {
  const recent = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
  if (recent.length < 2) return null;
  const minW = Math.min(...recent.map((e) => e.weightKg));
  const maxW = Math.max(...recent.map((e) => e.weightKg));
  const range = maxW - minW || 1;
  const points = recent.map((e, i) => `${4 + (i / (recent.length - 1)) * 192},${8 + 44 - ((e.weightKg - minW) / range) * 44}`).join(' ');
  const diff = recent[recent.length - 1].weightKg - recent[0].weightKg;
  return (
    <Card>
      <Text style={styles.sectionTitle}>Weight Trend</Text>
      <Svg width={200} height={60}>
        <Polyline points={points} fill="none" stroke={WEB_TOKENS.colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={points.split(' ').pop()!.split(',')[0]} cy={points.split(' ').pop()!.split(',')[1]} r={3} fill={WEB_TOKENS.colors.primary} />
      </Svg>
      <View style={styles.trendMeta}>
        <Text style={styles.trendValue}>{recent[recent.length - 1].weightKg.toFixed(1)} kg</Text>
        <Text style={[styles.trendChange, { color: diff <= 0 ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.error }]}>{diff <= 0 ? '↓' : '↑'} {Math.abs(diff).toFixed(1)} kg</Text>
      </View>
    </Card>
  );
}

function WeeklyCalCard({ calorieTarget, getDailyCalories }: { calorieTarget: number; getDailyCalories: (d: string) => number }) {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d.toISOString().slice(0, 10)); }
  const cals = days.map((d) => getDailyCalories(d));
  const labels = days.map((d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3));
  const maxCal = Math.max(calorieTarget, ...cals, 1);
  const barW = 28; const gap = 6; const chartW = 7 * (barW + gap) - gap; const chartH = 80;

  return (
    <Card>
      <Text style={styles.sectionTitle}>Weekly Calories</Text>
      <Svg width={chartW} height={chartH}>
        {cals.map((cal, i) => (
          <Line key={i} x1={i * (barW + gap)} y1={chartH} x2={i * (barW + gap)} y2={chartH - Math.max(2, (cal / maxCal) * (chartH - 16))}
            stroke={cal > 0 ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.border} strokeWidth={barW} strokeLinecap="round" />
        ))}
        <Line x1={0} y1={chartH - (calorieTarget / maxCal) * (chartH - 16)} x2={chartW} y2={chartH - (calorieTarget / maxCal) * (chartH - 16)}
          stroke={WEB_TOKENS.colors.textMuted} strokeWidth={1} strokeDasharray="4,4" />
      </Svg>
      <View style={styles.chartLabels}>
        {labels.map((l, i) => <Text key={i} style={styles.chartLabel}>{l}</Text>)}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: WEB_TOKENS.spacing.xxl },
  container: { padding: WEB_TOKENS.spacing.md },
  containerDesktop: { padding: WEB_TOKENS.spacing.lg, maxWidth: WEB_TOKENS.contentWidths.desktop, alignSelf: 'center', width: '100%' as const },
  greetingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: WEB_TOKENS.spacing.lg },
  greeting: { ...WEB_TOKENS.typography.heading },
  date: { ...WEB_TOKENS.typography.caption, marginTop: 2 },
  calSummary: { alignItems: 'flex-end' },
  calValue: { ...WEB_TOKENS.typography.display },
  calLabel: { ...WEB_TOKENS.typography.caption },
  calSub: { ...WEB_TOKENS.typography.label, fontSize: 11, marginTop: 2 },
  streakCard: { borderRadius: WEB_TOKENS.radii.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: WEB_TOKENS.spacing.md, marginBottom: WEB_TOKENS.spacing.lg, padding: WEB_TOKENS.spacing.lg, ...WEB_TOKENS.shadows.card },
  streakIcon: { fontSize: 24 },
  streakTextWrap: { flex: 1 },
  streakTitle: { ...WEB_TOKENS.typography.label },
  streakSub: { ...WEB_TOKENS.typography.caption, fontSize: 12 },
  streakCount: { alignItems: 'center' },
  streakNum: { fontSize: 28, fontWeight: '700', color: '#F59E0B' },
  streakNumLabel: { fontSize: 11 },
  twoCol: { flexDirection: 'row', gap: WEB_TOKENS.spacing.lg },
  leftCol: { flex: 1, gap: WEB_TOKENS.spacing.md },
  rightCol: { flex: 1, gap: WEB_TOKENS.spacing.md },
  card: { backgroundColor: WEB_TOKENS.colors.surface, borderRadius: WEB_TOKENS.radii.md, borderColor: WEB_TOKENS.colors.border, borderWidth: 1, marginBottom: WEB_TOKENS.spacing.md, padding: WEB_TOKENS.spacing.lg, ...WEB_TOKENS.shadows.card },
  macroCard: { backgroundColor: WEB_TOKENS.colors.surface, borderRadius: WEB_TOKENS.radii.md, borderColor: WEB_TOKENS.colors.border, borderWidth: 1, gap: WEB_TOKENS.spacing.md, marginBottom: WEB_TOKENS.spacing.md, padding: WEB_TOKENS.spacing.lg, ...WEB_TOKENS.shadows.card },
  macroRow: { flexDirection: 'row', gap: WEB_TOKENS.spacing.md, flexWrap: 'wrap' },
  cardActions: { gap: WEB_TOKENS.spacing.sm, marginTop: WEB_TOKENS.spacing.sm },
  emptyCard: { backgroundColor: WEB_TOKENS.colors.surface, borderRadius: WEB_TOKENS.radii.md, borderColor: WEB_TOKENS.colors.border, borderWidth: 1, alignItems: 'center', marginBottom: WEB_TOKENS.spacing.md, padding: WEB_TOKENS.spacing.xl, ...WEB_TOKENS.shadows.card },
  emptyIcon: { fontSize: 36, textAlign: 'center' },
  emptyHeading: { ...WEB_TOKENS.typography.subheading, marginTop: WEB_TOKENS.spacing.md, textAlign: 'center' },
  emptySub: { ...WEB_TOKENS.typography.caption, marginTop: 4, textAlign: 'center' },
  sectionTitle: { ...WEB_TOKENS.typography.label },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: WEB_TOKENS.spacing.xs },
  achBadge: { backgroundColor: '#FEF3C7', borderRadius: WEB_TOKENS.radii.pill, paddingHorizontal: WEB_TOKENS.spacing.sm, paddingVertical: 2, color: '#B45309', fontSize: 11, fontWeight: '600' },
  achRow: { flexDirection: 'row' },
  achItem: { alignItems: 'center', flex: 1 },
  achIcon: { fontSize: 28 },
  achName: { fontWeight: '600', fontSize: 10, marginTop: 4, textAlign: 'center' },
  caption: { ...WEB_TOKENS.typography.caption },
  planItem: { alignItems: 'center', flexDirection: 'row', gap: WEB_TOKENS.spacing.sm, paddingVertical: WEB_TOKENS.spacing.xs },
  planCheck: { color: WEB_TOKENS.colors.textMuted, fontSize: 18, width: 24, textAlign: 'center' },
  planItemText: { flex: 1 },
  planItemLabel: { ...WEB_TOKENS.typography.label, fontSize: 12, color: WEB_TOKENS.colors.text },
  planItemDone: { color: WEB_TOKENS.colors.textMuted, textDecorationLine: 'line-through' },
  planItemDesc: { ...WEB_TOKENS.typography.caption, fontSize: 11, lineHeight: 16, color: WEB_TOKENS.colors.textMuted },
  trendMeta: { alignItems: 'center', flexDirection: 'row', gap: WEB_TOKENS.spacing.sm },
  trendValue: { ...WEB_TOKENS.typography.subheading, color: WEB_TOKENS.colors.text },
  trendChange: { ...WEB_TOKENS.typography.label, fontSize: 12 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  chartLabel: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, fontSize: 10, width: 28, textAlign: 'center' },
});