import { useWaterStore } from '@/src/stores/water';

beforeEach(() => {
  useWaterStore.setState({ waterMl: {}, fruitCount: {}, vegCount: {} });
});

describe('Water Store', () => {
  describe('addWater', () => {
    it('should add water for a date', () => {
      useWaterStore.getState().addWater('2026-03-15', 250);
      expect(useWaterStore.getState().waterMl['2026-03-15']).toBe(250);
    });

    it('should accumulate water for same date', () => {
      useWaterStore.getState().addWater('2026-03-15', 250);
      useWaterStore.getState().addWater('2026-03-15', 250);
      expect(useWaterStore.getState().waterMl['2026-03-15']).toBe(500);
    });

    it('should handle multiple dates independently', () => {
      useWaterStore.getState().addWater('2026-03-15', 250);
      useWaterStore.getState().addWater('2026-03-16', 500);
      expect(useWaterStore.getState().waterMl['2026-03-15']).toBe(250);
      expect(useWaterStore.getState().waterMl['2026-03-16']).toBe(500);
    });
  });

  describe('setWater', () => {
    it('should set absolute water value', () => {
      useWaterStore.getState().addWater('2026-03-15', 250);
      useWaterStore.getState().setWater('2026-03-15', 1000);
      expect(useWaterStore.getState().waterMl['2026-03-15']).toBe(1000);
    });
  });

  describe('addFruit', () => {
    it('should increment fruit count', () => {
      useWaterStore.getState().addFruit('2026-03-15');
      useWaterStore.getState().addFruit('2026-03-15');
      expect(useWaterStore.getState().fruitCount['2026-03-15']).toBe(2);
    });
  });

  describe('addVeg', () => {
    it('should increment vegetable count', () => {
      useWaterStore.getState().addVeg('2026-03-15');
      useWaterStore.getState().addVeg('2026-03-15');
      useWaterStore.getState().addVeg('2026-03-15');
      expect(useWaterStore.getState().vegCount['2026-03-15']).toBe(3);
    });
  });

  describe('resetDate', () => {
    it('should reset all trackers for a date', () => {
      useWaterStore.getState().addWater('2026-03-15', 500);
      useWaterStore.getState().addFruit('2026-03-15');
      useWaterStore.getState().addVeg('2026-03-15');
      useWaterStore.getState().resetDate('2026-03-15');
      expect(useWaterStore.getState().waterMl['2026-03-15']).toBe(0);
      expect(useWaterStore.getState().fruitCount['2026-03-15']).toBe(0);
      expect(useWaterStore.getState().vegCount['2026-03-15']).toBe(0);
    });
  });
});
