import type { DiaryEntry } from '@/src/types';

/**
 * Maps a client DiaryEntry to a payload the `diary_entries` table will
 * actually accept.
 *
 * The client always carries a fully denormalized `food` snapshot with an ID
 * that's either an Open Food Facts barcode or a locally-generated UUID —
 * never a row in the server's shared `foods` table. Sending that ID as
 * `food_id` gets rejected by the `UUID REFERENCES foods(id)` foreign key
 * (or silently references the wrong row, on the rare occasion it happens to
 * collide with a real one). The schema already has the correct escape hatch
 * for this — `custom_food_name` / `custom_food_macros` — it was simply never
 * used by the client. See docs/ARCHITECTURE-REVIEW-AND-BACKLOG.md A14/FND-07.
 *
 * `food_id` is left null and the nutrition data is snapshotted into
 * `custom_food_macros` instead, which is also the more correct behavior for
 * a diary: it records what the food's nutrition was believed to be at the
 * moment it was logged, immune to that food's data changing later.
 */
export function mapDiaryEntryToPayload(entry: DiaryEntry): Record<string, unknown> {
  return {
    id: entry.id,
    food_id: null,
    custom_food_name: entry.food?.name ?? null,
    custom_food_macros: entry.food
      ? {
          calories_per_serving: entry.food.calories_per_serving,
          protein_g: entry.food.protein_g,
          carbs_g: entry.food.carbs_g,
          fat_g: entry.food.fat_g,
          fiber_g: entry.food.fiber_g,
          serving_name: entry.food.serving_name,
          serving_size_g: entry.food.serving_size_g ?? null,
          brand: entry.food.brand ?? null,
          barcode: entry.food.barcode ?? null,
          source: entry.food.source,
        }
      : null,
    meal_slot: entry.meal_slot,
    servings: entry.servings,
    date: entry.date,
  };
}
