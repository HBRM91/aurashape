import { getNutritionTargets } from '@/src/lib/nutritionTargets';

describe('getNutritionTargets', () => {
  it('uses one consistent fallback policy', () => {
    expect(getNutritionTargets({})).toEqual({
      calorieTarget: 2000,
      proteinTargetG: 100,
      carbsTargetG: 200,
      fatTargetG: 55,
    });
  });

  it('preserves configured zero-free targets without mixing defaults', () => {
    expect(getNutritionTargets({ calorieTarget: 1800, proteinTargetG: 140, carbsTargetG: 160, fatTargetG: 60 })).toEqual({
      calorieTarget: 1800,
      proteinTargetG: 140,
      carbsTargetG: 160,
      fatTargetG: 60,
    });
  });
});
