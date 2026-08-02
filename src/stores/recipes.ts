import { create } from 'zustand';
import type { DietaryPreference } from '@/src/types';
import type { Recipe } from '@/src/lib/recipes';
import { suggestRecipesForMacros } from '@/src/lib/recipes';

interface RecipeState {
  savedRecipes: string[];
  mealPlan: Record<string, { breakfast?: string; lunch?: string; dinner?: string; snack?: string }>;
  toggleSaved: (recipeId: string) => void;
  isSaved: (recipeId: string) => boolean;
  setMealPlan: (date: string, meal: 'breakfast' | 'lunch' | 'dinner' | 'snack', recipeId: string) => void;
  getMealPlan: (date: string) => { breakfast?: string; lunch?: string; dinner?: string; snack?: string };
  getSuggestions: (
    remainingCal: number, remainingProtein: number, remainingCarbs: number,
    remainingFat: number, dietPreference: DietaryPreference
  ) => Recipe[];
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  savedRecipes: [],
  mealPlan: {},

  toggleSaved: (recipeId) =>
    set((s) => {
      const next = s.savedRecipes.includes(recipeId)
        ? s.savedRecipes.filter((id) => id !== recipeId)
        : [...s.savedRecipes, recipeId];
      try { require('./achievements').useAchievementsStore.getState().checkAchievements(); } catch {}
      return { savedRecipes: next };
    }),

  isSaved: (recipeId) => get().savedRecipes.includes(recipeId),

  setMealPlan: (date, meal, recipeId) =>
    set((s) => ({
      mealPlan: {
        ...s.mealPlan,
        [date]: { ...s.mealPlan[date], [meal]: recipeId },
      },
    })),

  getMealPlan: (date) => get().mealPlan[date] || {},

  getSuggestions: (remainingCal, remainingProtein, remainingCarbs, remainingFat, dietPreference) =>
    suggestRecipesForMacros(remainingCal, remainingProtein, remainingCarbs, remainingFat, dietPreference),
}));
