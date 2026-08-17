import type { DiaryEntry, Food, MealSlot } from '@/src/types';

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
          // The client's own Food.id (an OFF barcode or locally-generated
          // id) — preserved so a pulled row can be reconstructed back into
          // an equivalent Food without silently changing its identity
          // (which would break favoriting/recent-foods matching by id on
          // any device that later pulls this entry). See
          // mapPayloadToDiaryEntry below.
          food_client_id: entry.food.id,
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
          is_verified: entry.food.is_verified,
          // Preserved specifically for the brand-funnel product-gap
          // surface (docs/ARCHITECTURE-REVIEW-AND-BACKLOG.md §12.5
          // BRAND-02), which reads this flag — it must survive a sync
          // round-trip, not silently reset to false.
          is_aurabiosens: entry.food.is_aurabiosens,
        }
      : null,
    meal_slot: entry.meal_slot,
    servings: entry.servings,
    date: entry.date,
  };
}

/**
 * The inverse of mapDiaryEntryToPayload — reconstructs a client DiaryEntry
 * from a `diary_entries` row pulled from the server (used by the sync pull
 * path; see src/stores/sync.ts::pullChanges). Supabase/PostgREST returns
 * NUMERIC columns as strings in some configurations, so numeric fields are
 * coerced explicitly rather than trusted to already be numbers.
 */
export function mapPayloadToDiaryEntry(row: Record<string, unknown>): DiaryEntry {
  const macros = row.custom_food_macros as Record<string, unknown> | null;

  const food: Food | undefined = macros
    ? {
        // Prefer the id the client originally assigned this food snapshot;
        // only a pre-migration row (synced before food_client_id existed)
        // falls back to the entry's own id.
        id: (macros.food_client_id as string) ?? (row.id as string),
        name: (row.custom_food_name as string) ?? 'Unknown',
        brand: (macros.brand as string) ?? undefined,
        barcode: (macros.barcode as string) ?? undefined,
        serving_size_g: macros.serving_size_g != null ? Number(macros.serving_size_g) : undefined,
        serving_name: (macros.serving_name as string) ?? 'serving',
        calories_per_serving: Number(macros.calories_per_serving ?? 0),
        protein_g: Number(macros.protein_g ?? 0),
        carbs_g: Number(macros.carbs_g ?? 0),
        fat_g: Number(macros.fat_g ?? 0),
        fiber_g: Number(macros.fiber_g ?? 0),
        is_verified: Boolean(macros.is_verified ?? true),
        is_aurabiosens: Boolean(macros.is_aurabiosens ?? false),
        source: (macros.source as string) ?? 'open_food_facts',
      }
    : undefined;

  return {
    id: row.id as string,
    user_id: (row.user_id as string) ?? '',
    food_id: food?.id,
    food,
    meal_slot: row.meal_slot as MealSlot,
    servings: Number(row.servings),
    date: row.date as string,
  };
}
