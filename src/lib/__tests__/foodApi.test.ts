import { searchFoods, mergeFoodResults } from '@/src/lib/foodApi';
import { searchLocalFoods } from '@/src/lib/localFoodSearch';
import type { Food } from '@/src/types';

jest.mock('@/src/lib/localFoodSearch');

const searchLocalFoodsMock = searchLocalFoods as jest.MockedFunction<typeof searchLocalFoods>;

describe('searchFoods', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock;
    fetchMock.mockReset();
    // Existing tests below exercise OFF mapping/filtering in isolation, so
    // local search is a no-op unless a test explicitly opts in.
    searchLocalFoodsMock.mockReset();
    searchLocalFoodsMock.mockResolvedValue([]);
  });

  it('keeps relevant products and rejects unrelated results', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [
          { code: '1', product_name: 'Chocolate milk', nutriments: { 'energy-kcal_serving': 180 } },
          { code: '2', product_name: 'Chicken breast grilled', serving_size: '100 g', nutriments: { 'energy-kcal_serving': 165, proteins_100g: 31, carbohydrates_100g: 0, fat_100g: 3.6 } },
        ],
      }),
    });

    const results = await searchFoods('chicken breast');

    expect(results.map((food) => food.name)).toEqual(['Chicken breast grilled']);
  });

  it('uses serving nutrition consistently and preserves zero values', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [{
          code: '2',
          product_name: 'Chicken breast grilled',
          serving_size: '150 g',
          nutriments: {
            'energy-kcal_serving': 248,
            proteins_serving: 46.5,
            carbohydrates_serving: 0,
            fat_serving: 5.4,
            fiber_serving: 0,
          },
        }],
      }),
    });

    const [result] = await searchFoods('chicken breast');

    expect(result).toEqual(expect.objectContaining({
      calories_per_serving: 248,
      protein_g: 46.5,
      carbs_g: 0,
      fat_g: 5.4,
      fiber_g: 0,
    }));
  });

  it('throws when the food provider responds with an error', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    await expect(searchFoods('chicken')).rejects.toThrow('Food search failed');
  });

  it('derives real per-serving values from 100g density instead of substituting the 100g number', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [{
          code: '3',
          product_name: 'Protein bar',
          serving_size: '40 g',
          nutriments: {
            'energy-kcal_100g': 400,
            proteins_100g: 30,
            carbohydrates_100g: 40,
            fat_100g: 15,
            fiber_100g: 5,
          },
        }],
      }),
    });

    const [result] = await searchFoods('protein bar');

    // 400 kcal/100g at a 40g serving is 160 kcal — not 400, which is what
    // the previous implementation silently returned (a 2.5x overstatement).
    expect(result).toEqual(expect.objectContaining({
      serving_size_g: 40,
      serving_name: '40 g',
      calories_per_serving: 160,
      protein_g: 12,
      carbs_g: 16,
      fat_g: 6,
      fiber_g: 2,
    }));
  });

  it('extracts the weight from a "count (weight)" serving description, not the leading count', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [{
          code: '4',
          product_name: 'Biscuits',
          serving_size: '2 biscuits (30 g)',
          nutriments: { 'energy-kcal_100g': 500 },
        }],
      }),
    });

    const [result] = await searchFoods('biscuits');

    // The leading "2" is a count, not a gram weight — the real serving is 30g.
    expect(result.serving_size_g).toBe(30);
    expect(result.calories_per_serving).toBe(150);
  });

  it('falls back to an explicit 100g basis when no serving size can be determined', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [{
          code: '5',
          product_name: 'Mystery snack',
          nutriments: { 'energy-kcal_100g': 250, proteins_100g: 10 },
        }],
      }),
    });

    const [result] = await searchFoods('mystery snack');

    // No serving_size string and no direct per-serving values — the food is
    // honestly labeled per 100g rather than presented as an unlabeled "serving".
    expect(result).toEqual(expect.objectContaining({
      serving_size_g: 100,
      serving_name: '100 g',
      calories_per_serving: 250,
      protein_g: 10,
    }));
  });

  it('places local (USDA) results ahead of OFF results', async () => {
    const localFood: Food = {
      id: 'usda-1', name: 'Chicken, raw', serving_size_g: 100, serving_name: '100 g',
      calories_per_serving: 120, protein_g: 22, carbs_g: 0, fat_g: 3, fiber_g: 0,
      is_verified: true, is_aurabiosens: false, source: 'usda_sr_legacy',
    };
    searchLocalFoodsMock.mockResolvedValueOnce([localFood]);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [{ code: 'off-1', product_name: 'Chicken nuggets', nutriments: { 'energy-kcal_serving': 300 } }],
      }),
    });

    const results = await searchFoods('chicken');

    expect(results.map((f) => f.id)).toEqual(['usda-1', 'off-1']);
  });

  it('degrades gracefully to local-only results when OFF is unreachable', async () => {
    const localFood: Food = {
      id: 'usda-2', name: 'Rice, white', serving_size_g: 100, serving_name: '100 g',
      calories_per_serving: 365, protein_g: 7, carbs_g: 80, fat_g: 0.7, fiber_g: 1.3,
      is_verified: true, is_aurabiosens: false, source: 'usda_sr_legacy',
    };
    searchLocalFoodsMock.mockResolvedValueOnce([localFood]);
    fetchMock.mockRejectedValueOnce(new Error('network unreachable'));

    const results = await searchFoods('rice');

    expect(results).toEqual([localFood]);
  });

  it('still throws when OFF fails and local search found nothing either', async () => {
    searchLocalFoodsMock.mockResolvedValueOnce([]);
    fetchMock.mockRejectedValueOnce(new Error('network unreachable'));

    await expect(searchFoods('zzzznotarealfood')).rejects.toThrow('network unreachable');
  });
});

describe('mergeFoodResults', () => {
  const local: Food = {
    id: 'usda-1', name: 'Banana, raw', serving_size_g: 100, serving_name: '100 g',
    calories_per_serving: 89, protein_g: 1.1, carbs_g: 22.8, fat_g: 0.3, fiber_g: 2.6,
    is_verified: true, is_aurabiosens: false, source: 'usda_sr_legacy',
  };

  it('drops an OFF result that duplicates a local result by name', () => {
    const duplicateOff: Food = { ...local, id: 'off-dup', name: 'banana, RAW', source: 'open_food_facts' };
    const uniqueOff: Food = { ...local, id: 'off-unique', name: 'Banana bread', source: 'open_food_facts' };

    const merged = mergeFoodResults([local], [duplicateOff, uniqueOff]);

    expect(merged.map((f) => f.id)).toEqual(['usda-1', 'off-unique']);
  });

  it('returns local results unchanged when there are no OFF results', () => {
    expect(mergeFoodResults([local], [])).toEqual([local]);
  });
});
