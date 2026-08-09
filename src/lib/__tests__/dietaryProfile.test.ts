import { normalizeDietaryProfile } from '../dietaryProfile';

describe('dietary profile', () => {
  it('deduplicates preferences and allergies', () => {
    expect(normalizeDietaryProfile(['vegan', 'vegan'], ['peanuts', 'peanuts'])).toEqual({
      dietaryPreferences: ['vegan'],
      allergies: ['peanuts'],
    });
  });
});
