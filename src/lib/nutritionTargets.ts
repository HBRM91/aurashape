export interface NutritionTargets {
  calorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
}

const DEFAULT_TARGETS: NutritionTargets = {
  calorieTarget: 2000,
  proteinTargetG: 100,
  carbsTargetG: 200,
  fatTargetG: 55,
};

export function getNutritionTargets(values: Partial<NutritionTargets>): NutritionTargets {
  return {
    calorieTarget: values.calorieTarget ?? DEFAULT_TARGETS.calorieTarget,
    proteinTargetG: values.proteinTargetG ?? DEFAULT_TARGETS.proteinTargetG,
    carbsTargetG: values.carbsTargetG ?? DEFAULT_TARGETS.carbsTargetG,
    fatTargetG: values.fatTargetG ?? DEFAULT_TARGETS.fatTargetG,
  };
}
