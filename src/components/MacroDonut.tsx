import { View, Text } from 'react-native';
import { Circle } from 'react-native-svg';
import { MACRO_COLORS } from '@/src/constants/theme';

interface DonutChartProps {
  protein: number;
  carbs: number;
  fat: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  totalCalories: number;
  calorieTarget: number;
}

export function MacroDonut({
  protein,
  carbs,
  fat,
  proteinTarget,
  carbsTarget,
  fatTarget,
  totalCalories,
  calorieTarget,
}: DonutChartProps) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const proteinCal = protein * 4;
  const carbsCal = carbs * 4;
  const fatCal = fat * 9;

  const proteinPct = calorieTarget > 0 ? Math.min(proteinCal / calorieTarget, 1) : 0;
  const carbsPct = calorieTarget > 0 ? Math.min(carbsCal / calorieTarget, 1) : 0;
  const fatPct = calorieTarget > 0 ? Math.min(fatCal / calorieTarget, 1) : 0;

  const proteinDash = circumference * proteinPct;
  const carbsDash = circumference * carbsPct;
  const fatDash = circumference * fatPct;

  return (
    <View className="items-center">
      <View className="relative items-center justify-center">
        {/* Background circle */}
        <Circle
          cx="52"
          cy="52"
          r={radius}
          stroke="#F3F4F6"
          strokeWidth="10"
          fill="none"
        />
        {/* Protein arc */}
        {proteinPct > 0 && (
          <Circle
            cx="52"
            cy="52"
            r={radius}
            stroke={MACRO_COLORS.protein}
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${proteinDash} ${circumference - proteinDash}`}
            strokeLinecap="butt"
            rotation="-90"
            origin="52, 52"
          />
        )}
        {/* Carbs arc */}
        {carbsPct > 0 && (
          <Circle
            cx="52"
            cy="52"
            r={radius}
            stroke={MACRO_COLORS.carbs}
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${carbsDash} ${circumference - carbsDash}`}
            strokeLinecap="butt"
            rotation={-90 + (proteinPct * 360)}
            origin="52, 52"
          />
        )}
        {/* Fat arc */}
        {fatPct > 0 && (
          <Circle
            cx="52"
            cy="52"
            r={radius}
            stroke={MACRO_COLORS.fat}
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${fatDash} ${circumference - fatDash}`}
            strokeLinecap="butt"
            rotation={-90 + ((proteinPct + carbsPct) * 360)}
            origin="52, 52"
          />
        )}
        <View className="absolute items-center">
          <Text className="text-lg font-bold text-gray-800">{Math.round(totalCalories)}</Text>
          <Text className="text-xs text-gray-400">of {calorieTarget}</Text>
        </View>
      </View>

      <View className="flex-row gap-4 mt-3">
        <Legend color={MACRO_COLORS.protein} label="Protein" value={protein} target={proteinTarget} />
        <Legend color={MACRO_COLORS.carbs} label="Carbs" value={carbs} target={carbsTarget} />
        <Legend color={MACRO_COLORS.fat} label="Fat" value={fat} target={fatTarget} />
      </View>
    </View>
  );
}

function Legend({
  color,
  label,
  value,
  target,
}: {
  color: string;
  label: string;
  value: number;
  target: number;
}) {
  return (
    <View className="items-center">
      <View className="flex-row items-center gap-1 mb-0.5">
        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <Text className="text-xs text-gray-400">{label}</Text>
      </View>
      <Text className="text-xs font-bold text-gray-600">
        {Math.round(value)}/{Math.round(target)}g
      </Text>
    </View>
  );
}
