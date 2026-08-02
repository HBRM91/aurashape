import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useDiaryStore } from '@/src/stores/diary';
import type { MealSlot, DiaryEntry } from '@/src/types';
import { Trash } from 'phosphor-react-native';

const SLOT_CONFIG: Record<MealSlot, { emoji: string; label: string }> = {
  breakfast: { emoji: '🌅', label: 'Breakfast' },
  lunch: { emoji: '☀️', label: 'Lunch' },
  dinner: { emoji: '🌙', label: 'Dinner' },
  snack: { emoji: '🍎', label: 'Snacks' },
};

export function MealSlotCard({
  slot,
  onAddPress,
}: {
  slot: MealSlot;
  onAddPress: (slot: MealSlot) => void;
}) {
  const { selectedDate, getEntriesBySlot, getSlotCalories, removeEntry } = useDiaryStore();
  const entries = getEntriesBySlot(selectedDate, slot);
  const calories = getSlotCalories(selectedDate, slot);
  const config = SLOT_CONFIG[slot];

  const handleDelete = (entry: DiaryEntry) => {
    Alert.alert('Remove', `Remove ${entry.food?.name || 'item'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeEntry(entry.id) },
    ]);
  };

  return (
    <View className="mx-4 mb-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">{config.emoji}</Text>
          <Text className="text-sm font-bold text-gray-700">{config.label}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          {calories > 0 && (
            <Text className="text-xs font-semibold text-gray-400">{calories} kcal</Text>
          )}
          <TouchableOpacity
            onPress={() => onAddPress(slot)}
            className="w-7 h-7 rounded-full bg-green-500 items-center justify-center"
          >
            <Text className="text-white text-lg font-bold -mt-px">+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {entries.length === 0 ? (
        <View className="px-4 py-6 items-center">
          <Text className="text-sm text-gray-300">No items yet</Text>
        </View>
      ) : (
        entries.map((entry, index) => (
          <View
            key={entry.id}
            className={`flex-row items-center justify-between px-4 py-3 ${
              index < entries.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <View className="flex-1 mr-3">
              <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
                {entry.food?.name || 'Unknown food'}
              </Text>
              {entry.food?.brand && (
                <Text className="text-xs text-gray-400" numberOfLines={1}>
                  {entry.food.brand}
                </Text>
              )}
              <Text className="text-xs text-gray-400 mt-0.5">
                {entry.servings}x {entry.food?.serving_name || 'serving'}
              </Text>
            </View>
            <Text className="text-sm font-bold text-gray-700 mr-3">
              {Math.round((entry.food?.calories_per_serving || 0) * entry.servings)} kcal
            </Text>
            <TouchableOpacity onPress={() => handleDelete(entry)} className="p-1">
              <Trash size={16} color="#D1D5DB" weight="fill" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}
