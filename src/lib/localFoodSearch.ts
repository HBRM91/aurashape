import type { Food } from '@/src/types';

// Bundled USDA SR Legacy dataset (public domain, all values per 100g edible
// portion). Loaded lazily via dynamic import so the ~2.7MB JSON never ends
// up in the initial web bundle -- only paid for once a user actually
// searches for food.
interface UsdaFoodRecord {
  id: string;
  name: string;
  category: string | null;
  serving_size_g: number;
  serving_name: string;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  saturated_fat_g: number;
  sodium_mg: number;
  is_verified: boolean;
  is_aurabiosens: boolean;
  source: string;
}

let cachedRecords: UsdaFoodRecord[] | null = null;
let loadPromise: Promise<UsdaFoodRecord[]> | null = null;

async function loadUsdaFoods(): Promise<UsdaFoodRecord[]> {
  if (cachedRecords) return cachedRecords;
  if (!loadPromise) {
    loadPromise = import('./data/usdaFoods.json').then((mod) => {
      const records = ((mod as { default?: UsdaFoodRecord[] }).default ?? (mod as unknown as UsdaFoodRecord[]));
      cachedRecords = records;
      return records;
    });
  }
  return loadPromise;
}

function toFood(record: UsdaFoodRecord): Food {
  return {
    id: record.id,
    name: record.name,
    serving_size_g: record.serving_size_g,
    serving_name: record.serving_name,
    calories_per_serving: record.calories_per_serving,
    protein_g: record.protein_g,
    carbs_g: record.carbs_g,
    fat_g: record.fat_g,
    fiber_g: record.fiber_g,
    sugar_g: record.sugar_g,
    saturated_fat_g: record.saturated_fat_g,
    is_verified: record.is_verified,
    is_aurabiosens: record.is_aurabiosens,
    source: record.source,
  };
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

// Every query term must prefix-match at least one token in the food's name
// (so "chick" matches "Chicken" but not "hicken"). This is deliberately
// stricter than a loose substring-anywhere check -- that's the same bug
// class already fixed once in the OFF search filter, where "all terms are
// substrings of the combined name" let unrelated words match.
// Lower score = better match; null = no match.
function matchScore(nameTokens: string[], queryTerms: string[]): number | null {
  let score = 0;
  for (const term of queryTerms) {
    const idx = nameTokens.findIndex((token) => token.startsWith(term));
    if (idx === -1) return null;
    const exact = nameTokens[idx] === term;
    score += idx * 10 + (exact ? 0 : 1);
  }
  return score;
}

export async function searchLocalFoods(query: string, limit = 15): Promise<Food[]> {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const records = await loadUsdaFoods();
  const scored: Array<{ record: UsdaFoodRecord; score: number }> = [];
  for (const record of records) {
    const score = matchScore(tokenize(record.name), terms);
    if (score != null) scored.push({ record, score });
  }

  scored.sort((a, b) => a.score - b.score || a.record.name.length - b.record.name.length);
  return scored.slice(0, limit).map((entry) => toFood(entry.record));
}
