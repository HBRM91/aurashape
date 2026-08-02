import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS } from '@/src/constants/theme';
import { useDiaryStore } from '@/src/stores/diary';
import type { Food, MealSlot } from '@/src/types';
import { X } from 'phosphor-react-native';

interface CustomFoodModalProps {
  visible: boolean;
  slot: MealSlot | null;
  onClose: () => void;
}

export function CustomFoodModal({ visible, slot, onClose }: CustomFoodModalProps) {
  const { addEntry } = useDiaryStore();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [servingName, setServingName] = useState('serving');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');

  const reset = () => {
    setName('');
    setBrand('');
    setServingName('serving');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setFiber('');
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }
    if (!calories || isNaN(Number(calories)) || Number(calories) < 0) {
      Alert.alert('Error', 'Please enter valid calories');
      return;
    }

    const food: Food = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || undefined,
      serving_name: servingName.trim() || 'serving',
      calories_per_serving: Number(calories),
      protein_g: Number(protein) || 0,
      carbs_g: Number(carbs) || 0,
      fat_g: Number(fat) || 0,
      fiber_g: Number(fiber) || 0,
      is_verified: false,
      is_aurabiosens: false,
      source: 'user',
    };

    addEntry(food, slot!);
    reset();
    onClose();
  };

  if (!visible || !slot) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-white"
      >
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <Text className="text-lg font-bold text-gray-800">Custom Food</Text>
          <TouchableOpacity
            onPress={() => { reset(); onClose(); }}
            className="p-2"
          >
            <X size={22} color="#6B7280" weight="bold" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
          <Field label="Name (required)" value={name} onChange={setName} placeholder="e.g. Chicken Breast" />
          <Field label="Brand" value={brand} onChange={setBrand} placeholder="Optional" />
          <Field label="Serving Name" value={servingName} onChange={setServingName} placeholder="e.g. 100g, 1 piece" />

          <Text className="text-sm font-semibold text-gray-400 mt-4 mb-3">Nutrition (per serving)</Text>

          <Field label="Calories (required)" value={calories} onChange={setCalories} placeholder="kcal" keyboardType="numeric" />
          <Field label="Protein" value={protein} onChange={setProtein} placeholder="grams" keyboardType="numeric" />
          <Field label="Carbs" value={carbs} onChange={setCarbs} placeholder="grams" keyboardType="numeric" />
          <Field label="Fat" value={fat} onChange={setFat} placeholder="grams" keyboardType="numeric" />
          <Field label="Fiber" value={fiber} onChange={setFiber} placeholder="grams" keyboardType="numeric" />

          <TouchableOpacity
            onPress={handleSave}
            className="mt-6 mb-10 py-4 rounded-2xl items-center"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="text-white text-base font-bold">Save Food</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View className="mb-4">
      <Text className="text-xs font-medium text-gray-400 mb-1.5">{label}</Text>
      <TextInput
        className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800"
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#D1D5DB"
        keyboardType={keyboardType}
      />
    </View>
  );
}
