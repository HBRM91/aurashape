import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RECIPES, getRecipeById, recipeToFood, type Recipe } from '@/src/lib/recipes';
import { useDiaryStore } from '@/src/stores/diary';
import { useRecipeStore } from '@/src/stores/recipes';
import type { MealSlot } from '@/src/types';
import { WebButton } from './WebButton';
import { GroceryList } from './GroceryList';
import type { MealPlan } from './GroceryList';
import { WEB_TOKENS } from './tokens';

const SLOTS: Array<{ slot: MealSlot; label: string }> = [
  { slot: 'breakfast', label: 'Breakfast' },
  { slot: 'lunch', label: 'Lunch' },
  { slot: 'dinner', label: 'Dinner' },
  { slot: 'snack', label: 'Snack' },
];

export function planningDates(startDate: string): string[] {
  const start = new Date(`${startDate}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

function formatDay(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

interface MealPlannerProps {
  startDate: string;
}

export function MealPlanner({ startDate }: MealPlannerProps) {
  const dates = planningDates(startDate);
  const { mealPlan, setMealPlan, getSuggestions } = useRecipeStore();
  const { addEntry, setDate } = useDiaryStore();
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; slot: MealSlot } | null>(null);
  const [showGroceries, setShowGroceries] = useState(false);
  const [loggedMeals, setLoggedMeals] = useState<Set<string>>(new Set());

  const handleAutoFill = () => {
    const suggestions = getSuggestions(500, 30, 45, 20, 'omnivore');
    const nextPlan: MealPlan = { ...mealPlan };
    let suggestionIndex = 0;
    dates.forEach((date) => {
      const day = { ...(nextPlan[date] || {}) };
      SLOTS.forEach(({ slot }) => {
        if (day[slot]) return;
        const recipe = suggestions.find((candidate) => candidate.category === slot)
          || RECIPES.find((candidate) => candidate.category === slot)
          || suggestions[suggestionIndex % Math.max(suggestions.length, 1)];
        if (recipe) {
          day[slot] = recipe.id;
          suggestionIndex += 1;
        }
      });
      nextPlan[date] = day;
    });
    dates.forEach((date) => {
      SLOTS.forEach(({ slot }) => {
        const recipeId = nextPlan[date]?.[slot];
        if (recipeId) setMealPlan(date, slot, recipeId);
      });
    });
  };

  const selectRecipe = (recipe: Recipe) => {
    if (!selectedSlot) return;
    setMealPlan(selectedSlot.date, selectedSlot.slot, recipe.id);
    setSelectedSlot(null);
  };

  const logMeal = (date: string, slot: MealSlot, recipe: Recipe) => {
    setDate(new Date().toISOString().slice(0, 10));
    addEntry(recipeToFood(recipe), slot);
    setLoggedMeals((current) => new Set(current).add(`${date}:${slot}`));
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Meal Planner</Text>
          <Text style={styles.subtitle}>Plan seven days, then shop once.</Text>
        </View>
        <View style={styles.headerActions}>
          <WebButton label="Auto-fill week" onPress={handleAutoFill} variant="primary" />
          <WebButton
            label={showGroceries ? 'Hide groceries' : 'View groceries'}
            onPress={() => setShowGroceries((visible) => !visible)}
            variant="secondary"
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
        {dates.map((date) => {
          const day = mealPlan[date] || {};
          return (
            <View key={date} style={styles.dayCard}>
              <Text style={styles.dayTitle}>{formatDay(date)}</Text>
              {SLOTS.map(({ slot, label }) => {
                const recipe = day[slot] ? getRecipeById(day[slot]!) : undefined;
                const logKey = `${date}:${slot}`;
                return (
                  <View key={slot} style={styles.slot}>
                    <Text style={styles.slotLabel}>{label}</Text>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Plan ${slot} for ${formatDay(date)}`}
                      onPress={() => setSelectedSlot({ date, slot })}
                      style={styles.slotButton}
                    >
                      <Text style={styles.slotText}>{recipe?.name || 'Choose a recipe'}</Text>
                    </TouchableOpacity>
                    {recipe && (
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={loggedMeals.has(logKey) ? 'Logged' : `Log ${recipe.name} to diary`}
                        disabled={loggedMeals.has(logKey)}
                        onPress={() => logMeal(date, slot, recipe)}
                        style={styles.logButton}
                      >
                        <Text style={styles.logText}>{loggedMeals.has(logKey) ? 'Logged' : 'Log today'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      {showGroceries && <GroceryList mealPlan={mealPlan} />}

      <Modal transparent visible={selectedSlot !== null} animationType="fade" onRequestClose={() => setSelectedSlot(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a recipe</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close recipe picker" onPress={() => setSelectedSlot(null)}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {RECIPES
                .filter((recipe) => !selectedSlot || recipe.category === selectedSlot.slot)
                .map((recipe) => (
                  <TouchableOpacity key={recipe.id} onPress={() => selectRecipe(recipe)} style={styles.recipeOption}>
                    <View style={styles.recipeText}>
                      <Text style={styles.recipeName}>{recipe.name}</Text>
                      <Text style={styles.recipeMeta}>{recipe.caloriesPerServing} cal · {recipe.proteinG}g protein</Text>
                    </View>
                    <Text style={styles.choose}>Add</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: WEB_TOKENS.colors.page,
    flex: 1,
    padding: WEB_TOKENS.spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: WEB_TOKENS.spacing.md,
  },
  headerText: { flex: 1 },
  title: { ...WEB_TOKENS.typography.heading, color: WEB_TOKENS.colors.text },
  subtitle: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginTop: 4 },
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: WEB_TOKENS.spacing.sm, justifyContent: 'flex-end' },
  days: { gap: WEB_TOKENS.spacing.md, paddingBottom: WEB_TOKENS.spacing.sm },
  dayCard: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderColor: WEB_TOKENS.colors.border,
    borderRadius: WEB_TOKENS.radii.md,
    borderWidth: 1,
    padding: WEB_TOKENS.spacing.md,
    width: 270,
  },
  dayTitle: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.primaryStrong, marginBottom: WEB_TOKENS.spacing.sm },
  slot: { borderTopColor: WEB_TOKENS.colors.border, borderTopWidth: 1, paddingVertical: WEB_TOKENS.spacing.sm },
  slotLabel: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.textMuted, fontSize: 12 },
  slotButton: { paddingVertical: WEB_TOKENS.spacing.xs },
  slotText: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.text, fontWeight: '600' },
  logButton: { alignSelf: 'flex-start', marginTop: 2 },
  logText: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.primary, fontSize: 12 },
  modalOverlay: { alignItems: 'center', backgroundColor: 'rgba(18, 35, 27, 0.45)', flex: 1, justifyContent: 'center', padding: WEB_TOKENS.spacing.lg },
  modal: { backgroundColor: WEB_TOKENS.colors.surface, borderRadius: WEB_TOKENS.radii.lg, maxHeight: '80%', maxWidth: 560, padding: WEB_TOKENS.spacing.lg, width: '100%' },
  modalHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: WEB_TOKENS.spacing.md },
  modalTitle: { ...WEB_TOKENS.typography.subheading, color: WEB_TOKENS.colors.text },
  close: { color: WEB_TOKENS.colors.textMuted, fontSize: 18, padding: WEB_TOKENS.spacing.xs },
  recipeOption: { alignItems: 'center', borderTopColor: WEB_TOKENS.colors.border, borderTopWidth: 1, flexDirection: 'row', paddingVertical: WEB_TOKENS.spacing.md },
  recipeText: { flex: 1 },
  recipeName: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.text, fontWeight: '600' },
  recipeMeta: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, fontSize: 12, marginTop: 2 },
  choose: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.primary },
});
