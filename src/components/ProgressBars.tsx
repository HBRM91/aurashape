import { View, Text } from 'react-native';
import { COLORS, MACRO_COLORS } from '@/src/constants/theme';

function barColor(pct: number): string {
  if (pct < 0.9) return COLORS.success;
  if (pct <= 1) return COLORS.warning;
  return COLORS.error;
}

export function CalorieProgressBar({ consumed, target }: { consumed: number; target: number }) {
  const pct = target > 0 ? Math.min(consumed / target, 1.5) : 0;
  const barWidth = Math.min(pct * 100, 100);
  const remaining = Math.max(target - consumed, 0);

  return (
    <View className="px-4 pt-4 pb-2">
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm font-semibold text-gray-700">Calories</Text>
        <Text className="text-sm font-bold" style={{ color: barColor(pct) }}>
          {Math.round(consumed)} / {target}
        </Text>
      </View>
      <View className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${barWidth}%`,
            backgroundColor: barColor(pct),
          }}
        />
      </View>
      {remaining > 0 && (
        <Text className="text-xs text-gray-400 mt-1 text-right">{remaining} kcal remaining</Text>
      )}
      {consumed > target && (
        <Text className="text-xs mt-1 text-right" style={{ color: COLORS.error }}>
          {Math.round(consumed - target)} kcal over
        </Text>
      )}
    </View>
  );
}

export function MacroBars({
  protein,
  proteinTarget,
  carbs,
  carbsTarget,
  fat,
  fatTarget,
}: {
  protein: number;
  proteinTarget: number;
  carbs: number;
  carbsTarget: number;
  fat: number;
  fatTarget: number;
}) {
  return (
    <View className="px-4 flex-row gap-2">
      <MacroBar
        label="Protein"
        consumed={protein}
        target={proteinTarget}
        color={MACRO_COLORS.protein}
        unit="g"
      />
      <MacroBar
        label="Carbs"
        consumed={carbs}
        target={carbsTarget}
        color={MACRO_COLORS.carbs}
        unit="g"
      />
      <MacroBar
        label="Fat"
        consumed={fat}
        target={fatTarget}
        color={MACRO_COLORS.fat}
        unit="g"
      />
    </View>
  );
}

function MacroBar({
  label,
  consumed,
  target,
  color,
  unit,
}: {
  label: string;
  consumed: number;
  target: number;
  color: string;
  unit: string;
}) {
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  return (
    <View className="flex-1">
      <View className="flex-row justify-between mb-1">
        <Text className="text-xs font-medium text-gray-500">{label}</Text>
        <Text className="text-xs font-semibold" style={{ color }}>
          {Math.round(consumed)}/{target}{unit}
        </Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}
