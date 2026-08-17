import { mapDiaryEntryToPayload, mapPayloadToDiaryEntry } from '../syncMappers';
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
      food_client_id: '0123456789012',
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
      is_verified: true,
      is_aurabiosens: true,
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

describe('mapPayloadToDiaryEntry', () => {
  it('round-trips a DiaryEntry through mapDiaryEntryToPayload without changing the food id', () => {
    // The whole point of food_client_id: a food's identity must survive a
    // sync round-trip, or favoriting/recent-foods matching by id silently
    // breaks the moment a synced entry gets pulled back down.
    const payload = mapDiaryEntryToPayload(mockEntry);
    const roundTripped = mapPayloadToDiaryEntry(payload);
    expect(roundTripped.food?.id).toBe(mockFood.id);
    expect(roundTripped.food).toEqual(mockFood);
    expect(roundTripped.id).toBe(mockEntry.id);
    expect(roundTripped.meal_slot).toBe('breakfast');
    expect(roundTripped.servings).toBe(1.5);
    expect(roundTripped.date).toBe('2026-01-15');
  });

  it('falls back to the row id for food.id on a pre-migration row with no food_client_id', () => {
    const legacyRow = {
      id: 'entry-1',
      custom_food_name: 'Old Snack',
      custom_food_macros: { calories_per_serving: 100, protein_g: 5, carbs_g: 10, fat_g: 2, fiber_g: 1, serving_name: 'serving' },
      meal_slot: 'snack',
      servings: 1,
      date: '2026-01-01',
    };
    const entry = mapPayloadToDiaryEntry(legacyRow);
    expect(entry.food?.id).toBe('entry-1');
  });

  it('coerces servings to a real number even if PostgREST returned it as a numeric string', () => {
    const row = {
      id: 'entry-2',
      custom_food_name: null,
      custom_food_macros: null,
      meal_slot: 'lunch',
      servings: '2.5', // NUMERIC columns can come back as strings
      date: '2026-01-01',
    };
    const entry = mapPayloadToDiaryEntry(row);
    expect(entry.servings).toBe(2.5);
    expect(typeof entry.servings).toBe('number');
  });

  it('leaves food undefined when custom_food_macros is null', () => {
    const row = {
      id: 'entry-3',
      custom_food_name: null,
      custom_food_macros: null,
      meal_slot: 'dinner',
      servings: 1,
      date: '2026-01-01',
    };
    const entry = mapPayloadToDiaryEntry(row);
    expect(entry.food).toBeUndefined();
    expect(entry.food_id).toBeUndefined();
  });
});
