import { View, Text, ScrollView, TouchableOpacity, Share } from 'react-native';
import { COLORS } from '@/src/constants/theme';
import { useDiaryStore } from '@/src/stores/diary';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useWaterStore } from '@/src/stores/water';
import { useFastingStore } from '@/src/stores/fasting';
import { useWorkoutStore } from '@/src/stores/workout';
import { useMeditationStore } from '@/src/stores/meditation';
import { useThemeColors } from '@/src/stores/theme';
import {
  Barbell,
  Fire,
  Cube,
  Drop,
  Clock,
  Brain,
  CalendarBlank,
  ShareNetwork,
  ForkKnife,
} from 'phosphor-react-native';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function DailySummaryScreen() {
  const onboarding = useOnboardingStore();
  const { getDailyCalories, getDailyMacros, getEntriesBySlot } = useDiaryStore();
  const waterMl = useWaterStore((s) => s.waterMl[todayStr()] || 0);
  const colors = useThemeColors();
  const fasting = useFastingStore();
  const workout = useWorkoutStore();
  const meditation = useMeditationStore();

  const today = todayStr();
  const calorieTarget = onboarding.calorieTarget || 2000;
  const proteinTarget = onboarding.proteinTargetG || 100;
  const carbsTarget = onboarding.carbsTargetG || 250;
  const fatTarget = onboarding.fatTargetG || 55;
  const waterTarget = 2000;

  const consumed = getDailyCalories(today);
  const macros = getDailyMacros(today);

  const totalMeals = (['breakfast', 'lunch', 'dinner', 'snack'] as const)
    .reduce((sum, slot) => sum + getEntriesBySlot(today, slot).length, 0);

  const activeFasting = fasting.activeSession;
  const activeWorkout = workout.activeWorkout;
  const todayMeditation = meditation.sessions
    .filter((s) => s.completedAt.slice(0, 10) === today)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const shareSummary = async () => {
    const text = `📊 Aurashape Daily Summary — ${today}

🍽️ Calories: ${consumed} / ${calorieTarget} kcal
🥩 Protein: ${macros.protein} / ${proteinTarget}g
🍞 Carbs: ${macros.carbs} / ${carbsTarget}g
🧈 Fat: ${macros.fat} / ${fatTarget}g
💧 Water: ${waterMl} / ${waterTarget}ml
🍎 Meals logged: ${totalMeals}

${activeFasting ? `⏱️ Fasting: In progress (${fasting.currentPlan})` : ''}
${activeWorkout ? `🏋️ Workout: Active` : ''}
${todayMeditation > 0 ? `🧘 Meditation: ${todayMeditation} min today` : ''}

Track your health with Aurashape →`;

    try {
      await Share.share({ message: text });
    } catch {}
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bgSecondary }}>
      <View
        className="px-4 pt-6 pb-4 border-b flex-row justify-between items-center"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      >
        <View>
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>Daily Summary</Text>
          <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>{today}</Text>
        </View>
        <TouchableOpacity
          onPress={shareSummary}
          className="bg-green-500 px-4 py-2 rounded-xl flex-row items-center"
        >
          <ShareNetwork size={16} color="#FFF" weight="fill" />
          <Text className="text-white text-sm font-bold ml-1.5">Share</Text>
        </TouchableOpacity>
      </View>

      <View className="px-4 mt-4">
        <View
          className="rounded-2xl border p-5 mb-4"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <View className="flex-row items-center mb-4">
            <Fire size={20} color="#F59E0B" weight="fill" />
            <Text className="text-base font-bold ml-2" style={{ color: colors.text }}>Calories & Macros</Text>
          </View>

          <View className="mb-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Calories</Text>
              <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                {consumed} / {calorieTarget} kcal
              </Text>
            </View>
            <View className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgInput }}>
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (consumed / Math.max(calorieTarget, 1)) * 100)}%`,
                  backgroundColor: consumed <= calorieTarget ? COLORS.primary : COLORS.error,
                }}
              />
            </View>
          </View>

          <View className="flex-row gap-3 mt-3">
            <MacroStat
              label="Protein"
              value={macros.protein}
              target={proteinTarget}
              unit="g"
              color="#3B82F6"
              icon={<Barbell size={14} color="#3B82F6" weight="fill" />}
              colors={colors}
            />
            <MacroStat
              label="Carbs"
              value={macros.carbs}
              target={carbsTarget}
              unit="g"
              color="#EAB308"
              icon={<Cube size={14} color="#EAB308" weight="fill" />}
              colors={colors}
            />
            <MacroStat
              label="Fat"
              value={macros.fat}
              target={fatTarget}
              unit="g"
              color="#EC4899"
              icon={<Drop size={14} color="#EC4899" weight="fill" />}
              colors={colors}
            />
          </View>
        </View>

        <View
          className="rounded-2xl border p-5 mb-4"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <View className="flex-row items-center mb-4">
            <ForkKnife size={20} color={COLORS.primary} weight="fill" />
            <Text className="text-base font-bold ml-2" style={{ color: colors.text }}>Today's Habits</Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-blue-50 rounded-xl p-3 items-center">
              <Drop size={20} color="#3B82F6" weight="fill" />
              <Text className="text-lg font-bold text-blue-700 mt-1">{waterMl}ml</Text>
              <Text className="text-[10px] text-blue-500">Water</Text>
              <Text className="text-[10px] text-blue-400 mt-0.5">of {waterTarget}ml</Text>
            </View>
            <View className="flex-1 bg-purple-50 rounded-xl p-3 items-center">
              <Brain size={20} color="#8B5CF6" weight="fill" />
              <Text className="text-lg font-bold text-purple-700 mt-1">{todayMeditation}min</Text>
              <Text className="text-[10px] text-purple-500">Meditation</Text>
            </View>
            <View className="flex-1 bg-amber-50 rounded-xl p-3 items-center">
              <CalendarBlank size={20} color="#F59E0B" weight="fill" />
              <Text className="text-lg font-bold text-amber-700 mt-1">{totalMeals}</Text>
              <Text className="text-[10px] text-amber-500">Meals</Text>
            </View>
          </View>
        </View>

        {(activeFasting || activeWorkout) && (
          <View
            className="rounded-2xl border p-5 mb-4"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
          >
            <View className="flex-row items-center mb-4">
              <Clock size={20} color="#A855F7" weight="fill" />
              <Text className="text-base font-bold ml-2" style={{ color: colors.text }}>Active</Text>
            </View>

            {activeFasting && (
              <View
                className="flex-row items-center justify-between py-3 border-b"
                style={{ borderColor: colors.borderLight }}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center">
                    <Clock size={18} color="#A855F7" weight="fill" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Fasting</Text>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>{fasting.currentPlan} plan active</Text>
                  </View>
                </View>
                <View className="bg-purple-50 px-3 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-purple-600">In Progress</Text>
                </View>
              </View>
            )}

            {activeWorkout && (
              <View className="flex-row items-center justify-between py-3">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-orange-50 items-center justify-center">
                    <Barbell size={18} color="#F97316" weight="fill" />
                  </View>
                  <View className="ml-3">
                    <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>Workout</Text>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>
                      {activeWorkout.exercises.length} exercises · {workout.getElapsedMinutes()} min
                    </Text>
                  </View>
                </View>
                <View className="bg-orange-50 px-3 py-1 rounded-full">
                  <Text className="text-xs font-semibold text-orange-600">In Progress</Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View
          className="rounded-2xl border p-5 mb-8"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <Text className="text-base font-bold mb-3" style={{ color: colors.text }}>Scorecard</Text>
          <View className="gap-2">
            <ScoreRow label="Calories within target" done={consumed >= calorieTarget * 0.75 && consumed <= calorieTarget * 1.05} colors={colors} />
            <ScoreRow label="Protein goal hit (80%+)" done={macros.protein >= proteinTarget * 0.8} colors={colors} />
            <ScoreRow label="Water intake (50%+)" done={waterMl >= waterTarget * 0.5} colors={colors} />
            <ScoreRow label="Meals logged (3+)" done={totalMeals >= 3} colors={colors} />
            <ScoreRow label="Meditation done" done={todayMeditation > 0} colors={colors} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function MacroStat({
  label, value, target, unit, color, icon, colors,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  icon: React.ReactNode;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const pct = Math.min(100, (value / Math.max(target, 1)) * 100);
  return (
    <View className="flex-1">
      <View className="flex-row items-center gap-1 mb-1">
        {icon}
        <Text className="text-xs" style={{ color: colors.textSecondary }}>{label}</Text>
      </View>
      <View className="h-2 rounded-full overflow-hidden mb-1" style={{ backgroundColor: colors.bgInput }}>
        <View className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </View>
      <Text className="text-xs" style={{ color: colors.textSecondary }}>
        <Text className="font-semibold" style={{ color: colors.textSecondary }}>{value}</Text> / {target}{unit}
      </Text>
    </View>
  );
}

function ScoreRow({
  label, done, colors,
}: {
  label: string;
  done: boolean;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View
      className="flex-row items-center justify-between py-2 border-b"
      style={{ borderColor: colors.borderLight }}
    >
      <Text className="text-sm" style={{ color: colors.textSecondary }}>{label}</Text>
      <View
        className="w-6 h-6 rounded-full items-center justify-center"
        style={{ backgroundColor: done ? undefined : colors.bgInput }}
      >
        <Text className={done ? 'text-green-600' : ''} style={done ? undefined : { color: colors.textMuted }}>
          {done ? '✓' : '—'}
        </Text>
      </View>
    </View>
  );
}
