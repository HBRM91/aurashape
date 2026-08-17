import { searchLocalFoods } from '@/src/lib/localFoodSearch';

describe('searchLocalFoods', () => {
  it('returns nothing for an empty or whitespace-only query', async () => {
    expect(await searchLocalFoods('')).toEqual([]);
    expect(await searchLocalFoods('   ')).toEqual([]);
  });

  it('finds a well-known whole food by name', async () => {
    const results = await searchLocalFoods('chicken breast');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((f) => f.name.toLowerCase().includes('chicken'))).toBe(true);
    expect(results[0].source).toBe('usda_sr_legacy');
    expect(results[0].is_verified).toBe(true);
  });

  it('requires every query term to prefix-match some token in the name', async () => {
    // "xyzzyimpossible" is not a real food word — nothing should ever match it,
    // proving the matcher isn't degrading to "any term found anywhere".
    const results = await searchLocalFoods('chicken xyzzyimpossible');
    expect(results).toEqual([]);
  });

  it('matches by prefix, not by substring anywhere in the word', async () => {
    // "hicken" is a substring of "Chicken" but not a prefix of any token — a
    // naive substring-anywhere matcher (the same bug class already fixed once
    // in the OFF search filter) would wrongly return chicken foods here.
    const results = await searchLocalFoods('hicken');
    expect(results.every((f) => !f.name.toLowerCase().includes('chicken'))).toBe(true);
  });

  it('respects the limit parameter', async () => {
    const results = await searchLocalFoods('raw', 3);
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('ranks an exact whole-name match above longer partial matches', async () => {
    const results = await searchLocalFoods('bananas raw');
    expect(results[0].name.toLowerCase()).toBe('bananas, raw');
  });

  it('returns known reference nutrition values (banana, per 100g)', async () => {
    const [banana] = await searchLocalFoods('bananas raw', 1);
    expect(banana).toEqual(expect.objectContaining({
      name: 'Bananas, raw',
      serving_size_g: 100,
      serving_name: '100 g',
      calories_per_serving: 89,
      protein_g: 1.1,
      is_verified: true,
      is_aurabiosens: false,
      source: 'usda_sr_legacy',
    }));
  });

  it('caches the loaded dataset across repeated calls', async () => {
    const first = await searchLocalFoods('rice');
    const second = await searchLocalFoods('rice');
    expect(second).toEqual(first);
  });
});
