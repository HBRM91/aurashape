import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/lib/supabase';
import type { Goal, ActivityLevel, DietaryPreference, FastingSelection, UnitSystem } from '@/src/types';
import { isLocalOnly } from '@/src/lib/privacyMode';

interface OnboardingState {
  step: number;
  completed: boolean;
  goal: Goal | null;
  sex: 'male' | 'female' | null;
  dateOfBirth: string | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel | null;
  dietaryPreference: DietaryPreference | null;
  dietaryPreferences: DietaryPreference[];
  allergies: string[];
  excludedIngredients: string[];
  unitSystem: UnitSystem;
  fastingEnabled: boolean;
  fastingPlan: FastingSelection;
  targetWeightKg: number | null;
  weeklyChangeKg: number | null;
  newsletterOptIn: boolean;
  calorieTarget: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  setStep: (step: number) => void;
  setField: <K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) => void;
  setTargets: (targets: { calorieTarget: number; proteinTargetG: number; carbsTargetG: number; fatTargetG: number }) => void;
  saveProfile: (userId: string) => Promise<{ error?: string }>;
}

export const useOnboardingStore = create<OnboardingState>()(persist((set, get) => ({
  step: 0,
  completed: false,
  goal: null,
  sex: null,
  dateOfBirth: null,
  heightCm: null,
  weightKg: null,
  activityLevel: null,
  dietaryPreference: null,
  dietaryPreferences: [],
  allergies: [],
  excludedIngredients: [],
  unitSystem: 'metric',
  fastingEnabled: false,
  fastingPlan: '16:8',
  targetWeightKg: null,
  weeklyChangeKg: null,
  newsletterOptIn: false,
  calorieTarget: 2000,
  proteinTargetG: 100,
  carbsTargetG: 200,
  fatTargetG: 55,

  setStep: (step) => set({ step }),

  setField: (key, value) => set({ [key]: value }),

  setTargets: (targets) => set(targets),

  saveProfile: async (userId) => {
    const state = get();
    if (isLocalOnly()) {
      set({ completed: true });
      return {};
    }
    const { error } = await supabase
      .from('profiles')
      .update({
        goal: state.goal,
        sex: state.sex,
        date_of_birth: state.dateOfBirth,
        height_cm: state.heightCm,
        unit_system: state.unitSystem,
        activity_level: state.activityLevel,
        dietary_preference: state.dietaryPreference,
        dietary_preferences: state.dietaryPreferences,
        allergies: state.allergies,
        excluded_ingredients: state.excludedIngredients,
        fasting_enabled: state.fastingEnabled,
        fasting_plan: state.fastingEnabled && state.fastingPlan !== 'none' ? state.fastingPlan : null,
        target_weight_kg: state.targetWeightKg,
        weekly_change_kg: state.weeklyChangeKg,
        newsletter_opt_in: state.newsletterOptIn,
      })
      .eq('id', userId);

    if (error) return { error: error.message };
    set({ completed: true });
    return {};
  },
}), {
  name: 'onboarding-storage',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({
    step: state.step,
    completed: state.completed,
    goal: state.goal,
    sex: state.sex,
    dateOfBirth: state.dateOfBirth,
    heightCm: state.heightCm,
    weightKg: state.weightKg,
    activityLevel: state.activityLevel,
    dietaryPreference: state.dietaryPreference,
    dietaryPreferences: state.dietaryPreferences,
    allergies: state.allergies,
    excludedIngredients: state.excludedIngredients,
    unitSystem: state.unitSystem,
    fastingEnabled: state.fastingEnabled,
    fastingPlan: state.fastingPlan,
    targetWeightKg: state.targetWeightKg,
    weeklyChangeKg: state.weeklyChangeKg,
    newsletterOptIn: state.newsletterOptIn,
    calorieTarget: state.calorieTarget,
    proteinTargetG: state.proteinTargetG,
    carbsTargetG: state.carbsTargetG,
    fatTargetG: state.fatTargetG,
  }),
}));
