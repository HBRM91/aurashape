import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { usePlanStore } from '@/src/stores/plan';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { WebCard } from './WebCard';
import { WebButton } from './WebButton';
import { WEB_TOKENS } from './tokens';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]} ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

export function WeeklyPlan() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const currentPlan = usePlanStore((s) => s.currentPlan);
  const completion = usePlanStore((s) => s.getWeeklyCompletion());
  const toggleMeal = usePlanStore((s) => s.toggleMeal);
  const toggleWorkout = usePlanStore((s) => s.toggleWorkout);
  const toggleFasting = usePlanStore((s) => s.toggleFasting);
  const toggleRecovery = usePlanStore((s) => s.toggleRecovery);
  const generatePlan = usePlanStore((s) => s.generatePlan);
  const onboarding = useOnboardingStore();
  const goal = onboarding.goal || 'general';

  if (currentPlan.length === 0) {
    return (
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Your Weekly Plan</Text>
          <Text style={styles.pageSubtitle}>Generate a personalized plan based on your goals</Text>
        </View>
        <View style={styles.emptyWrap}>
          <WebCard style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyHeading}>No active plan</Text>
            <Text style={styles.emptySub}>
              Create a week-long plan with meals, workouts, fasting and recovery actions tailored to your goal.
            </Text>
            <View style={styles.emptyBtnWrap}>
              <WebButton label="Generate My Plan" onPress={() => generatePlan(goal)} variant="primary" />
            </View>
          </WebCard>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Your Weekly Plan</Text>
          <View style={styles.completionBadge}>
            <Text style={styles.completionPct}>{completion}%</Text>
            <Text style={styles.completionLabel}>complete</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${completion}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
          {currentPlan.map((day) => {
            const today = isToday(day.date);
            return (
              <WebCard key={day.date} style={[styles.dayCard, today ? styles.todayCard : undefined]}>
                <View style={styles.dayHeader}>
                  <View style={styles.dayTitleRow}>
                    <Text style={styles.dayIcon}>📅</Text>
                    <Text style={[styles.dayDate, today ? styles.todayDate : undefined]}>
                      {formatDate(day.date)}
                    </Text>
                    {today && <Text style={styles.todayLabel}>TODAY</Text>}
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>🥗 Meals</Text>
                  {day.meals.map((meal, mi) => (
                    <TouchableOpacity
                      key={meal.slot}
                      onPress={() => toggleMeal(day.date, mi)}
                      style={styles.checkRow}
                      accessibilityRole="checkbox"
                      accessibilityLabel={`${meal.slot}: ${meal.description}`}
                      accessibilityState={{ checked: meal.completed }}
                    >
                      <View style={[styles.checkbox, meal.completed ? styles.checkboxDone : undefined]}>
                        {meal.completed && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.checkTextWrap}>
                        <Text style={[styles.checkLabel, meal.completed ? styles.checkLabelDone : undefined]}>
                          {meal.slot}
                        </Text>
                        <Text style={styles.checkDesc} numberOfLines={2}>{meal.description}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.section}>
                  <TouchableOpacity
                    onPress={() => toggleWorkout(day.date)}
                    style={styles.checkRow}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Workout: ${day.workout.name}`}
                    accessibilityState={{ checked: day.workout.completed }}
                  >
                    <View style={[styles.checkbox, day.workout.completed ? styles.checkboxDone : undefined]}>
                      {day.workout.completed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.checkTextWrap}>
                      <Text style={[styles.checkLabel, day.workout.completed ? styles.checkLabelDone : undefined]}>
                        🏋️ Workout
                      </Text>
                      <Text style={styles.checkDesc} numberOfLines={2}>{day.workout.name}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.section}>
                  <TouchableOpacity
                    onPress={() => toggleFasting(day.date)}
                    style={styles.checkRow}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Fasting: ${day.fasting.plan}`}
                    accessibilityState={{ checked: day.fasting.completed }}
                  >
                    <View style={[styles.checkbox, day.fasting.completed ? styles.checkboxDone : undefined]}>
                      {day.fasting.completed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.checkTextWrap}>
                      <Text style={[styles.checkLabel, day.fasting.completed ? styles.checkLabelDone : undefined]}>
                        ⏱️ Fasting
                      </Text>
                      <Text style={styles.checkDesc}>{day.fasting.plan} plan</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.section}>
                  <View style={styles.hydrationRow}>
                    <Text style={styles.hydrationIcon}>💧</Text>
                    <View style={styles.hydrationTextWrap}>
                      <Text style={styles.checkLabel}>Hydration</Text>
                      <Text style={styles.checkDesc}>{day.hydration.currentMl} / {day.hydration.targetMl} ml</Text>
                    </View>
                  </View>
                  <View style={styles.hydrationBar}>
                    <View
                      style={[
                        styles.hydrationFill,
                        { width: `${Math.min(100, (day.hydration.currentMl / day.hydration.targetMl) * 100)}%` },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.section}>
                  <TouchableOpacity
                    onPress={() => toggleRecovery(day.date)}
                    style={styles.checkRow}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Recovery: ${day.recovery.action}`}
                    accessibilityState={{ checked: day.recovery.completed }}
                  >
                    <View style={[styles.checkbox, day.recovery.completed ? styles.checkboxDone : undefined]}>
                      {day.recovery.completed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.checkTextWrap}>
                      <Text style={[styles.checkLabel, day.recovery.completed ? styles.checkLabelDone : undefined]}>
                        🧘 Recovery
                      </Text>
                      <Text style={styles.checkDesc} numberOfLines={2}>{day.recovery.action}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </WebCard>
            );
          })}
        </View>
        <View style={{ height: WEB_TOKENS.spacing.xxl }} />
      </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.text,
  },
  pageSubtitle: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: 4,
  },
  completionBadge: {
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.md,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm,
    alignItems: 'center',
  },
  completionPct: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.primary,
    fontSize: 20,
    lineHeight: 24,
  },
  completionLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 11,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: WEB_TOKENS.colors.secondary,
    overflow: 'hidden',
    marginTop: WEB_TOKENS.spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  scroll: {
    flex: 1,
  },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    gap: WEB_TOKENS.spacing.md,
  },
  mobileStack: {
    paddingHorizontal: WEB_TOKENS.spacing.md,
    gap: WEB_TOKENS.spacing.md,
  },
  dayCard: {
    width: '100%',
    gap: WEB_TOKENS.spacing.sm,
  },
  todayCard: {
    borderColor: WEB_TOKENS.colors.primary,
    borderWidth: 2,
  },
  dayHeader: {
    marginBottom: WEB_TOKENS.spacing.xs,
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.sm,
  },
  dayIcon: {
    fontSize: 18,
  },
  dayDate: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    fontSize: 18,
    lineHeight: 24,
    flex: 1,
  },
  todayDate: {
    color: WEB_TOKENS.colors.primary,
    fontWeight: '700',
  },
  todayLabel: {
    backgroundColor: WEB_TOKENS.colors.primary,
    borderRadius: WEB_TOKENS.radii.pill,
    color: WEB_TOKENS.colors.surface,
    ...WEB_TOKENS.typography.label,
    fontSize: 10,
    paddingHorizontal: WEB_TOKENS.spacing.sm,
    paddingVertical: 2,
  },
  section: {
    gap: WEB_TOKENS.spacing.xs,
  },
  sectionLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    marginBottom: 2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: WEB_TOKENS.spacing.sm,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: WEB_TOKENS.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxDone: {
    backgroundColor: WEB_TOKENS.colors.primary,
    borderColor: WEB_TOKENS.colors.primary,
  },
  checkmark: {
    color: WEB_TOKENS.colors.surface,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 15,
  },
  checkTextWrap: {
    flex: 1,
  },
  checkLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
  },
  checkLabelDone: {
    color: WEB_TOKENS.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  checkDesc: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 1,
  },
  hydrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.sm,
  },
  hydrationIcon: {
    fontSize: 16,
  },
  hydrationTextWrap: {
    flex: 1,
  },
  hydrationBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: WEB_TOKENS.colors.secondary,
    overflow: 'hidden',
    marginTop: 4,
  },
  hydrationFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#0EA5E9',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    paddingBottom: WEB_TOKENS.spacing.xxl,
  },
  emptyCard: {
    alignItems: 'center',
    maxWidth: 480,
    padding: WEB_TOKENS.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  emptyHeading: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    textAlign: 'center',
  },
  emptySub: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    textAlign: 'center',
    marginTop: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.lg,
  },
  emptyBtnWrap: {
    alignItems: 'center',
  },
});
