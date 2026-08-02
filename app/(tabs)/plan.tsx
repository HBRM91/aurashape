import { Platform } from 'react-native';
import { WeeklyPlan } from '@/src/web/WeeklyPlan';
import { useEffect } from 'react';
import { trackScreen } from '@/src/lib/analytics';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { usePlanStore } from '@/src/stores/plan';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useThemeColors } from '@/src/stores/theme';
import { COLORS } from '@/src/constants/theme';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${DAY_NAMES[d.getDay()]} ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

export default function PlanScreen() {
  useEffect(() => { trackScreen('plan'); }, []);

  if (Platform.OS === 'web') return <WeeklyPlan />;

  const colors = useThemeColors();
  const currentPlan = usePlanStore((s) => s.currentPlan);
  const completion = usePlanStore((s) => s.getWeeklyCompletion());
  const toggleMeal = usePlanStore((s) => s.toggleMeal);
  const toggleWorkout = usePlanStore((s) => s.toggleWorkout);
  const toggleFasting = usePlanStore((s) => s.toggleFasting);
  const toggleRecovery = usePlanStore((s) => s.toggleRecovery);
  const generatePlan = usePlanStore((s) => s.generatePlan);
  const resetPlan = usePlanStore((s) => s.resetPlan);
  const onboarding = useOnboardingStore();
  const goal = onboarding.goal || 'general';

  if (currentPlan.length === 0) {
    return (
      <ScrollView className="flex-1" style={{ backgroundColor: colors.bgSecondary }}>
        <View className="px-4 pt-6 pb-2">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>Weekly Plan</Text>
          <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            Generate a personalized plan based on your goals
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-8 pb-20">
          <Text style={{ fontSize: 56 }}>📋</Text>
          <Text className="text-base font-bold mt-4 text-center" style={{ color: colors.text }}>
            No active plan
          </Text>
          <Text className="text-sm text-center mt-2" style={{ color: colors.textMuted }}>
            Create a week-long plan with meals, workouts, fasting and recovery actions tailored to your goal.
          </Text>
          <TouchableOpacity
            onPress={() => generatePlan(goal)}
            className="mt-6 px-8 py-4 rounded-2xl"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="text-white text-base font-bold">Generate My Plan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bgSecondary }}>
      <View className="px-4 pt-6 pb-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>Weekly Plan</Text>
          <TouchableOpacity onPress={resetPlan} className="px-3 py-1 rounded-full bg-red-50">
            <Text className="text-xs font-semibold text-red-500">Reset</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-3 mt-3">
          <View className="flex-1 h-2 rounded-full" style={{ backgroundColor: colors.bgInput }}>
            <View
              className="h-2 rounded-full"
              style={{ width: `${completion}%`, backgroundColor: COLORS.primary }}
            />
          </View>
          <Text className="text-sm font-bold" style={{ color: COLORS.primary }}>{completion}%</Text>
        </View>
      </View>

      <View className="px-4 pb-8">
        <View className="flex-col gap-3">
          {currentPlan.map((day) => {
            const today = isToday(day.date);
            return (
              <View
                key={day.date}
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: colors.bgCard,
                  borderColor: today ? COLORS.primary : colors.border,
                  borderWidth: today ? 2 : 1,
                }}
              >
                <View className="flex-row items-center mb-3">
                  <Text className="text-lg mr-2">📅</Text>
                  <Text className="text-base font-bold flex-1" style={{ color: today ? COLORS.primary : colors.text }}>
                    {formatDate(day.date)}
                  </Text>
                  {today && (
                    <View className="bg-green-100 px-2 py-0.5 rounded-full">
                      <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>TODAY</Text>
                    </View>
                  )}
                </View>

                <Text className="text-xs font-bold mb-2" style={{ color: colors.textMuted }}>🥗 Meals</Text>
                {day.meals.map((meal, mi) => (
                  <TouchableOpacity
                    key={meal.slot}
                    onPress={() => toggleMeal(day.date, mi)}
                    className="flex-row items-start py-1 gap-2"
                  >
                    <View
                      className="w-5 h-5 rounded-md border-2 items-center justify-center mt-0.5"
                      style={{
                        borderColor: meal.completed ? COLORS.primary : colors.border,
                        backgroundColor: meal.completed ? COLORS.primary : 'transparent',
                      }}
                    >
                      {meal.completed && <Text className="text-white text-xs font-bold">✓</Text>}
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: meal.completed ? colors.textMuted : colors.text, textDecorationLine: meal.completed ? 'line-through' : 'none' }}
                      >
                        {meal.slot}
                      </Text>
                      <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }} numberOfLines={2}>
                        {meal.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <View className="h-2" />
                <Text className="text-xs font-bold mb-1" style={{ color: colors.textMuted }}>🏋️ Workout</Text>
                <TouchableOpacity
                  onPress={() => toggleWorkout(day.date)}
                  className="flex-row items-start py-1 gap-2"
                >
                  <View
                    className="w-5 h-5 rounded-md border-2 items-center justify-center mt-0.5"
                    style={{
                      borderColor: day.workout.completed ? COLORS.primary : colors.border,
                      backgroundColor: day.workout.completed ? COLORS.primary : 'transparent',
                    }}
                  >
                    {day.workout.completed && <Text className="text-white text-xs font-bold">✓</Text>}
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: day.workout.completed ? colors.textMuted : colors.text, textDecorationLine: day.workout.completed ? 'line-through' : 'none' }}
                    >
                      {day.workout.name}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View className="h-2" />
                <Text className="text-xs font-bold mb-1" style={{ color: colors.textMuted }}>⏱️ Fasting</Text>
                <TouchableOpacity
                  onPress={() => toggleFasting(day.date)}
                  className="flex-row items-start py-1 gap-2"
                >
                  <View
                    className="w-5 h-5 rounded-md border-2 items-center justify-center mt-0.5"
                    style={{
                      borderColor: day.fasting.completed ? COLORS.primary : colors.border,
                      backgroundColor: day.fasting.completed ? COLORS.primary : 'transparent',
                    }}
                  >
                    {day.fasting.completed && <Text className="text-white text-xs font-bold">✓</Text>}
                  </View>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: day.fasting.completed ? colors.textMuted : colors.text, textDecorationLine: day.fasting.completed ? 'line-through' : 'none' }}
                  >
                    {day.fasting.plan} plan
                  </Text>
                </TouchableOpacity>

                <View className="h-2" />
                <Text className="text-xs font-bold mb-1" style={{ color: colors.textMuted }}>🧘 Recovery</Text>
                <TouchableOpacity
                  onPress={() => toggleRecovery(day.date)}
                  className="flex-row items-start py-1 gap-2"
                >
                  <View
                    className="w-5 h-5 rounded-md border-2 items-center justify-center mt-0.5"
                    style={{
                      borderColor: day.recovery.completed ? COLORS.primary : colors.border,
                      backgroundColor: day.recovery.completed ? COLORS.primary : 'transparent',
                    }}
                  >
                    {day.recovery.completed && <Text className="text-white text-xs font-bold">✓</Text>}
                  </View>
                  <Text
                    className="text-sm font-semibold flex-1"
                    style={{ color: day.recovery.completed ? colors.textMuted : colors.text, textDecorationLine: day.recovery.completed ? 'line-through' : 'none' }}
                    numberOfLines={2}
                  >
                    {day.recovery.action}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
      <View className="h-8" />
    </ScrollView>
  );
}
