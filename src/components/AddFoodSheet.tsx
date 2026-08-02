import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, MACRO_COLORS } from '@/src/constants/theme';
import { useDiaryStore } from '@/src/stores/diary';
import { searchFoods } from '@/src/lib/foodApi';
import type { Food, MealSlot } from '@/src/types';
import { X, MagnifyingGlass, Barcode, PlusCircle, Camera } from 'phosphor-react-native';
import { FoodImage } from './ImageLoader';

interface AddFoodSheetProps {
  visible: boolean;
  slot: MealSlot | null;
  onClose: () => void;
  onBarcodeScan: () => void;
  onManualAdd: () => void;
}

export function AddFoodSheet({ visible, slot, onClose, onBarcodeScan, onManualAdd }: AddFoodSheetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { addEntry, recentFoods } = useDiaryStore();

  if (!visible || !slot) return null;

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const foods = await searchFoods(text);
      setResults(foods);
      setSearched(true);
    } catch {
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food: Food) => {
    addEntry(food, slot);
    onClose();
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const displayFoods = query.length < 2 ? recentFoods : results;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-white"
      >
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <Text className="text-lg font-bold text-gray-800">Add Food</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={22} color="#6B7280" weight="bold" />
          </TouchableOpacity>
        </View>

        <View className="px-4 pt-3">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <MagnifyingGlass size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-800"
              placeholder="Search foods..."
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={handleSearch}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
                <X size={16} color="#9CA3AF" weight="bold" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="flex-row gap-2 px-4 py-3 border-b border-gray-100">
          <QuickAction icon={<Barcode size={18} color={COLORS.primary} />} label="Scan" onPress={onBarcodeScan} />
          <QuickAction icon={<Camera size={18} color={COLORS.secondary} />} label="Photo" onPress={() => {}} />
          <QuickAction icon={<PlusCircle size={18} color={COLORS.accent} />} label="Custom" onPress={onManualAdd} />
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={displayFoods}
            keyExtractor={(item) => item.id}
            className="flex-1 px-4"
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text className="text-gray-300 text-sm">
                  {searched ? 'No results found' : query.length < 2 ? 'Search or scan a food' : 'Type to search'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectFood(item)}
                className="flex-row items-center py-3 border-b border-gray-50"
              >
                <FoodImage foodName={item.name} size={48} />
                <View className="flex-1 ml-3 mr-3">
                  <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.brand && (
                    <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
                      {item.brand}
                    </Text>
                  )}
                  <MacroChips food={item} />
                </View>
                <Text className="text-sm font-bold text-gray-700">
                  {item.calories_per_serving} kcal
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50"
    >
      {icon}
      <Text className="text-xs font-semibold text-gray-600">{label}</Text>
    </TouchableOpacity>
  );
}

function MacroChips({ food }: { food: Food }) {
  const items = [
    { label: 'P', value: food.protein_g, color: MACRO_COLORS.protein },
    { label: 'C', value: food.carbs_g, color: MACRO_COLORS.carbs },
    { label: 'F', value: food.fat_g, color: MACRO_COLORS.fat },
  ].filter((m) => m.value > 0);

  if (items.length === 0) return null;

  return (
    <View className="flex-row gap-1.5 mt-1">
      {items.map((m) => (
        <View
          key={m.label}
          className="px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: m.color + '20' }}
        >
          <Text className="text-xs font-medium" style={{ color: m.color }}>
            {m.label}: {m.value}g
          </Text>
        </View>
      ))}
    </View>
  );
}
