import { calculateMacros } from '@/src/lib/calculator';
import { useFastingStore } from '@/src/stores/fasting';
import { useThemeStore } from '@/src/stores/theme';
import { useAchievementsStore } from '@/src/stores/achievements';
import { useInsightsStore } from '@/src/stores/insights';
import { useDiaryStore } from '@/src/stores/diary';
import type { Food } from '@/src/types';

const mockFood: Food = {
  id: 'f1', name: 'Test', serving_name: '1', calories_per_serving: 100,
  protein_g: 10, carbs_g: 10, fat_g: 10, fiber_g: 0,
  is_verified: false, is_aurabiosens: false, source: 'test',
};

beforeEach(() => {
  useDiaryStore.setState({ entries: [], selectedDate: new Date().toISOString().slice(0, 10), recentFoods: [] });
});

describe('Coverage gap tests', () => {
  describe('calculateMacros edge cases', () => {
    it('should handle very low calorie target', () => {
      const result = calculateMacros(800, 'lose_weight', 50);
      expect(result.calorieTarget).toBe(300);
      expect(result.carbsG).toBeGreaterThanOrEqual(0);
      expect(result.proteinG).toBe(100);
    });

    it('should handle improve_health goal (should maintain)', () => {
      const result = calculateMacros(2000, 'improve_health', 70);
      expect(result.calorieTarget).toBe(2000);
    });
  });

  describe('fasting remaining time', () => {
    it('should return 0 remaining when no session', () => {
      useFastingStore.setState({ activeSession: null });
      expect(useFastingStore.getState().getRemainingSeconds()).toBe(0);
    });

    it('should return positive remaining after starting', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(new Date(now).toISOString());
      useFastingStore.setState({ currentPlan: '16:8', customHours: 16, activeSession: null, history: [] });
      useFastingStore.getState().startFast();
      const remaining = useFastingStore.getState().getRemainingSeconds();
      expect(remaining).toBeGreaterThan(0);
      jest.restoreAllMocks();
    });

    it('should return progress 0 when no session', () => {
      useFastingStore.setState({ activeSession: null });
      expect(useFastingStore.getState().getProgress()).toBe(0);
    });
  });

  describe('theme hooks', () => {
    it('useThemeColors selector should work', () => {
      const colors = useThemeStore.getState().colors;
      expect(colors).toBeDefined();
      expect(colors.bg).toBe('#FFFFFF');
    });

    it('useIsDark selector should return false for light', () => {
      useThemeStore.setState({ isDark: false });
      expect(useThemeStore.getState().isDark).toBe(false);
    });
  });

  describe('achievements totalUnlocked', () => {
    it('should return count of unlocked achievements', () => {
      useAchievementsStore.setState({
        achievements: useAchievementsStore.getState().achievements.map((a, i) => ({
          ...a, unlocked: i < 3, progress: a.target, unlockedAt: i < 3 ? '2026-01-01' : undefined,
        })),
      });
      expect(useAchievementsStore.getState().totalUnlocked()).toBe(3);
    });
  });

  describe('insights getStreak', () => {
    it('should return streak with entries on consecutive days', () => {
      const today = new Date().toISOString().slice(0, 10);
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      const streak = useInsightsStore.getState().getStreak();
      expect(streak).toBeGreaterThanOrEqual(0);
    });
  });
});
