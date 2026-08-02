import { OPEN_FOOD_FACTS_API } from './constants';
import type { Food } from '@/src/types';
import { captureError } from '@/src/lib/sentry';

interface OFFProduct {
  code: string;
  product?: {
    product_name?: string;
    brands?: string;
    serving_size?: string;
    nutriments?: {
      'energy-kcal_100g'?: number;
      'energy-kcal_serving'?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      fiber_100g?: number;
    };
    image_url?: string;
  };
}

interface OFFSuggestionsResponse {
  count: number;
  products: Array<{
    code: string;
    product_name?: string;
    brands?: string;
    nutriments?: {
      'energy-kcal_100g'?: number;
      'energy-kcal_serving'?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      fiber_100g?: number;
    };
    serving_size?: string;
    image_url?: string;
  }>;
}

function mapOFFProduct(code: string, product: OFFProduct['product']): Food {
  const nutriments = product?.nutriments;
  return {
    id: code,
    name: product?.product_name || 'Unknown',
    brand: product?.brands || undefined,
    barcode: code,
    serving_size_g: parseServingSize(product?.serving_size),
    serving_name: product?.serving_size || 'serving',
    calories_per_serving: nutriments?.['energy-kcal_serving']
      || nutriments?.['energy-kcal_100g']
      || 0,
    protein_g: nutriments?.proteins_100g || 0,
    carbs_g: nutriments?.carbohydrates_100g || 0,
    fat_g: nutriments?.fat_100g || 0,
    fiber_g: nutriments?.fiber_100g || 0,
    is_verified: true,
    is_aurabiosens: false,
    source: 'open_food_facts',
    image_url: product?.image_url || undefined,
  };
}

function parseServingSize(serving?: string): number | undefined {
  if (!serving) return undefined;
  const match = serving.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : undefined;
}

export async function searchFoods(query: string): Promise<Food[]> {
  try {
    const url = `${OPEN_FOOD_FACTS_API}/search?search_terms=${encodeURIComponent(query)}&fields=code,product_name,brands,nutriments,serving_size,image_url&page_size=20&sort_by=unique_scans_n`;
    const res = await fetch(url);
    const data: OFFSuggestionsResponse = await res.json();
    return (data.products || []).map((p) => mapOFFProduct(p.code, p));
  } catch (err) {
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
