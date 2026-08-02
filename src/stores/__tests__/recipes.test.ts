import { useRecipeStore } from '@/src/stores/recipes';
import { RECIPES } from '@/src/lib/recipes';

beforeEach(() => {
  useRecipeStore.setState({
    savedRecipes: [],
    mealPlan: {},
  });
});

describe('Recipe Store', () => {
  describe('toggleSaved / isSaved', () => {
    it('should save a recipe', () => {
      useRecipeStore.getState().toggleSaved('r-protein-oats');
      expect(useRecipeStore.getState().isSaved('r-protein-oats')).toBe(true);
    });

    it('should unsave a recipe', () => {
      useRecipeStore.getState().toggleSaved('r-protein-oats');
      useRecipeStore.getState().toggleSaved('r-protein-oats');
      expect(useRecipeStore.getState().isSaved('r-protein-oats')).toBe(false);
    });

    it('should track multiple saved recipes', () => {
      useRecipeStore.getState().toggleSaved('r-protein-oats');
      useRecipeStore.getState().toggleSaved('r-tofu-scramble');
      expect(useRecipeStore.getState().savedRecipes).toHaveLength(2);
    });
  });

  describe('meal planning', () => {
    it('should set a meal plan entry', () => {
      useRecipeStore.getState().setMealPlan('2026-03-15', 'breakfast', 'r-protein-oats');
      const plan = useRecipeStore.getState().getMealPlan('2026-03-15');
      expect(plan.breakfast).toBe('r-protein-oats');
    });

    it('should handle multiple meals for same date', () => {
      useRecipeStore.getState().setMealPlan('2026-03-15', 'breakfast', 'r-protein-oats');
      useRecipeStore.getState().setMealPlan('2026-03-15', 'lunch', 'r-chicken-bowl');
      const plan = useRecipeStore.getState().getMealPlan('2026-03-15');
      expect(plan.breakfast).toBe('r-protein-oats');
      expect(plan.lunch).toBe('r-chicken-bowl');
    });

    it('should return empty plan for unknown date', () => {
      const plan = useRecipeStore.getState().getMealPlan('2099-01-01');
      expect(Object.keys(plan)).toHaveLength(0);
    });
  });

  describe('getSuggestions', () => {
    it('should return recipe suggestions matching macros', () => {
      const suggestions = useRecipeStore.getState().getSuggestions(500, 40, 50, 15, 'omnivore');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it('should filter by dietary preference', () => {
      const suggestions = useRecipeStore.getState().getSuggestions(400, 25, 60, 12, 'vegan');
      suggestions.forEach((r) => {
        expect(r.dietaryTags).toContain('vegan');
      });
    });
  });
});
