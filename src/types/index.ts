export type Goal = 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_health';
export type ActivityLevel = 'lightly_active' | 'moderately_active' | 'active' | 'very_active';
export type DietaryPreference = 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'high_protein';
export type FastingPlan = '14:10' | '16:8' | '18:6' | '20:4' | '5:2' | '6:1' | 'custom';
export type UnitSystem = 'metric' | 'imperial';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type ExerciseCategory = 'bodyweight' | 'dumbbell' | 'barbell' | 'cardio' | 'stretching';
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core' | 'full_body';

export interface Profile {
  id: string;
  display_name?: string;
  avatar_url?: string;
  sex?: string;
  date_of_birth?: string;
  height_cm?: number;
  unit_system: UnitSystem;
  goal?: Goal;
  activity_level?: ActivityLevel;
  dietary_preference?: DietaryPreference;
  calorie_target?: number;
  protein_target_g?: number;
  carbs_target_g?: number;
  fat_target_g?: number;
  fasting_plan: FastingPlan;
  custom_fasting_hours?: number;
  water_target_ml: number;
  newsletter_opt_in: boolean;
  analytics_opt_in: boolean;
}

export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  serving_size_g?: number;
  serving_name: string;
  calories_per_serving: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  is_verified: boolean;
  is_aurabiosens: boolean;
  source: string;
  image_url?: string;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  food_id?: string;
  food?: Food;
  meal_slot: MealSlot;
  servings: number;
  date: string;
}

export interface SetLog {
  set_number: number;
  weight_kg?: number;
  reps: number;
  rpe?: number;
}

export interface DailyTip {
  id: string;
  title: string;
  body: string;
  category: 'food_hack' | 'health_hack' | 'fasting_science';
  study_title?: string;
  study_summary?: string;
  study_url?: string;
}
