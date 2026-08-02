import { useAchievementsStore } from '@/src/stores/achievements';
import { useDiaryStore } from '@/src/stores/diary';
import type { Food } from '@/src/types';

const mockFood: Food = {
  id: 'f1',
  name: 'Apple',
  serving_name: '1 medium',
  calories_per_serving: 95,
  protein_g: 0.5,
  carbs_g: 25,
  fat_g: 0.3,
  fiber_g: 4.4,
  is_verified: true,
  is_aurabiosens: false,
  source: 'system',
};

beforeEach(() => {
  useDiaryStore.setState({ selectedDate: new Date().toISOString().slice(0, 10), entries: [], recentFoods: [] });
  useAchievementsStore.setState({
    achievements: useAchievementsStore.getState().achievements.map((a) => ({
      ...a, unlocked: false, progress: 0, unlockedAt: undefined,
    })),
  });
});

describe('Achievements - Integration', () => {
  describe('Diary triggers achievements', () => {
    it('should unlock First Bite after logging first meal', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      const achievements = useAchievementsStore.getState();

      const firstMeal = achievements.achievements.find((a) => a.id === 'a-first-meal');
      expect(firstMeal).toBeDefined();
      expect(firstMeal!.unlocked).toBe(true);
      expect(firstMeal!.progress).toBe(1);
    });

    it('should progress Meal Master after 10 meals', () => {
      for (let i = 0; i < 10; i++) {
        useDiaryStore.getState().addEntry({ ...mockFood, id: `f${i}` }, 'breakfast');
      }

      const master = useAchievementsStore.getState().achievements.find((a) => a.id === 'a-10-meals');
      expect(master!.unlocked).toBe(true);
      expect(master!.progress).toBe(10);
    });

    it('should have some progress after multiple meals', () => {
      for (let i = 0; i < 5; i++) {
        useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      }

      const meal10 = useAchievementsStore.getState().achievements.find((a) => a.id === 'a-10-meals');
      expect(meal10!.progress).toBe(5);
      expect(meal10!.unlocked).toBe(false);
    });
  });
});
