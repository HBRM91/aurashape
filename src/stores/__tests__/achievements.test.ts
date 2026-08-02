import { useAchievementsStore } from '@/src/stores/achievements';

beforeEach(() => {
  useAchievementsStore.setState({
    achievements: useAchievementsStore.getState().achievements.map((a) => ({
      ...a, unlocked: false, progress: 0, unlockedAt: undefined,
    })),
  });
});

describe('Achievements Store', () => {
  describe('initial state', () => {
    it('should have 18 achievements', () => {
      expect(useAchievementsStore.getState().achievements.length).toBe(18);
    });

    it('should have no unlocked achievements initially', () => {
      expect(useAchievementsStore.getState().totalUnlocked()).toBe(0);
    });

    it('should have achievements in all categories', () => {
      const cats = new Set(useAchievementsStore.getState().achievements.map((a) => a.category));
      expect(cats.has('nutrition')).toBe(true);
      expect(cats.has('fitness')).toBe(true);
      expect(cats.has('mindfulness')).toBe(true);
      expect(cats.has('tracking')).toBe(true);
      expect(cats.has('community')).toBe(true);
    });
  });

  describe('checkAchievements', () => {
    it('should not throw when called with empty stores', () => {
      expect(() => useAchievementsStore.getState().checkAchievements()).not.toThrow();
    });
  });

  describe('totalUnlocked', () => {
    it('should return 0 with no progress', () => {
      expect(useAchievementsStore.getState().totalUnlocked()).toBe(0);
    });
  });
});
