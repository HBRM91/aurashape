import { useDiaryStore } from '@/src/stores/diary';
import type { Food } from '@/src/types';

const mockFood: Food = {
  id: 'f1',
  name: 'Chicken Breast',
  brand: 'Generic',
  serving_name: '100g',
  serving_size_g: 100,
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
  serving_size_g: 100,
  calories_per_serving: 123,
  protein_g: 2.7,
  carbs_g: 25.6,
  fat_g: 0.9,
  fiber_g: 1.6,
  is_verified: true,
  is_aurabiosens: false,
  source: 'system',
};

const mockFood3: Food = {
  id: 'f3',
  name: 'Olive Oil',
  serving_name: '1 tbsp',
  serving_size_g: 15,
  calories_per_serving: 119,
  protein_g: 0,
  carbs_g: 0,
  fat_g: 13.5,
  fiber_g: 0,
  is_verified: true,
  is_aurabiosens: false,
  source: 'system',
};

beforeEach(() => {
  useDiaryStore.setState({
    selectedDate: '2026-01-15',
    entries: [],
    recentFoods: [],
  });
});

describe('Diary Store', () => {
  describe('setDate', () => {
    it('should update the selected date', () => {
      useDiaryStore.getState().setDate('2026-02-01');
      expect(useDiaryStore.getState().selectedDate).toBe('2026-02-01');
    });
  });

  describe('addEntry', () => {
    it('should add a food entry for the selected date', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      const entries = useDiaryStore.getState().entries;
      expect(entries).toHaveLength(1);
      expect(entries[0].food?.name).toBe('Chicken Breast');
      expect(entries[0].meal_slot).toBe('breakfast');
      expect(entries[0].date).toBe('2026-01-15');
      expect(entries[0].servings).toBe(1);
    });

    it('should add entry with custom servings', () => {
      useDiaryStore.getState().addEntry(mockFood, 'lunch', 2);
      const entries = useDiaryStore.getState().entries;
      expect(entries[0].servings).toBe(2);
    });

    it('should track recent foods', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      useDiaryStore.getState().addEntry(mockFood2, 'lunch');
      const recent = useDiaryStore.getState().recentFoods;
      expect(recent).toHaveLength(2);
      expect(recent[0].name).toBe('Brown Rice');
    });

    it('should deduplicate recent foods (move to front)', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      useDiaryStore.getState().addEntry(mockFood2, 'lunch');
      useDiaryStore.getState().addEntry(mockFood, 'dinner');
      const recent = useDiaryStore.getState().recentFoods;
      expect(recent).toHaveLength(2);
      expect(recent[0].name).toBe('Chicken Breast');
    });
  });

  describe('updateEntry', () => {
    it('should update servings of an existing entry', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      const entryId = useDiaryStore.getState().entries[0].id;
      useDiaryStore.getState().updateEntry(entryId, 3);
      const updated = useDiaryStore.getState().entries[0];
      expect(updated.servings).toBe(3);
    });

    it('should not throw for non-existent entry', () => {
      useDiaryStore.getState().updateEntry('nonexistent', 5);
      const entries = useDiaryStore.getState().entries;
      expect(entries).toHaveLength(0);
    });
  });

  describe('removeEntry', () => {
    it('should remove an entry by id', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      useDiaryStore.getState().addEntry(mockFood2, 'lunch');
      const entryId = useDiaryStore.getState().entries[0].id;
      useDiaryStore.getState().removeEntry(entryId);
      const entries = useDiaryStore.getState().entries;
      expect(entries).toHaveLength(1);
      expect(entries[0].food?.name).toBe('Brown Rice');
    });
  });

  describe('copyFromDate', () => {
    it('should copy entries from another date to the selected date', () => {
      useDiaryStore.getState().setDate('2026-01-14');
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      useDiaryStore.getState().addEntry(mockFood2, 'lunch');

      useDiaryStore.getState().setDate('2026-01-15');
      useDiaryStore.getState().copyFromDate('2026-01-14');

      const copied = useDiaryStore.getState().entries.filter((e) => e.date === '2026-01-15');
      expect(copied).toHaveLength(2);
      expect(copied[0].food?.name).toBe('Chicken Breast');
      expect(copied[0].meal_slot).toBe('breakfast');
    });
  });

  describe('getEntriesBySlot', () => {
    it('should return entries for a specific date and slot', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      useDiaryStore.getState().addEntry(mockFood2, 'lunch');
      useDiaryStore.getState().addEntry(mockFood3, 'lunch');

      const breakfast = useDiaryStore.getState().getEntriesBySlot('2026-01-15', 'breakfast');
      const lunch = useDiaryStore.getState().getEntriesBySlot('2026-01-15', 'lunch');
      const snacks = useDiaryStore.getState().getEntriesBySlot('2026-01-15', 'snack');

      expect(breakfast).toHaveLength(1);
      expect(lunch).toHaveLength(2);
      expect(snacks).toHaveLength(0);
    });

    it('should return empty array for non-existent date', () => {
      const result = useDiaryStore.getState().getEntriesBySlot('2025-01-01', 'breakfast');
      expect(result).toHaveLength(0);
    });
  });

  describe('getSlotCalories', () => {
    it('should sum calories for a specific slot', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast', 2);
      const calories = useDiaryStore.getState().getSlotCalories('2026-01-15', 'breakfast');
      expect(calories).toBe(330);
    });

    it('should return 0 for empty slot', () => {
      const calories = useDiaryStore.getState().getSlotCalories('2026-01-15', 'dinner');
      expect(calories).toBe(0);
    });
  });

  describe('getDailyCalories', () => {
    it('should sum calories across all meals', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      useDiaryStore.getState().addEntry(mockFood2, 'lunch');
      useDiaryStore.getState().addEntry(mockFood3, 'dinner');
      const total = useDiaryStore.getState().getDailyCalories('2026-01-15');
      expect(total).toBe(165 + 123 + 119);
    });

    it('should return 0 for date with no entries', () => {
      const total = useDiaryStore.getState().getDailyCalories('2025-01-01');
      expect(total).toBe(0);
    });
  });

  describe('getDailyMacros', () => {
    it('should sum macros across all meals', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast');
      useDiaryStore.getState().addEntry(mockFood2, 'lunch');
      const macros = useDiaryStore.getState().getDailyMacros('2026-01-15');
      expect(macros.protein).toBeCloseTo(31 + 2.7, 1);
      expect(macros.carbs).toBeCloseTo(0 + 25.6, 1);
      expect(macros.fat).toBeCloseTo(3.6 + 0.9, 1);
    });

    it('should return zeros for empty date', () => {
      const macros = useDiaryStore.getState().getDailyMacros('2025-01-01');
      expect(macros.protein).toBe(0);
      expect(macros.carbs).toBe(0);
      expect(macros.fat).toBe(0);
    });

    it('should account for servings multiplier', () => {
      useDiaryStore.getState().addEntry(mockFood, 'breakfast', 3);
      const macros = useDiaryStore.getState().getDailyMacros('2026-01-15');
      expect(macros.protein).toBeCloseTo(31 * 3, 1);
    });
  });
});
