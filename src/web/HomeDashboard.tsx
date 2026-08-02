import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { WEB_TOKENS } from './tokens';
import { useAuthStore } from '@/src/stores/auth';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useDiaryStore } from '@/src/stores/diary';
import { useAchievementsStore } from '@/src/stores/achievements';
import { useWaterStore } from '@/src/stores/water';
import { DAILY_TIPS } from '@/src/lib/tips';
import { MetricCard } from './MetricCard';
import { ScienceTipCard } from './ScienceTipCard';
import { QuickActionGrid } from './QuickActionGrid';

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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trackers</Text>
              {waterTrackers}
            </View>

            {achievementsRow}
          </View>

          <View style={styles.rightCol}>
            <QuickActionGrid />

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
});
