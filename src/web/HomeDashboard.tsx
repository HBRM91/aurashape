import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Svg, Polyline, Circle, Line } from 'react-native-svg';
import { WEB_TOKENS } from './tokens';
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

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function computeStreak(diaryDates: string[]): number {
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (diaryDates.includes(dateStr)) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function HomeDashboard() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const user = useAuthStore((s) => s.user);
  const onboarding = useOnboardingStore();
  const { getDailyCalories, getDailyMacros } = useDiaryStore();
  const achievements = useAchievementsStore();
  const water = useWaterStore();

  const today = todayStr();
  const consumed = getDailyCalories(today);
  const macros = getDailyMacros(today);
  const calorieTarget = onboarding.calorieTarget || 2000;
  const proteinTarget = onboarding.proteinTargetG || 100;
  const carbsTarget = onboarding.carbsTargetG || 200;
  const fatTarget = onboarding.fatTargetG || 55;

  const waterMl = water.waterMl[today] || 0;
  const fruitCount = water.fruitCount[today] || 0;
  const vegCount = water.vegCount[today] || 0;

  const tipIndex = new Date().getDate() % DAILY_TIPS.length;
  const dailyTip = DAILY_TIPS[tipIndex];

  const firstName = user?.email?.split('@')[0] || 'there';

  const unlockedCount = achievements.totalUnlocked();
  const recentAchievements = achievements.achievements
    .filter((a) => a.unlocked && a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3);

  const diaryDates = useDiaryStore((s) => [...new Set(s.entries.map((e) => e.date))]);
  const healthStreak = computeStreak(diaryDates);

  const weightEntries = useBodyStore((s) => s.weightEntries);
  const { generatePlan, getToday, toggleMeal, toggleWorkout, toggleFasting, toggleRecovery } = usePlanStore();
  const planToday = getToday();
  const { weeklyPlan, applyRecommendation } = useCoachStore();
  const [dismissedCoachIds, setDismissedCoachIds] = useState<Set<string>>(new Set());

  const remainingCal = Math.max(0, calorieTarget - consumed);
  const waterPercent = Math.min(100, Math.round((waterMl / 2000) * 100));

  const macroRows = (
    <View style={styles.macroRow}>
      <MetricCard
        label="Protein"
        value={`${Math.round(macros.protein)}g`}
        subtext={`target ${proteinTarget}g`}
        accentColor="#3B82F6"
      />
      <MetricCard
        label="Carbs"
        value={`${Math.round(macros.carbs)}g`}
        subtext={`target ${carbsTarget}g`}
        accentColor="#EAB308"
      />
      <MetricCard
        label="Fat"
        value={`${Math.round(macros.fat)}g`}
        subtext={`target ${fatTarget}g`}
        accentColor="#EC4899"
      />
    </View>
  );

  const waterTrackers = (
    <View style={styles.trackerRow}>
      <MetricCard
        label="Water"
        value={`${waterMl}ml`}
        icon="💧"
        subtext={`${waterPercent}% of 2000ml`}
        accentColor="#0EA5E9"
      />
      <MetricCard
        label="Fruits"
        value={fruitCount}
        icon="🍎"
        subtext="servings today"
      />
      <MetricCard
        label="Vegetables"
        value={vegCount}
        icon="🥬"
        subtext="servings today"
      />
    </View>
  );

  const achievementsRow = unlockedCount > 0 && recentAchievements.length > 0 ? (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achBadge}>
          <Text style={styles.achBadgeText}>{unlockedCount}/18</Text>
        </View>
      </View>
      <View style={styles.achRow}>
        {recentAchievements.map((a) => (
          <View key={a.id} style={styles.achItem}>
            <Text style={styles.achIcon}>{a.icon}</Text>
            <Text style={styles.achName} numberOfLines={2}>{a.name}</Text>
          </View>
        ))}
        {recentAchievements.length < 3 ? (
          <View style={styles.achItem}>
            <Text style={styles.achMoreIcon}>🏆</Text>
            <Text style={styles.achMore}>More to unlock</Text>
          </View>
        ) : null}
      </View>
    </View>
  ) : null;

  const recentWeights = weightEntries
    .filter((e) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 14);
      return new Date(e.date) >= cutoff;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const weightTrendCard =
    recentWeights.length >= 2 ? (() => {
      const minW = Math.min(...recentWeights.map((e) => e.weightKg));
      const maxW = Math.max(...recentWeights.map((e) => e.weightKg));
      const range = maxW - minW || 1;
      const svgW = 200;
      const svgH = 60;
      const padX = 4;
      const padY = 8;
      const plotW = svgW - padX * 2;
      const plotH = svgH - padY * 2;
      const points = recentWeights
        .map((e, i) => {
          const x = padX + (i / (recentWeights.length - 1)) * plotW;
          const y = padY + plotH - ((e.weightKg - minW) / range) * plotH;
          return `${x},${y}`;
        })
        .join(' ');
      const latest = recentWeights[recentWeights.length - 1].weightKg;
      const first = recentWeights[0].weightKg;
      const diff = latest - first;
      return (
        <View style={styles.trendCard}>
          <Text style={styles.sectionTitle}>Weight Trend</Text>
          <Svg width={svgW} height={svgH}>
            <Polyline points={points} fill="none" stroke={WEB_TOKENS.colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx={points.split(' ').pop()!.split(',')[0]} cy={points.split(' ').pop()!.split(',')[1]} r={3} fill={WEB_TOKENS.colors.primary} />
          </Svg>
          <View style={styles.trendMeta}>
            <Text style={styles.trendValue}>{latest.toFixed(1)} kg</Text>
            <Text style={[styles.trendChange, { color: diff <= 0 ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.error }]}>
              {diff <= 0 ? '↓' : '↑'} {Math.abs(diff).toFixed(1)} kg
            </Text>
          </View>
        </View>
      );
    })() : null;

  const todayPlanCard = (() => {
    if (!planToday) {
      return (
        <View style={styles.trendCard}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>
          <Text style={styles.caption}>No plan yet. Generate one to get started.</Text>
          <WebButton
            label="Generate My Plan"
            onPress={() => generatePlan(onboarding.goal || 'improve_health')}
            variant="primary"
            style={{ marginTop: WEB_TOKENS.spacing.sm }}
          />
        </View>
      );
    }
    return (
      <View style={styles.trendCard}>
        <Text style={styles.sectionTitle}>Today's Plan</Text>
        {planToday.meals.map((meal, i) => (
          <TouchableOpacity
            key={meal.slot}
            style={styles.planItem}
            onPress={() => toggleMeal(planToday.date, i)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: meal.completed }}
          >
            <Text style={[styles.planCheck, meal.completed && styles.planCheckDone]}>
              {meal.completed ? '✓' : '○'}
            </Text>
            <View style={styles.planItemText}>
              <Text style={[styles.planItemLabel, meal.completed && styles.planItemDone]}>
                {meal.slot}
              </Text>
              <Text style={styles.planItemDesc}>{meal.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.planItem}
          onPress={() => toggleWorkout(planToday.date)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: planToday.workout.completed }}
        >
          <Text style={[styles.planCheck, planToday.workout.completed && styles.planCheckDone]}>
            {planToday.workout.completed ? '✓' : '○'}
          </Text>
          <View style={styles.planItemText}>
            <Text style={[styles.planItemLabel, planToday.workout.completed && styles.planItemDone]}>
              Workout
            </Text>
            <Text style={styles.planItemDesc}>{planToday.workout.name}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.planItem}
          onPress={() => toggleFasting(planToday.date)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: planToday.fasting.completed }}
        >
          <Text style={[styles.planCheck, planToday.fasting.completed && styles.planCheckDone]}>
            {planToday.fasting.completed ? '✓' : '○'}
          </Text>
          <View style={styles.planItemText}>
            <Text style={[styles.planItemLabel, planToday.fasting.completed && styles.planItemDone]}>
              Fasting
            </Text>
            <Text style={styles.planItemDesc}>{planToday.fasting.plan}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.planItem}
          onPress={() => toggleRecovery(planToday.date)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: planToday.recovery.completed }}
        >
          <Text style={[styles.planCheck, planToday.recovery.completed && styles.planCheckDone]}>
            {planToday.recovery.completed ? '✓' : '○'}
          </Text>
          <View style={styles.planItemText}>
            <Text style={[styles.planItemLabel, planToday.recovery.completed && styles.planItemDone]}>
              Recovery
            </Text>
            <Text style={styles.planItemDesc}>{planToday.recovery.action}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  })();

  const coachInsightCard = (() => {
    const recommendation = weeklyPlan.find((r) => !r.applied && !dismissedCoachIds.has(r.id));
    if (!recommendation) return null;
    const catEmoji: Record<string, string> = {
      nutrition: '🥗',
      fasting: '⏱️',
      workout: '🏋️',
      recovery: '😴',
      hydration: '💧',
    };
    return (
      <View style={styles.trendCard}>
        <View style={styles.coachHeader}>
          <Text style={styles.coachEmoji}>{catEmoji[recommendation.category] || '📋'}</Text>
          <Text style={styles.sectionTitle}>Coach Insight</Text>
        </View>
        <Text style={styles.coachRec}>{recommendation.recommendation}</Text>
        <Text style={styles.coachReason}>{recommendation.reason}</Text>
        <Text style={styles.coachAction}>{recommendation.action}</Text>
        <View style={styles.coachActions}>
          <WebButton
            label="Apply"
            onPress={() => applyRecommendation(recommendation.id)}
            variant="primary"
          />
          <WebButton
            label="Dismiss"
            onPress={() => setDismissedCoachIds((prev) => new Set(prev).add(recommendation.id))}
            variant="ghost"
          />
        </View>
      </View>
    );
  })();

  const last7Days = (() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  })();
  const weeklyCal = last7Days.map((d) => getDailyCalories(d));
  const dayLabels = last7Days.map((d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
  );
  const maxCal = Math.max(calorieTarget, ...weeklyCal, 1);
  const barW = 28;
  const barGap = 6;
  const chartW = 7 * (barW + barGap) - barGap;
  const chartH = 80;
  const chartPadB = 16;

  const weeklyCalCard = (
    <View style={styles.trendCard}>
      <Text style={styles.sectionTitle}>Weekly Calories</Text>
      <Svg width={chartW} height={chartH}>
        {weeklyCal.map((cal, i) => {
          const barH = Math.max(2, (cal / maxCal) * (chartH - chartPadB));
          const x = i * (barW + barGap);
          const y = chartH - barH;
          return cal > 0 ? (
            <Line
              key={`bar-${i}`}
              x1={x}
              y1={chartH}
              x2={x}
              y2={y}
              stroke={WEB_TOKENS.colors.primary}
              strokeWidth={barW}
              strokeLinecap="round"
            />
          ) : (
            <Line
              key={`bar-${i}`}
              x1={x}
              y1={chartH}
              x2={x}
              y2={chartH - 2}
              stroke={WEB_TOKENS.colors.border}
              strokeWidth={barW}
              strokeLinecap="round"
            />
          );
        })}
        <Line
          x1={0}
          y1={chartH - (calorieTarget / maxCal) * (chartH - chartPadB)}
          x2={chartW}
          y2={chartH - (calorieTarget / maxCal) * (chartH - chartPadB)}
          stroke={WEB_TOKENS.colors.textMuted}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
      </Svg>
      <View style={styles.chartLabels}>
        {dayLabels.map((lbl, i) => (
          <Text key={i} style={styles.chartLabel}>{lbl}</Text>
        ))}
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scroll}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>Hey, {firstName}</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.calSummary}>
            <Text style={styles.calValue}>{consumed}</Text>
            <Text style={styles.calLabel}>cal consumed</Text>
            <Text style={styles.calSub}>
              {remainingCal} kcal remaining
            </Text>
          </View>
        </View>

        {healthStreak > 0 ? (
          <View style={styles.streakCard}>
            <Text style={styles.streakIcon}>⭐</Text>
            <View style={styles.streakTextWrap}>
              <Text style={styles.streakTitle}>{healthStreak}-Day Health Streak</Text>
              <Text style={styles.streakSub}>
                {healthStreak >= 7
                  ? "You're on fire! Keep it going."
                  : healthStreak >= 3
                    ? 'Building momentum. Stay consistent!'
                    : 'Every day counts. You\'ve got this!'}
              </Text>
            </View>
            <View style={styles.streakCount}>
              <Text style={styles.streakNum}>{healthStreak}</Text>
              <Text style={styles.streakNumLabel}>days</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.twoCol}>
          <View style={styles.leftCol}>
            {consumed > 0 ? (
              <View style={styles.macroCard}>
                {macroRows}
                <View style={styles.cardActions}>
                  <View
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Open Food Diary"
                    style={[styles.cardBtn, styles.cardBtnPrimary]}
                  >
                    <Text
                      style={styles.cardBtnPrimaryText}
                      onPress={() => router.navigate('/(tabs)/diary')}
                    >
                      Open Food Diary
                    </Text>
                  </View>
                  <View
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="View Daily Summary"
                    style={styles.cardBtnSecondary}
                  >
                    <Text
                      style={styles.cardBtnSecondaryText}
                      onPress={() => router.push('/summary' as any)}
                    >
                      View Daily Summary
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.emptyMealsCard}>
                <View
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Start your food diary"
                  onTouchEnd={() => router.navigate('/(tabs)/diary')}
                >
                  <Text style={styles.emptyMealsIcon}>🍽️</Text>
                  <Text style={styles.emptyMealsHeading}>No meals logged today</Text>
                  <Text style={styles.emptyMealsSub}>Tap to start your food diary</Text>
                  <View style={styles.emptyMealsBtn}>
                    <Text style={styles.emptyMealsBtnText}>Log Your First Meal</Text>
                  </View>
                </View>
              </View>
            )}

            {weightTrendCard}
            {todayPlanCard}
            {weeklyCalCard}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trackers</Text>
              {waterTrackers}
            </View>

            {achievementsRow}
          </View>

          <View style={styles.rightCol}>
            <QuickActionGrid />

            {coachInsightCard}

            <View style={styles.tipWrapper}>
              <ScienceTipCard tip={dailyTip} />
            </View>

            <View
              accessible
              accessibilityRole="button"
              accessibilityLabel="Science Articles"
              style={styles.articlesCard}
            >
              <View style={styles.articlesRow}>
                <Text style={styles.articlesBook}>📚</Text>
                <Text style={styles.articlesLabel}>Science Articles</Text>
                <Text style={styles.articlesArrow}>4 articles →</Text>
              </View>
              <View
                onTouchEnd={() => router.push('/articles')}
                style={styles.articlesTouchArea}
              >
                <Text style={styles.articlesLink}>Browse all articles</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContentMobile} style={styles.scroll}>
      <View style={styles.mobileGreeting}>
        <Text style={styles.greetingMobile}>Hey, {firstName}</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      {healthStreak > 0 ? (
        <View style={styles.streakCard}>
          <Text style={styles.streakIcon}>⭐</Text>
          <View style={styles.streakTextWrap}>
            <Text style={styles.streakTitle}>{healthStreak}-Day Health Streak</Text>
            <Text style={styles.streakSub}>
              {healthStreak >= 7
                ? "You're on fire! Keep it going."
                : healthStreak >= 3
                  ? 'Building momentum. Stay consistent!'
                  : 'Every day counts. You\'ve got this!'}
            </Text>
          </View>
          <View style={styles.streakCount}>
            <Text style={styles.streakNum}>{healthStreak}</Text>
            <Text style={styles.streakNumLabel}>days</Text>
          </View>
        </View>
      ) : null}

      {weightTrendCard}
      {todayPlanCard}
      {weeklyCalCard}

      {consumed > 0 ? (
        <View style={styles.macroCard}>
          {macroRows}
          <View style={[styles.cardActions, { flexDirection: 'column' }]}>
            <View
              accessible
              accessibilityRole="button"
              accessibilityLabel="Open Food Diary"
              style={[styles.cardBtn, styles.cardBtnPrimary]}
            >
              <Text
                style={styles.cardBtnPrimaryText}
                onPress={() => router.navigate('/(tabs)/diary')}
              >
                Open Food Diary
              </Text>
            </View>
            <View
              accessible
              accessibilityRole="button"
              accessibilityLabel="View Daily Summary"
              style={[styles.cardBtnSecondary, { marginTop: WEB_TOKENS.spacing.sm }]}
            >
              <Text
                style={styles.cardBtnSecondaryText}
                onPress={() => router.push('/summary' as any)}
              >
                View Daily Summary
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyMealsCard}>
          <View
            accessible
            accessibilityRole="button"
            accessibilityLabel="Start your food diary"
            onTouchEnd={() => router.navigate('/(tabs)/diary')}
          >
            <Text style={styles.emptyMealsIcon}>🍽️</Text>
            <Text style={styles.emptyMealsHeading}>No meals logged today</Text>
            <Text style={styles.emptyMealsSub}>Tap to start your food diary</Text>
            <View style={styles.emptyMealsBtn}>
              <Text style={styles.emptyMealsBtnText}>Log Your First Meal</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trackers</Text>
        {waterTrackers}
      </View>

      {achievementsRow}

      <QuickActionGrid />

      {coachInsightCard}

      <View style={styles.mobileSection}>
        <ScienceTipCard tip={dailyTip} />
      </View>

      <View style={styles.mobileArticlesCard}>
        <View style={styles.articlesRow}>
          <Text style={styles.articlesBook}>📚</Text>
          <Text style={styles.articlesLabel}>Science Articles</Text>
          <Text style={styles.articlesArrow}>4 articles →</Text>
        </View>
        <View
          onTouchEnd={() => router.push('/articles')}
          style={styles.articlesTouchArea}
        >
          <Text style={styles.articlesLink}>Browse all articles</Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: WEB_TOKENS.spacing.lg,
    maxWidth: WEB_TOKENS.contentWidths.desktop,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
  },
  scrollContentMobile: {
    padding: WEB_TOKENS.spacing.md,
  },
  greetingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: WEB_TOKENS.spacing.lg,
  },
  greeting: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.text,
  },
  greetingMobile: {
    marginBottom: WEB_TOKENS.spacing.md,
    paddingHorizontal: WEB_TOKENS.spacing.sm,
  },
  date: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: 2,
  },
  calSummary: {
    alignItems: 'flex-end',
  },
  calValue: {
    ...WEB_TOKENS.typography.display,
    color: WEB_TOKENS.colors.primary,
  },
  calLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  calSub: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  streakCard: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRadius: WEB_TOKENS.radii.md,
    borderColor: WEB_TOKENS.colors.border,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.md,
    marginBottom: WEB_TOKENS.spacing.lg,
    padding: WEB_TOKENS.spacing.lg,
    ...WEB_TOKENS.shadows.card,
  },
  streakIcon: {
    fontSize: 24,
  },
  streakTextWrap: {
    flex: 1,
  },
  streakTitle: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
  },
  streakSub: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  streakCount: {
    alignItems: 'center',
  },
  streakNum: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F59E0B',
  },
  streakNumLabel: {
    fontSize: 11,
    color: WEB_TOKENS.colors.textMuted,
  },
  twoCol: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.lg,
  },
  leftCol: {
    flex: 1,
    gap: WEB_TOKENS.spacing.lg,
  },
  rightCol: {
    flex: 1,
    gap: WEB_TOKENS.spacing.lg,
  },
  macroRow: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.md,
    flexWrap: 'wrap',
  },
  macroCard: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRadius: WEB_TOKENS.radii.md,
    borderColor: WEB_TOKENS.colors.border,
    borderWidth: 1,
    gap: WEB_TOKENS.spacing.md,
    padding: WEB_TOKENS.spacing.lg,
    ...WEB_TOKENS.shadows.card,
  },
  cardActions: {
    gap: WEB_TOKENS.spacing.sm,
    marginTop: WEB_TOKENS.spacing.sm,
  },
  cardBtn: {
    alignItems: 'center',
    borderRadius: WEB_TOKENS.radii.md,
    paddingVertical: WEB_TOKENS.spacing.sm,
    paddingHorizontal: WEB_TOKENS.spacing.md,
  },
  cardBtnPrimary: {
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  cardBtnPrimaryText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.surface,
  },
  cardBtnSecondary: {
    backgroundColor: '#EFF6FF',
  },
  cardBtnSecondaryText: {
    ...WEB_TOKENS.typography.label,
    color: '#3B82F6',
  },
  emptyMealsCard: {
    alignItems: 'center',
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRadius: WEB_TOKENS.radii.md,
    borderColor: WEB_TOKENS.colors.border,
    borderWidth: 1,
    padding: WEB_TOKENS.spacing.xl,
    ...WEB_TOKENS.shadows.card,
  },
  emptyMealsIcon: {
    fontSize: 36,
    textAlign: 'center',
  },
  emptyMealsHeading: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    marginTop: WEB_TOKENS.spacing.md,
    textAlign: 'center',
  },
  emptyMealsSub: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyMealsBtn: {
    alignItems: 'center',
    backgroundColor: WEB_TOKENS.colors.primary,
    borderRadius: WEB_TOKENS.radii.md,
    marginTop: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm,
    paddingHorizontal: WEB_TOKENS.spacing.lg,
  },
  emptyMealsBtnText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.surface,
  },
  trackerRow: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.md,
    flexWrap: 'wrap',
  },
  section: {
    gap: WEB_TOKENS.spacing.sm,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: WEB_TOKENS.spacing.xs,
  },
  sectionTitle: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
  },
  achBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: WEB_TOKENS.spacing.sm,
    paddingVertical: 2,
  },
  achBadgeText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '600',
  },
  achRow: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRadius: WEB_TOKENS.radii.md,
    borderColor: WEB_TOKENS.colors.border,
    borderWidth: 1,
    flexDirection: 'row',
    padding: WEB_TOKENS.spacing.lg,
    ...WEB_TOKENS.shadows.card,
  },
  achItem: {
    alignItems: 'center',
    flex: 1,
  },
  achIcon: {
    fontSize: 28,
  },
  achName: {
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  achMoreIcon: {
    fontSize: 20,
    opacity: 0.4,
  },
  achMore: {
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    opacity: 0.4,
  },
  tipWrapper: {
    marginTop: 0,
  },
  articlesCard: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRadius: WEB_TOKENS.radii.md,
    borderColor: WEB_TOKENS.colors.border,
    borderWidth: 1,
    padding: WEB_TOKENS.spacing.lg,
    ...WEB_TOKENS.shadows.card,
  },
  articlesRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
  },
  articlesBook: {
    fontSize: 20,
  },
  articlesLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    flex: 1,
  },
  articlesArrow: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  articlesTouchArea: {
    marginTop: WEB_TOKENS.spacing.sm,
  },
  articlesLink: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 12,
  },
  mobileGreeting: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  mobileSection: {
    marginTop: WEB_TOKENS.spacing.md,
  },
  mobileArticlesCard: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRadius: WEB_TOKENS.radii.md,
    borderColor: WEB_TOKENS.colors.border,
    borderWidth: 1,
    marginTop: WEB_TOKENS.spacing.lg,
    padding: WEB_TOKENS.spacing.lg,
    ...WEB_TOKENS.shadows.card,
  },
  bottomSpacer: {
    height: WEB_TOKENS.spacing.xxl,
  },
  trendCard: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRadius: WEB_TOKENS.radii.md,
    borderColor: WEB_TOKENS.colors.border,
    borderWidth: 1,
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.lg,
    padding: WEB_TOKENS.spacing.lg,
    ...WEB_TOKENS.shadows.card,
  },
  trendMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
  },
  trendValue: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
  },
  trendChange: {
    ...WEB_TOKENS.typography.label,
    fontSize: 12,
  },
  caption: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
  planItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    paddingVertical: WEB_TOKENS.spacing.xs,
  },
  planCheck: {
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  planCheckDone: {
    color: WEB_TOKENS.colors.primary,
  },
  planItemText: {
    flex: 1,
  },
  planItemLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    fontSize: 12,
  },
  planItemDone: {
    color: WEB_TOKENS.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  planItemDesc: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  coachHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
  },
  coachEmoji: {
    fontSize: 22,
  },
  coachRec: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginTop: WEB_TOKENS.spacing.xs,
  },
  coachReason: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  coachAction: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 12,
    fontWeight: '600',
  },
  coachActions: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    marginTop: WEB_TOKENS.spacing.xs,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 10,
    width: 28,
    textAlign: 'center',
  },
});
