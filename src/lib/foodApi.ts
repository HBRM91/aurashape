import { OPEN_FOOD_FACTS_API } from './constants';
import type { Food } from '@/src/types';
import { captureError } from '@/src/lib/sentry';
import { searchLocalFoods } from '@/src/lib/localFoodSearch';

interface OFFNutrients {
  'energy-kcal_100g'?: number;
  'energy-kcal_serving'?: number;
  proteins_100g?: number;
  proteins_serving?: number;
  carbohydrates_100g?: number;
  carbohydrates_serving?: number;
  fat_100g?: number;
  fat_serving?: number;
  fiber_100g?: number;
  fiber_serving?: number;
}

interface OFFProduct {
  code: string;
  product?: {
    product_name?: string;
    brands?: string;
    serving_size?: string;
    nutriments?: OFFNutrients;
    image_url?: string;
  };
}

interface OFFSuggestionsResponse {
  count: number;
  products: Array<{
    code: string;
    product_name?: string;
    brands?: string;
    nutriments?: OFFNutrients;
    serving_size?: string;
    image_url?: string;
  }>;
}

function mapOFFProduct(code: string, product: OFFProduct['product']): Food {
  const nutriments = product?.nutriments;
  const servingSizeG = parseServingSize(product?.serving_size);
  const canScale = servingSizeG != null && servingSizeG > 0;

  // OFF reliably reports per-100g density but often omits per-serving values.
  // Deriving the true per-serving amount from the known serving weight is
  // the correct fix — substituting the raw 100g number (the previous
  // behaviour) silently overstates or understates every serving that isn't
  // exactly 100g, which is the worst kind of bug in a calorie tracker.
  const perServing = (per100?: number, direct?: number): number => {
    if (direct != null) return direct;
    if (per100 != null && canScale) return (per100 * servingSizeG!) / 100;
    return per100 ?? 0;
  };

  const hasAnyDirectServingValue = [
    nutriments?.['energy-kcal_serving'],
    nutriments?.proteins_serving,
    nutriments?.carbohydrates_serving,
    nutriments?.fat_serving,
    nutriments?.fiber_serving,
  ].some((value) => value != null);

  // If there is neither a direct per-serving value nor a parsable serving
  // weight, there is no real "serving" to report — present the food per
  // 100g explicitly instead of mislabeling the 100g density as a serving.
  const usingHundredGramBasis = !hasAnyDirectServingValue && !canScale;

  return {
    id: code,
    name: product?.product_name || 'Unknown',
    brand: product?.brands || undefined,
    barcode: code,
    serving_size_g: usingHundredGramBasis ? 100 : servingSizeG,
    serving_name: usingHundredGramBasis ? '100 g' : (product?.serving_size || 'serving'),
    calories_per_serving: perServing(nutriments?.['energy-kcal_100g'], nutriments?.['energy-kcal_serving']),
    protein_g: perServing(nutriments?.proteins_100g, nutriments?.proteins_serving),
    carbs_g: perServing(nutriments?.carbohydrates_100g, nutriments?.carbohydrates_serving),
    fat_g: perServing(nutriments?.fat_100g, nutriments?.fat_serving),
    fiber_g: perServing(nutriments?.fiber_100g, nutriments?.fiber_serving),
    is_verified: true,
    is_aurabiosens: false,
    source: 'open_food_facts',
    image_url: product?.image_url || undefined,
  };
}

function parseServingSize(serving?: string): number | undefined {
  if (!serving) return undefined;
  // OFF's serving_size string varies: "40 g", "250ml", "1 bar (40g)",
  // "2 biscuits (30 g)". A leading count ("1", "2") is not the serving
  // weight, so prefer a number that's actually paired with a weight/volume
  // unit; only fall back to the first number found if no unit is present.
  const unitMatch = serving.match(/(\d+(?:[.,]\d+)?)\s*(g|ml)\b/i);
  if (unitMatch) return parseFloat(unitMatch[1].replace(',', '.'));
  const anyNumber = serving.match(/\d+(?:[.,]\d+)?/);
  return anyNumber ? parseFloat(anyNumber[0].replace(',', '.')) : undefined;
}

function normalizeForDedupe(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Local (USDA) results come first -- they're curated, always-available whole
// foods, which is what most searches are for ("chicken breast", "banana").
// OFF adds packaged/branded products on top, skipping any that are
// effectively the same food already surfaced locally.
export function mergeFoodResults(localResults: Food[], offResults: Food[]): Food[] {
  const seen = new Set(localResults.map((food) => normalizeForDedupe(food.name)));
  const dedupedOff = offResults.filter((food) => !seen.has(normalizeForDedupe(food.name)));
  return [...localResults, ...dedupedOff];
}

export async function searchFoods(query: string, signal?: AbortSignal): Promise<Food[]> {
  // Local search never touches the network, so kick it off unconditionally
  // and merge it in regardless of how the OFF request turns out -- this is
  // what makes food search actually work offline for the first time.
  const localResultsPromise = searchLocalFoods(query).catch(() => [] as Food[]);

  try {
    const url = `${OPEN_FOOD_FACTS_API}/search?search_terms=${encodeURIComponent(query)}&fields=code,product_name,brands,nutriments,serving_size,image_url&page_size=20&sort_by=unique_scans_n`;
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error('Food search failed');
    const data: OFFSuggestionsResponse = await res.json();
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const offResults = (data.products || [])
      .filter((product) => {
        const name = `${product.product_name || ''} ${product.brands || ''}`.toLowerCase();
        return Boolean(product.product_name) && terms.every((term) => name.includes(term));
      })
      .map((p) => mapOFFProduct(p.code, p));
    return mergeFoodResults(await localResultsPromise, offResults);
  } catch (err) {
    // OFF is unreachable or failed -- degrade gracefully to local-only
    // results instead of failing the whole search when we have something
    // useful to show.
    const localResults = await localResultsPromise;
    if (localResults.length > 0) return localResults;
    captureError(err as Error, { context: 'searchFoods' });
    throw err;
  }
}

export async function getFoodByBarcode(barcode: string): Promise<Food | null> {
  try {
    const url = `${OPEN_FOOD_FACTS_API}/product/${encodeURIComponent(barcode)}?fields=code,product_name,brands,nutriments,serving_size,image_url`;
    const res = await fetch(url);
    const data: OFFProduct = await res.json();
    if (!data.product) return null;
    return mapOFFProduct(data.code, data.product);
  } catch (err) {
    captureError(err as Error, { context: 'getFoodByBarcode' });
    throw err;
  }
}
