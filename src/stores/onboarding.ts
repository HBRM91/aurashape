import { create } from 'zustand';
import { supabase } from '@/src/lib/supabase';
import type { Goal, ActivityLevel, DietaryPreference, FastingPlan } from '@/src/types';

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
  fastingPlan: FastingPlan;
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

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step: 0,
  completed: false,
  goal: null,
  sex: null,
  dateOfBirth: null,
  heightCm: null,
  weightKg: null,
  activityLevel: null,
  dietaryPreference: null,
  fastingPlan: '16:8',
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
    const { error } = await supabase
      .from('profiles')
      .update({
        goal: state.goal,
        sex: state.sex,
        date_of_birth: state.dateOfBirth,
        height_cm: state.heightCm,
        activity_level: state.activityLevel,
        dietary_preference: state.dietaryPreference,
        fasting_plan: state.fastingPlan,
        newsletter_opt_in: state.newsletterOptIn,
      })
      .eq('id', userId);

    if (error) return { error: error.message };
    set({ completed: true });
    return {};
  },
}));
