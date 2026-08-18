import { useOnboardingStore } from '@/src/stores/onboarding';
import { usePrivacyStore } from '@/src/stores/privacy';
import { useDiaryStore } from '@/src/stores/diary';
import { useWorkoutStore, type WorkoutHistoryEntry } from '@/src/stores/workout';
import { useBodyStore } from '@/src/stores/body';
import { useWaterStore } from '@/src/stores/water';
import { useMeditationStore } from '@/src/stores/meditation';
import { calculateTDEE, macrosFromCalories } from '@/src/lib/calculator';
import { EXERCISES } from '@/src/lib/exercises';
import type { Food } from '@/src/types';

const DEMO_FOODS: Record<'breakfast' | 'lunch' | 'dinner' | 'snack', Food> = {
  breakfast: {
    id: 'demo-oatmeal', name: 'Oatmeal with Banana', serving_size_g: 250, serving_name: '1 bowl',
    calories_per_serving: 320, protein_g: 11, carbs_g: 58, fat_g: 6, fiber_g: 8,
    is_verified: true, is_aurabiosens: false, source: 'demo',
  },
  lunch: {
    id: 'demo-chicken-rice', name: 'Grilled Chicken with Rice', serving_size_g: 400, serving_name: '1 plate',
    calories_per_serving: 540, protein_g: 45, carbs_g: 60, fat_g: 12, fiber_g: 3,
    is_verified: true, is_aurabiosens: false, source: 'demo',
  },
  dinner: {
    id: 'demo-salmon-veg', name: 'Baked Salmon with Vegetables', serving_size_g: 350, serving_name: '1 plate',
    calories_per_serving: 480, protein_g: 38, carbs_g: 20, fat_g: 26, fiber_g: 6,
    is_verified: true, is_aurabiosens: false, source: 'demo',
  },
  snack: {
    id: 'demo-protein-bar', name: 'Aurabiosens Protein Bar', serving_size_g: 45, serving_name: '1 bar',
    calories_per_serving: 190, protein_g: 20, carbs_g: 16, fat_g: 6, fiber_g: 3,
    is_verified: true, is_aurabiosens: true, source: 'demo',
  },
};

function daysAgoDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function hoursAgoISO(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

// Populates every local store with a realistic, internally-consistent
// profile so the app can be explored fully populated instead of empty —
// there is no real login in local-only mode (the deployed default), so this
// is the fastest way to get a "test account" without any backend.
export function seedDemoData(): void {
  usePrivacyStore.getState().recordConsent({
    termsAccepted: true,
    newsletterOptIn: false,
    analyticsOptIn: false,
    aiOptIn: false,
  });

  const onboarding = useOnboardingStore.getState();
  onboarding.setField('goal', 'lose_weight');
  onboarding.setField('sex', 'female');
  onboarding.setField('dateOfBirth', '1994-05-14');
  onboarding.setField('heightCm', 168);
  onboarding.setField('weightKg', 72);
  onboarding.setField('activityLevel', 'moderately_active');
  onboarding.setField('dietaryPreference', 'omnivore');
  onboarding.setField('dietaryPreferences', ['omnivore']);
  onboarding.setField('allergies', []);
  onboarding.setField('unitSystem', 'metric');
  onboarding.setField('fastingEnabled', true);
  onboarding.setField('fastingPlan', '16:8');
  onboarding.setField('targetWeightKg', 64);
  onboarding.setField('weeklyChangeKg', 0.5);

  const tdee = calculateTDEE({ age: 31, sex: 'female', weightKg: 72, heightCm: 168 }, 'moderately_active');
  const macros = macrosFromCalories(tdee - 500, 72);
  onboarding.setTargets({
    calorieTarget: macros.calorieTarget,
    proteinTargetG: macros.proteinG,
    carbsTargetG: macros.carbsG,
    fatTargetG: macros.fatG,
  });
  onboarding.saveProfile('demo-user');

  const diary = useDiaryStore.getState();
  diary.addEntry(DEMO_FOODS.breakfast, 'breakfast');
  diary.addEntry(DEMO_FOODS.lunch, 'lunch');
  diary.addEntry(DEMO_FOODS.dinner, 'dinner');
  diary.addEntry(DEMO_FOODS.snack, 'snack');

  useWaterStore.getState().addWater(daysAgoDate(0), 1500);

  const bodyStore = useBodyStore.getState();
  [[14, 74.2], [7, 73.1], [0, 72.0]].forEach(([daysAgo, weightKg]) => {
    bodyStore.addWeight({ date: daysAgoDate(daysAgo), weightKg });
  });

  const pushups = EXERCISES.find((e) => e.id === 'bw-pushups')!;
  const squats = EXERCISES.find((e) => e.id === 'bw-squats')!;
  const historyEntry: WorkoutHistoryEntry = {
    id: 'demo-workout-1',
    startTime: hoursAgoISO(2),
    endTime: hoursAgoISO(1.25),
    completed: true,
    durationMinutes: 45,
    totalVolume: 1200,
    exercises: [
      { exercise: pushups, sets: [{ set_number: 1, reps: 15 }, { set_number: 2, reps: 12 }] },
      { exercise: squats, sets: [{ set_number: 1, reps: 20 }, { set_number: 2, reps: 18 }] },
    ],
  };
  useWorkoutStore.setState((s) => ({ history: [historyEntry, ...s.history] }));

  useMeditationStore.getState().addSession({
    type: 'breathing',
    durationMinutes: 10,
    completedAt: hoursAgoISO(6),
    completed: true,
  });
}
