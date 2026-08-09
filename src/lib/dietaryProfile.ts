export const DIETARY_OPTIONS = [
  'omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'mediterranean', 'high_protein',
] as const;

export const ALLERGY_OPTIONS = [
  'dairy', 'eggs', 'gluten', 'peanuts', 'tree_nuts', 'soy', 'fish', 'shellfish', 'sesame', 'mustard',
] as const;

export type DietaryOption = typeof DIETARY_OPTIONS[number];
export type AllergyOption = typeof ALLERGY_OPTIONS[number];

export function normalizeDietaryProfile(preferences: string[], allergies: string[]) {
  return {
    dietaryPreferences: [...new Set(preferences)].filter((value): value is DietaryOption => DIETARY_OPTIONS.includes(value as DietaryOption)),
    allergies: [...new Set(allergies)].filter((value): value is AllergyOption => ALLERGY_OPTIONS.includes(value as AllergyOption)),
  };
}
