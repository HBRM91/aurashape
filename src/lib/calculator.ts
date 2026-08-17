import { ActivityLevel, Goal } from '@/src/types';

interface BodyMetrics {
  age: number;
  sex: 'male' | 'female';
  weightKg: number;
  heightCm: number;
}

interface MacroTargets {
  calorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

function bmrMifflinStJeor(m: BodyMetrics): number {
  const base = 10 * m.weightKg + 6.25 * m.heightCm - 5 * m.age;
  return m.sex === 'male' ? base + 5 : base - 161;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  lightly_active: 1.375,
  moderately_active: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function calculateTDEE(metrics: BodyMetrics, activity: ActivityLevel): number {
  return Math.round(bmrMifflinStJeor(metrics) * ACTIVITY_MULTIPLIERS[activity]);
}

/**
 * Splits an already-decided calorie target into protein/fat/carb grams.
 * Use this directly (not calculateMacros) when the caller has already
 * computed its own calorie target — e.g. from a user-chosen weekly rate of
 * change — since calculateMacros applies its own fixed deficit/surplus on
 * top of whatever TDEE it's given. Passing an already-deficited number into
 * calculateMacros double-applies the deficit (see
 * docs/ARCHITECTURE-REVIEW-AND-BACKLOG.md for the bug this fixes).
 */
export function macrosFromCalories(calorieTarget: number, bodyWeightKg: number): MacroTargets {
  const rounded = Math.round(calorieTarget);
  const proteinG = Math.round(bodyWeightKg * 2.0);
  const fatG = Math.round((rounded * 0.25) / 9);
  const remainingCal = rounded - proteinG * 4 - fatG * 9;
  const carbsG = Math.round(Math.max(remainingCal / 4, 0));

  return { calorieTarget: rounded, proteinG, carbsG, fatG };
}

export function calculateMacros(tdee: number, goal: Goal, bodyWeightKg: number): MacroTargets {
  let calorieTarget: number;

  switch (goal) {
    case 'lose_weight':
      calorieTarget = Math.round(tdee - 500);
      break;
    case 'build_muscle':
      calorieTarget = Math.round(tdee + 300);
      break;
    case 'maintain':
    case 'improve_health':
    default:
      calorieTarget = tdee;
      break;
  }

  return macrosFromCalories(calorieTarget, bodyWeightKg);
}

export interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  healthyMin: number;
  healthyMax: number;
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  
  let category: string;
  let color: string;
  
  if (bmi < 18.5) { category = 'Underweight'; color = '#3B82F6'; }
  else if (bmi < 25) { category = 'Healthy'; color = '#22C55E'; }
  else if (bmi < 30) { category = 'Overweight'; color = '#F59E0B'; }
  else if (bmi < 35) { category = 'Obese (Class I)'; color = '#F97316'; }
  else if (bmi < 40) { category = 'Obese (Class II)'; color = '#EF4444'; }
  else { category = 'Obese (Class III)'; color = '#DC2626'; }

  const healthyMin = parseFloat((18.5 * heightM * heightM).toFixed(1));
  const healthyMax = parseFloat((24.9 * heightM * heightM).toFixed(1));

  return { bmi, category, color, healthyMin, healthyMax };
}

export function estimateBodyFatPct(sex: 'male' | 'female', bmi: number, age: number): number {
  const pct = (1.20 * bmi) + (0.23 * age) - (sex === 'male' ? 16.2 : 5.4);
  return parseFloat(Math.max(3, Math.min(50, pct)).toFixed(1));
}

export function getWeightProgress(
  currentKg: number, startKg: number, goal: Goal
): { lost: number; pct: number; label: string } {
  const diff = startKg - currentKg;
  const pct = parseFloat(((Math.abs(diff) / startKg) * 100).toFixed(1));
  
  let label: string;
  if (goal === 'lose_weight') {
    label = diff >= 0 ? `Down ${diff.toFixed(1)} kg (${pct}%)` : `Up ${Math.abs(diff).toFixed(1)} kg`;
  } else if (goal === 'build_muscle') {
    label = diff <= 0 ? `Up ${Math.abs(diff).toFixed(1)} kg (${pct}%)` : `Down ${diff.toFixed(1)} kg`;
  } else {
    label = diff === 0 ? 'No change' : diff > 0 ? `Down ${diff.toFixed(1)} kg` : `Up ${Math.abs(diff).toFixed(1)} kg`;
  }

  return { lost: parseFloat(diff.toFixed(1)), pct, label };
}
