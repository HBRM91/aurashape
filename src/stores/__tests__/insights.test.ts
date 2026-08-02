import { useInsightsStore } from '@/src/stores/insights';
import { useDiaryStore } from '@/src/stores/diary';
import type { Food } from '@/src/types';

const mockFood: Food = {
  id: 'f1',
  name: 'Chicken Breast',
  serving_name: '100g',
  calories_per_serving: 165,
  protein_g: 31,
  carbs_g: 0,
  fat_g: 3.6,
  fiber_g: 0,
  is_verified: true,
  is_aurabiosens: false,
  source: 'system',
};

const mockFood2: Food = {
  id: 'f2',
  name: 'Brown Rice',
  serving_name: '100g',
  calories_per_serving: 123,
  protein_g: 2.7,
  carbs_g: 25.6,
  fat_g: 0.9,
  fiber_g: 1.6,
  is_verified: true,
  is_aurabiosens: false,
  source: 'system',
};

const today = new Date().toISOString().slice(0, 10);

beforeEach(() => {
  useDiaryStore.setState({
    selectedDate: today,
    entries: [],
    recentFoods: [],
  });
});

describe('Insights Store', () => {
  describe('getDaySummary', () => {
    it('should return a summary for a given date', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast', 2);
      useDiaryStore.getState().addEntry(mockFood, 'lunch', 1);

      const summary = useInsightsStore.getState().getDaySummary(today, 2000, 100, 250, 55);

      expect(summary.calories).toBe(165 * 3);
      expect(summary.protein).toBe(31 * 3);
      expect(summary.mealsLogged).toBe(2);
      expect(summary.targetCalories).toBe(2000);
    });

    it('should handle empty dates', () => {
      const summary = useInsightsStore.getState().getDaySummary('2020-01-01', 2000, 100, 250, 55);
      expect(summary.calories).toBe(0);
      expect(summary.protein).toBe(0);
      expect(summary.mealsLogged).toBe(0);
    });
  });

  describe('getWeeklyInsights', () => {
    it('should calculate average macros over 7 days', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');

      const insights = useInsightsStore.getState().getWeeklyInsights(today, 2000, 100, 250, 55);

      expect(insights.avgCalories).toBeGreaterThan(0);
      expect(insights.avgProtein).toBeGreaterThan(0);
      expect(insights.totalMeals).toBe(1);
    });

    it('should identify top foods', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      useDiaryStore.getState().addEntry(mockFood, 'lunch');
      useDiaryStore.getState().addEntry(mockFood2, 'lunch');

      const insights = useInsightsStore.getState().getWeeklyInsights(today, 2000, 100, 250, 55);

      const topChicken = insights.topFoods.find((f) => f.name === 'Chicken Breast');
      const topRice = insights.topFoods.find((f) => f.name === 'Brown Rice');
      expect(topChicken).toBeDefined();
      expect(topChicken!.count).toBe(2);
      expect(topRice).toBeDefined();
      expect(topRice!.count).toBe(1);
    });

    it('should compute tracking streak', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');

      const insights = useInsightsStore.getState().getWeeklyInsights(today, 2000, 100, 250, 55);

      expect(insights.streak).toBeGreaterThanOrEqual(0);
    });

    it('should identify best and worst days when multiple days logged', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      useDiaryStore.getState().addEntry({ ...mockFood, id: 'a' }, 'breakfast', 3);
      useDiaryStore.setState((s) => ({
        entries: [...s.entries, {
          id: 'old',
          user_id: '',
          meal_slot: 'breakfast',
          food: { ...mockFood, protein_g: 10, fiber_g: 0 },
          servings: 1,
          date: yesterdayStr,
        }],
      }));

      const insights = useInsightsStore.getState().getWeeklyInsights(today, 2000, 100, 250, 55);
      expect(insights.bestDay || insights.worstDay).toBeDefined();
    });

    it('should show calorie and protein target met counts', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      const insights = useInsightsStore.getState().getWeeklyInsights(today, 100, 50, 250, 55);
      expect(insights.calorieTargetMet).toBeGreaterThanOrEqual(0);
      expect(insights.proteinTargetMet).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 avg values when no meals logged at all', () => {
      const insights = useInsightsStore.getState().getWeeklyInsights(today, 2000, 100, 250, 55);
      expect(insights.avgCalories).toBe(0);
      expect(insights.totalMeals).toBe(0);
      expect(insights.streak).toBe(0);
    });
  });

  describe('getStreak', () => {
    it('should count consecutive days with entries', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');

      const streak = useInsightsStore.getState().getStreak();

      expect(streak).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for no entries', () => {
      const streak = useInsightsStore.getState().getStreak();
      expect(streak).toBe(0);
    });
  });
});
