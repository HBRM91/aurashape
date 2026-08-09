import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getRecipeById } from '@/src/lib/recipes';
import { WEB_TOKENS } from './tokens';

export type MealPlan = Record<string, {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snack?: string;
}>;

export type GroceryGroups = Record<'produce' | 'protein' | 'dairy' | 'pantry', string[]>;

const SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const GROUPS: Array<keyof GroceryGroups> = ['produce', 'protein', 'dairy', 'pantry'];

function groupIngredient(ingredient: string): keyof GroceryGroups {
  const value = ingredient.toLowerCase();
  if (/(chicken|tuna|salmon|steak|turkey|shrimp|tofu|protein|egg|lentil|chickpea)/.test(value)) return 'protein';
  if (/(yogurt|feta|cheese|parmesan|milk)/.test(value)) return 'dairy';
  if (/(oat|chia|quinoa|rice|oil|sauce|wrap|almond|tahini|soy|salt|pepper|spice)/.test(value)) return 'pantry';
  return 'produce';
}

export function buildGroceryList(mealPlan: MealPlan): GroceryGroups {
  const grouped: Record<keyof GroceryGroups, Map<string, number>> = {
    produce: new Map(),
    protein: new Map(),
    dairy: new Map(),
    pantry: new Map(),
  };

  Object.values(mealPlan).forEach((day) => {
    SLOTS.forEach((slot) => {
      const recipeId = day[slot];
      const recipe = recipeId ? getRecipeById(recipeId) : undefined;
      recipe?.ingredients.forEach((ingredient) => {
        const group = groupIngredient(ingredient);
        const key = ingredient.trim();
        grouped[group].set(key, (grouped[group].get(key) || 0) + 1);
      });
    });
  });

  return GROUPS.reduce((result, group) => {
    result[group] = Array.from(grouped[group], ([ingredient, count]) => (
      count > 1 ? `${count} × ${ingredient}` : ingredient
    ));
    return result;
  }, { produce: [], protein: [], dairy: [], pantry: [] } as GroceryGroups);
}

interface GroceryListProps {
  mealPlan: MealPlan;
}

export function GroceryList({ mealPlan }: GroceryListProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const groceries = buildGroceryList(mealPlan);

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Grocery List</Text>
      <ScrollView style={styles.scroll}>
        {GROUPS.map((group) => groceries[group].length > 0 && (
          <View key={group} style={styles.group}>
            <Text style={styles.groupTitle}>{group[0].toUpperCase() + group.slice(1)}</Text>
            {groceries[group].map((ingredient) => {
              const isChecked = checked.has(`${group}:${ingredient}`);
              return (
                <TouchableOpacity
                  key={ingredient}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isChecked }}
                  onPress={() => setChecked((current) => {
                    const next = new Set(current);
                    const key = `${group}:${ingredient}`;
                    if (next.has(key)) next.delete(key); else next.add(key);
                    return next;
                  })}
                  style={styles.item}
                >
                  <Text style={[styles.check, isChecked && styles.checkDone]}>{isChecked ? '✓' : '○'}</Text>
                  <Text style={[styles.ingredient, isChecked && styles.ingredientDone]}>{ingredient}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        {GROUPS.every((group) => groceries[group].length === 0) && (
          <Text style={styles.empty}>Assign meals to build your grocery list.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderColor: WEB_TOKENS.colors.border,
    borderRadius: WEB_TOKENS.radii.md,
    borderWidth: 1,
    marginTop: WEB_TOKENS.spacing.md,
    padding: WEB_TOKENS.spacing.md,
  },
  title: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  scroll: {
    maxHeight: 360,
  },
  group: {
    marginBottom: WEB_TOKENS.spacing.md,
  },
  groupTitle: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
    marginBottom: WEB_TOKENS.spacing.xs,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: WEB_TOKENS.spacing.xs,
  },
  check: {
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 18,
    marginRight: WEB_TOKENS.spacing.sm,
  },
  checkDone: {
    color: WEB_TOKENS.colors.primary,
  },
  ingredient: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
  },
  ingredientDone: {
    color: WEB_TOKENS.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  empty: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
});
