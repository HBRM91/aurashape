import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useDiaryStore } from '@/src/stores/diary';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useRecipeStore } from '@/src/stores/recipes';
import type { MealSlot, Food, DietaryPreference } from '@/src/types';
import { WebCard } from '../WebCard';
import { WebButton } from '../WebButton';
import { FoodSearchSheet } from '../FoodSearchSheet';
import { BarcodeLookupSheet } from '../BarcodeLookupSheet';
import { QuickAddSheet } from '../QuickAddSheet';
import { WEB_TOKENS } from '../tokens';

const SLOTS: { slot: MealSlot; label: string; emoji: string }[] = [
  { slot: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { slot: 'lunch', label: 'Lunch', emoji: '☀️' },
  { slot: 'dinner', label: 'Dinner', emoji: '🌙' },
  { slot: 'snack', label: 'Snacks', emoji: '🍪' },
];

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function WebDiary() {
  useEffect(() => {
    try { require('@/src/lib/analytics').trackScreen('diary'); } catch {}
  }, []);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { selectedDate, getDailyCalories, getDailyMacros, copyFromDate, getEntriesBySlot, getSlotCalories, addEntry } = useDiaryStore();
  const onboarding = useOnboardingStore();
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const calorieTarget = onboarding.calorieTarget || 2000;
  const proteinTarget = onboarding.proteinTargetG || 100;
  const carbsTarget = onboarding.carbsTargetG || 200;
  const fatTarget = onboarding.fatTargetG || 55;

  const consumed = getDailyCalories(selectedDate);
  const macros = getDailyMacros(selectedDate);
  const remainingCal = Math.max(0, calorieTarget - consumed);

  const dietPreference = onboarding.dietaryPreference || 'omnivore';
  const { getSuggestions } = useRecipeStore();
  const suggestedRecipes = consumed > 0
    ? getSuggestions(remainingCal, Math.max(0, proteinTarget - macros.protein), Math.max(0, carbsTarget - macros.carbs), Math.max(0, fatTarget - macros.fat), dietPreference as DietaryPreference)
    : [];

  const handleAddPress = useCallback((_slot: MealSlot) => {
    setShowFoodSearch(true);
  }, []);

  const handleFoodSelect = useCallback((food: Food) => {
    setSelectedFood(food);
    setShowFoodSearch(false);
    setShowBarcode(false);
    setShowQuickAdd(true);
  }, []);

  const handleQuickAddConfirm = useCallback((mealSlot: MealSlot, servings: number) => {
    if (selectedFood) {
      addEntry(selectedFood, mealSlot, servings);
    }
    setShowQuickAdd(false);
    setSelectedFood(null);
  }, [selectedFood, addEntry]);

  const handleQuickAddClose = useCallback(() => {
    setShowQuickAdd(false);
    setSelectedFood(null);
  }, []);

  const handleBarcodeOpen = useCallback(() => {
    setShowBarcode(true);
  }, []);

  const handleCopyYesterday = useCallback(() => {
    const yesterday = yesterdayStr();
    Alert.alert(
      'Copy Meals',
      'Copy all entries from yesterday to today?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Copy', onPress: () => copyFromDate(yesterday) },
      ]
    );
  }, [copyFromDate]);

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);
  const calPct = calorieTarget > 0 ? Math.min(100, Math.round((consumed / calorieTarget) * 100)) : 0;

  const leftColumn = (
    <View style={styles.column}>
      <View style={styles.topButtons}>
        <WebButton label="Search Food" variant="primary" onPress={() => setShowFoodSearch(true)} />
        <WebButton label="Scan Barcode" variant="secondary" onPress={handleBarcodeOpen} />
      </View>
      {SLOTS.map(({ slot, label, emoji }) => {
        const entries = getEntriesBySlot(selectedDate, slot);
        const slotCals = getSlotCalories(selectedDate, slot);
        return (
          <WebCard key={slot} accessibilityLabel={`${label} meal slot`}>
            <View style={styles.slotHeader}>
              <Text style={styles.slotEmoji}>{emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.slotLabel}>{label}</Text>
                <Text style={styles.slotCal}>{slotCals} cal</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleAddPress(slot)}
                style={styles.addBtn}
                accessibilityRole="button"
                accessibilityLabel={`Add food to ${label}`}
              >
                <Text style={styles.addBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            {entries.length > 0 ? (
              entries.map((entry) => (
                <View key={entry.id} style={styles.entryRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryName} numberOfLines={1}>{entry.food?.name || 'Unknown'}</Text>
                    <Text style={styles.entrySub}>
                      {entry.servings} serving{entry.servings !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={styles.entryCal}>
                    {Math.round((entry.food?.calories_per_serving || 0) * entry.servings)} cal
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No entries yet</Text>
            )}
          </WebCard>
        );
      })}
    </View>
  );

  const rightColumn = (
    <View style={styles.column}>
      <WebCard accessibilityLabel="Macro summary">
        <Text style={styles.cardTitle}>Daily Summary</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${calPct}%` }]} />
          </View>
          <Text style={styles.progressText}>{calPct}%</Text>
        </View>
        <Text style={styles.macroText}>
          {consumed} / {calorieTarget} cal · {remainingCal} remaining
        </Text>

        <View style={styles.macroGrid}>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Protein</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBarFill, styles.proteinFill, { width: `${Math.min(100, (macros.protein / (proteinTarget || 1)) * 100)}%` }]} />
            </View>
            <Text style={styles.macroValue}>{macros.protein}g / {proteinTarget}g</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBarFill, styles.carbsFill, { width: `${Math.min(100, (macros.carbs / (carbsTarget || 1)) * 100)}%` }]} />
            </View>
            <Text style={styles.macroValue}>{macros.carbs}g / {carbsTarget}g</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroLabel}>Fat</Text>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBarFill, styles.fatFill, { width: `${Math.min(100, (macros.fat / (fatTarget || 1)) * 100)}%` }]} />
            </View>
            <Text style={styles.macroValue}>{macros.fat}g / {fatTarget}g</Text>
          </View>
        </View>
      </WebCard>

      <WebCard accessibilityLabel="Quick actions">
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <WebButton label="Scan Barcode" variant="secondary" onPress={handleBarcodeOpen} />
          <WebButton label="View Summary" variant="ghost" onPress={() => router.push('/summary' as any)} />
        </View>
      </WebCard>

      {!isToday && (
        <TouchableOpacity onPress={handleCopyYesterday} style={styles.copyBtn}>
          <Text style={styles.copyBtnText}>Same as yesterday</Text>
        </TouchableOpacity>
      )}

      {suggestedRecipes.length > 0 && (
        <WebCard accessibilityLabel="Suggested recipes">
          <Text style={styles.cardTitle}>Suggested Recipes</Text>
          {suggestedRecipes.slice(0, 4).map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              onPress={() => router.push('/recipes' as any)}
              style={styles.recipeRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.recipeName} numberOfLines={1}>{recipe.name}</Text>
                <Text style={styles.recipeMeta}>{recipe.caloriesPerServing} cal · {recipe.proteinG}g protein</Text>
              </View>
              <Text style={styles.recipeCat}>{recipe.category}</Text>
            </TouchableOpacity>
          ))}
        </WebCard>
      )}
    </View>
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Food Diary</Text>
        <Text style={styles.dateText}>{selectedDate}</Text>
      </View>
      <ScrollView style={styles.scroll}>
        <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
          {isDesktop ? (
            <>
              {leftColumn}
              {rightColumn}
            </>
          ) : (
            <>
              {rightColumn}
              {leftColumn}
            </>
          )}
        </View>
        <View style={{ height: WEB_TOKENS.spacing.xxl }} />
      </ScrollView>

      {showFoodSearch && (
        <FoodSearchSheet
          onSelect={handleFoodSelect}
          onClose={() => setShowFoodSearch(false)}
        />
      )}

      {showBarcode && (
        <BarcodeLookupSheet
          onSelect={handleFoodSelect}
          onClose={() => setShowBarcode(false)}
        />
      )}

      {showQuickAdd && selectedFood && (
        <QuickAddSheet
          food={selectedFood}
          onConfirm={handleQuickAddConfirm}
          onClose={handleQuickAddClose}
        />
      )}
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
  pageTitle: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.text,
  },
  dateText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  desktopGrid: {
    flexDirection: 'row',
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    gap: WEB_TOKENS.spacing.lg,
  },
  mobileStack: {
    paddingHorizontal: WEB_TOKENS.spacing.md,
    gap: WEB_TOKENS.spacing.md,
  },
  column: {
    flex: 1,
    gap: WEB_TOKENS.spacing.md,
  },
  topButtons: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  slotEmoji: {
    fontSize: 22,
  },
  slotLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
  },
  slotCal: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  addBtn: {
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addBtnText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
    fontSize: 12,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.border,
    gap: WEB_TOKENS.spacing.sm,
  },
  entryName: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
  },
  entrySub: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  entryCal: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primary,
  },
  emptyText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontStyle: 'italic',
  },
  cardTitle: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: WEB_TOKENS.colors.secondary,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  progressText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primary,
  },
  macroText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  macroGrid: {
    gap: WEB_TOKENS.spacing.sm,
  },
  macroItem: {
    gap: 2,
  },
  macroLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  macroBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: WEB_TOKENS.colors.secondary,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  proteinFill: {
    backgroundColor: '#3B82F6',
  },
  carbsFill: {
    backgroundColor: '#F59E0B',
  },
  fatFill: {
    backgroundColor: '#EC4899',
  },
  macroValue: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
  },
  quickActions: {
    gap: WEB_TOKENS.spacing.sm,
  },
  copyBtn: {
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.md,
    padding: WEB_TOKENS.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: WEB_TOKENS.colors.border,
  },
  copyBtnText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.border,
    gap: WEB_TOKENS.spacing.sm,
  },
  recipeName: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
  },
  recipeMeta: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  recipeCat: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primary,
    fontSize: 11,
    backgroundColor: WEB_TOKENS.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: WEB_TOKENS.radii.pill,
  },
});
