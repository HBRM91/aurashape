import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '@/src/constants/theme';
import { useWaterStore } from '@/src/stores/water';
import { Drop } from 'phosphor-react-native';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function WaterTracker({ compact }: { compact?: boolean }) {
  const today = todayStr();
  const waterMl = useWaterStore((s) => s.waterMl[today] || 0);
  const addWater = useWaterStore((s) => s.addWater);
  const target = 2000;
  const pct = Math.min(waterMl / target, 1);

  const handleAdd = () => addWater(today, 250);
  const handleCustom = () => addWater(today, 250);

  if (compact) {
    return (
      <TouchableOpacity
        onPress={handleAdd}
        className="flex-1 bg-blue-50 rounded-xl p-4 items-center"
      >
        <Drop size={24} color={COLORS.secondary} weight="fill" />
        <Text className="text-sm font-bold text-gray-700 mt-2">{Math.round(pct * 100)}%</Text>
        <Text className="text-xs text-gray-400">{waterMl}/{target}ml</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-white rounded-2xl border border-gray-100 p-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Drop size={20} color={COLORS.secondary} weight="fill" />
          <Text className="text-sm font-bold text-gray-700">Water</Text>
        </View>
        <Text className="text-sm font-semibold text-gray-500">
          {waterMl} / {target} ml
        </Text>
      </View>
      <View className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct * 100}%`, backgroundColor: COLORS.secondary }}
        />
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={handleAdd}
          className="flex-1 py-2.5 rounded-xl bg-blue-50 items-center"
        >
          <Text className="text-sm font-semibold" style={{ color: COLORS.secondary }}>
            +250ml
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCustom} className="flex-1 py-2.5 rounded-xl bg-gray-50 items-center">
          <Text className="text-sm font-semibold text-gray-500">Custom</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function HabitTrackers({ compact }: { compact?: boolean }) {
  const today = todayStr();
  const fruitCount = useWaterStore((s) => s.fruitCount[today] || 0);
  const vegCount = useWaterStore((s) => s.vegCount[today] || 0);
  const addFruit = useWaterStore((s) => s.addFruit);
  const addVeg = useWaterStore((s) => s.addVeg);
  const fruitTarget = 3;
  const vegTarget = 5;

  if (compact) {
    return (
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => addFruit(today)}
          className="flex-1 bg-orange-50 rounded-xl py-2.5 px-3 flex-row items-center justify-center gap-1.5"
        >
          <Text className="text-sm">🍎</Text>
          <Text className="text-xs font-semibold text-gray-600">
            {fruitCount}/{fruitTarget}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => addVeg(today)}
          className="flex-1 bg-green-50 rounded-xl py-2.5 px-3 flex-row items-center justify-center gap-1.5"
        >
          <Text className="text-sm">🥬</Text>
          <Text className="text-xs font-semibold text-gray-600">
            {vegCount}/{vegTarget}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row gap-3">
      <View className="flex-1 bg-orange-50 rounded-xl p-4 items-center">
        <Text className="text-2xl mb-1">🍎</Text>
        <Text className="text-sm font-bold text-gray-700">{fruitCount} / {fruitTarget}</Text>
        <Text className="text-xs text-gray-400 mt-0.5">Fruits</Text>
        <TouchableOpacity
          onPress={() => addFruit(today)}
          className="mt-2 px-3 py-1 rounded-full bg-white"
        >
          <Text className="text-xs font-semibold text-orange-500">+1</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-1 bg-green-50 rounded-xl p-4 items-center">
        <Text className="text-2xl mb-1">🥬</Text>
        <Text className="text-sm font-bold text-gray-700">{vegCount} / {vegTarget}</Text>
        <Text className="text-xs text-gray-400 mt-0.5">Veggies</Text>
        <TouchableOpacity
          onPress={() => addVeg(today)}
          className="mt-2 px-3 py-1 rounded-full bg-white"
        >
          <Text className="text-xs font-semibold text-green-500">+1</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
