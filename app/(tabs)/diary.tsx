import { useState, useCallback, useEffect } from 'react';
import { trackScreen } from '@/src/lib/analytics';
import { View, ScrollView, TouchableOpacity, Alert, Text, Platform } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/src/constants/theme';
import { useDiaryStore } from '@/src/stores/diary';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useRecipeStore } from '@/src/stores/recipes';
import { useThemeColors } from '@/src/stores/theme';
import { DatePickerBar } from '@/src/components/DatePickerBar';
import { CalorieProgressBar, MacroBars } from '@/src/components/ProgressBars';
import { MealSlotCard } from '@/src/components/MealSlotCard';
import { AddFoodSheet } from '@/src/components/AddFoodSheet';
import { CustomFoodModal } from '@/src/components/CustomFoodModal';
import type { MealSlot, DietaryPreference } from '@/src/types';
import { Copy, CookingPot } from 'phosphor-react-native';
import { WebDiary } from '@/src/web/screens/WebDiary';
import { FoodCapture } from '@/src/web/FoodCapture';

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export default function DiaryScreen() {
  if (Platform.OS === 'web') return <WebDiary />;
  useEffect(() => { trackScreen('diary'); }, []);
  const {
    selectedDate,
    getDailyCalories,
    getDailyMacros,
    copyFromDate,
  } = useDiaryStore();
  const colors = useThemeColors();

  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MealSlot | null>(null);
  const [showFoodCapture, setShowFoodCapture] = useState(false);

  const onboarding = useOnboardingStore();
  const calorieTarget = onboarding.calorieTarget || 2000;
  const proteinTarget = onboarding.proteinTargetG || 100;
  const carbsTarget = onboarding.carbsTargetG || 200;
  const fatTarget = onboarding.fatTargetG || 55;

  const consumed = getDailyCalories(selectedDate);
  const macros = getDailyMacros(selectedDate);
  const remainingCal = Math.max(0, calorieTarget - consumed);
  const remainingProtein = Math.max(0, proteinTarget - macros.protein);
  const remainingCarbs = Math.max(0, carbsTarget - macros.carbs);
  const remainingFat = Math.max(0, fatTarget - macros.fat);

  const dietPreference = onboarding.dietaryPreference || 'omnivore';
  const { getSuggestions } = useRecipeStore();
  const suggestedRecipes = consumed > 0 ? getSuggestions(
    remainingCal, remainingProtein, remainingCarbs, remainingFat, dietPreference as DietaryPreference
  ) : [];

  const handleAddPress = useCallback((slot: MealSlot) => {
    setSelectedSlot(slot);
    setAddSheetVisible(true);
  }, []);

  const handleBarcodeScan = useCallback(() => {
    setAddSheetVisible(false);
    router.push('/barcode');
  }, []);

  const handleManualAdd = useCallback(() => {
    setAddSheetVisible(false);
    setTimeout(() => setCustomModalVisible(true), 400);
  }, []);

  const handleCopyYesterday = useCallback(() => {
    const yesterday = yesterdayStr();
    Alert.alert(
      'Copy Meals',
      `Copy all entries from yesterday to today?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Copy', onPress: () => copyFromDate(yesterday) },
      ]
    );
  }, [copyFromDate]);

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bgSecondary }}>
      <DatePickerBar />
      <ScrollView className="flex-1">
        <CalorieProgressBar consumed={consumed} target={calorieTarget} />
        <MacroBars
          protein={macros.protein}
          proteinTarget={proteinTarget}
          carbs={macros.carbs}
          carbsTarget={carbsTarget}
          fat={macros.fat}
          fatTarget={fatTarget}
        />

        {!isToday && (
          <TouchableOpacity
            onPress={handleCopyYesterday}
            className="mx-4 mt-3 flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-green-50"
          >
            <Copy size={16} color={COLORS.primary} />
            <Text className="text-sm font-semibold" style={{ color: COLORS.primary }}>
              Same as yesterday
            </Text>
          </TouchableOpacity>
        )}

        {(Platform.OS as string) === 'web' && (
          <TouchableOpacity
            onPress={() => setShowFoodCapture(true)}
            className="mx-4 mt-3 flex-row items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50"
          >
            <Text className="text-lg">🤖</Text>
            <Text className="text-sm font-semibold text-blue-600">AI Capture</Text>
          </TouchableOpacity>
        )}

        <View className="mt-4 pb-6">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as MealSlot[]).map((slot) => (
            <MealSlotCard key={slot} slot={slot} onAddPress={handleAddPress} />
          ))}
        </View>

        {consumed > 0 && suggestedRecipes.length > 0 && (
          <View className="mx-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-bold" style={{ color: colors.textSecondary }}>
                Suggested Recipes
              </Text>
              <TouchableOpacity onPress={() => router.push('/recipes' as any)}>
                <Text className="text-xs text-green-600 font-semibold">See All →</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row gap-3">
              {suggestedRecipes.slice(0, 3).map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  onPress={() => router.push('/recipes' as any)}
                  className="flex-1 rounded-xl border p-3"
                  style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
                >
                  <View className="items-center mb-2">
                    <CookingPot size={24} color={COLORS.primary} weight="duotone" />
                  </View>
                  <Text className="text-xs font-bold" style={{ color: colors.text }} numberOfLines={2}>
                    {recipe.name}
                  </Text>
                  <Text className="text-[10px] mt-1" style={{ color: colors.textMuted }}>
                    {recipe.caloriesPerServing} cal · {recipe.proteinG}g protein
                  </Text>
                  <View className="flex-row gap-1 mt-2">
                    <View className="bg-green-50 px-2 py-0.5 rounded-full">
                      <Text className="text-[9px] text-green-600 font-semibold">
                        {recipe.category}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {consumed > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/summary' as any)}
            className="mx-4 mb-6 py-3 rounded-xl items-center"
            style={{ backgroundColor: '#3B82F6' + '10' }}
          >
            <Text className="text-sm font-bold text-blue-600">View Daily Summary</Text>
          </TouchableOpacity>
        )}

        <View className="h-16" />
      </ScrollView>

      <AddFoodSheet
        visible={addSheetVisible}
        slot={selectedSlot}
        onClose={() => setAddSheetVisible(false)}
        onBarcodeScan={handleBarcodeScan}
        onManualAdd={handleManualAdd}
      />

      <CustomFoodModal
        visible={customModalVisible}
        slot={selectedSlot}
        onClose={() => {
          setCustomModalVisible(false);
          setSelectedSlot(null);
        }}
      />

      {showFoodCapture && (Platform.OS as string) === 'web' && <FoodCapture onClose={() => setShowFoodCapture(false)} />}
    </View>
  );
}
