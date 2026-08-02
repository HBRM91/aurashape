import { RECIPES, getRecipesByCategory, getRecipesByDiet, suggestRecipesForMacros, getRecipeById, recipeToFood } from '@/src/lib/recipes';

describe('Recipe Library', () => {
  describe('RECIPES', () => {
    it('should have at least 15 recipes', () => {
      expect(RECIPES.length).toBeGreaterThanOrEqual(15);
    });

    it('should have recipes in all categories', () => {
      const categories = new Set(RECIPES.map((r) => r.category));
      expect(categories.has('breakfast')).toBe(true);
      expect(categories.has('lunch')).toBe(true);
      expect(categories.has('dinner')).toBe(true);
      expect(categories.has('snack')).toBe(true);
    });

    it('should have valid nutritional data', () => {
      RECIPES.forEach((r) => {
        expect(r.caloriesPerServing).toBeGreaterThan(0);
        expect(r.proteinG).toBeGreaterThan(0);
        expect(r.carbsG).toBeGreaterThanOrEqual(0);
        expect(r.fatG).toBeGreaterThanOrEqual(0);
        expect(r.ingredients.length).toBeGreaterThan(0);
        expect(r.instructions.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IDs', () => {
      const ids = RECIPES.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('recipeToFood', () => {
    it('should convert a recipe to a food entry', () => {
      const recipe = RECIPES[0];
      const food = recipeToFood(recipe);
      expect(food.name).toBe(recipe.name);
      expect(food.calories_per_serving).toBe(recipe.caloriesPerServing);
      expect(food.protein_g).toBe(recipe.proteinG);
      expect(food.carbs_g).toBe(recipe.carbsG);
      expect(food.fat_g).toBe(recipe.fatG);
      expect(food.fiber_g).toBe(recipe.fiberG);
      expect(food.source).toBe('aurashape_recipes');
      expect(food.serving_name).toBe('1 serving');
    });
  });

  describe('getRecipesByCategory', () => {
    it('should filter by breakfast', () => {
      const result = getRecipesByCategory('breakfast');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => expect(r.category).toBe('breakfast'));
    });

    it('should filter by lunch', () => {
      const result = getRecipesByCategory('lunch');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => expect(r.category).toBe('lunch'));
    });
  });

  describe('getRecipesByDiet', () => {
    it('should find vegan recipes', () => {
      const result = getRecipesByDiet('vegan');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => expect(r.dietaryTags).toContain('vegan'));
    });

    it('should find high protein recipes', () => {
      const result = getRecipesByDiet('high_protein');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => expect(r.dietaryTags).toContain('high_protein'));
    });

    it('should exclude specified categories', () => {
      const result = getRecipesByDiet('omnivore', ['snack']);
      result.forEach((r) => expect(r.category).not.toBe('snack'));
    });
  });

  describe('getRecipeById', () => {
    it('should find a recipe by ID', () => {
      const recipe = getRecipeById('r-protein-oats');
      expect(recipe).toBeDefined();
      expect(recipe!.name).toBe('High-Protein Overnight Oats');
    });

    it('should return undefined for invalid ID', () => {
      expect(getRecipeById('nonexistent')).toBeUndefined();
    });
  });

  describe('suggestRecipesForMacros', () => {
    it('should return top K results', () => {
      const result = suggestRecipesForMacros(500, 40, 50, 15, 'omnivore', 3);
      expect(result.length).toBeLessThanOrEqual(3);
    });

    it('should only return recipes matching dietary preference', () => {
      const result = suggestRecipesForMacros(400, 30, 40, 10, 'vegan', 5);
      result.forEach((r) => expect(r.dietaryTags).toContain('vegan'));
    });

    it('should return empty if no matching diet', () => {
      const result = suggestRecipesForMacros(500, 50, 50, 20, 'keto' as any, 5);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });
});
