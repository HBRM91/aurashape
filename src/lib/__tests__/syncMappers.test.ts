import { mapDiaryEntryToPayload } from '../syncMappers';
import type { DiaryEntry, Food } from '@/src/types';

const mockFood: Food = {
  id: '0123456789012', // an OFF barcode, not a `foods` table UUID
  name: 'Protein Bar',
  brand: 'Aura Biosens',
  barcode: '0123456789012',
  serving_size_g: 40,
  serving_name: '40 g',
  calories_per_serving: 160,
  protein_g: 12,
  carbs_g: 16,
  fat_g: 6,
  fiber_g: 2,
  is_verified: true,
  is_aurabiosens: true,
  source: 'open_food_facts',
};

const mockEntry: DiaryEntry = {
  id: '01890a5d-ac96-774b-bcce-b302099a8057',
  user_id: 'user-1',
  food_id: mockFood.id,
  food: mockFood,
  meal_slot: 'breakfast',
  servings: 1.5,
  date: '2026-01-15',
};

describe('mapDiaryEntryToPayload', () => {
  it('never sends the client food id as food_id — it does not reference a real foods row', () => {
    const payload = mapDiaryEntryToPayload(mockEntry);
    expect(payload.food_id).toBeNull();
  });

  it('snapshots the food nutrition into custom_food_macros', () => {
    const payload = mapDiaryEntryToPayload(mockEntry);
    expect(payload.custom_food_macros).toEqual({
      calories_per_serving: 160,
      protein_g: 12,
      carbs_g: 16,
      fat_g: 6,
      fiber_g: 2,
      serving_name: '40 g',
      serving_size_g: 40,
      brand: 'Aura Biosens',
      barcode: '0123456789012',
      source: 'open_food_facts',
    });
  });

  it('carries the food name into custom_food_name', () => {
    const payload = mapDiaryEntryToPayload(mockEntry);
    expect(payload.custom_food_name).toBe('Protein Bar');
  });

  it('preserves the entry id, meal slot, servings, and date', () => {
    const payload = mapDiaryEntryToPayload(mockEntry);
    expect(payload).toEqual(expect.objectContaining({
      id: mockEntry.id,
      meal_slot: 'breakfast',
      servings: 1.5,
      date: '2026-01-15',
    }));
  });

  it('handles an entry with no food snapshot without crashing', () => {
    const entryWithoutFood: DiaryEntry = { ...mockEntry, food: undefined };
    const payload = mapDiaryEntryToPayload(entryWithoutFood);
    expect(payload.custom_food_macros).toBeNull();
    expect(payload.custom_food_name).toBeNull();
  });

  it('maps optional food fields (brand, barcode, serving size) to null when absent', () => {
    const minimalFood: Food = {
      id: 'f-minimal',
      name: 'Mystery Snack',
      serving_name: '100 g',
      calories_per_serving: 250,
      protein_g: 10,
      carbs_g: 30,
      fat_g: 5,
      fiber_g: 0,
      is_verified: true,
      is_aurabiosens: false,
      source: 'open_food_facts',
    };
    const payload = mapDiaryEntryToPayload({ ...mockEntry, food: minimalFood });
    const macros = payload.custom_food_macros as Record<string, unknown>;
    expect(macros.brand).toBeNull();
    expect(macros.barcode).toBeNull();
    expect(macros.serving_size_g).toBeNull();
  });
});
