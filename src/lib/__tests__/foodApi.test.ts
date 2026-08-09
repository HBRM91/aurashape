import { searchFoods } from '@/src/lib/foodApi';

describe('searchFoods', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock;
    fetchMock.mockReset();
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
});
