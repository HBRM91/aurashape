import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PlanDay {
  date: string;
  meals: { slot: string; description: string; completed: boolean }[];
  workout: { name: string; completed: boolean };
  fasting: { plan: string; completed: boolean };
  hydration: { targetMl: number; currentMl: number };
  recovery: { action: string; completed: boolean };
}

interface PlanState {
  currentPlan: PlanDay[];
  planGeneratedAt: string | null;
  generatePlan: (goal: string) => void;
  toggleMeal: (date: string, index: number) => void;
  toggleWorkout: (date: string) => void;
  toggleFasting: (date: string) => void;
  toggleRecovery: (date: string) => void;
  getToday: () => PlanDay | undefined;
  getWeeklyCompletion: () => number;
  resetPlan: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      currentPlan: [],
      planGeneratedAt: null,
      generatePlan: (goal) => {
        const now = new Date();
        const days: PlanDay[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().slice(0, 10);
          const isWorkoutDay = i % 2 === 0;
          days.push({
            date: dateStr,
            meals: [
              { slot: 'Breakfast', description: goal === 'build_muscle' ? 'High-protein breakfast: eggs + Greek yogurt + oats' : 'Balanced breakfast: oatmeal + fruit + nuts', completed: false },
              { slot: 'Lunch', description: goal === 'build_muscle' ? 'Protein-rich lunch: chicken breast + quinoa + vegetables' : 'Light lunch: mixed salad + lean protein + whole grains', completed: false },
              { slot: 'Dinner', description: goal === 'lose_weight' ? 'Light dinner: fish + steamed vegetables' : 'Balanced dinner: protein + complex carbs + vegetables', completed: false },
            ],
            workout: { name: isWorkoutDay ? (goal === 'build_muscle' ? 'Strength Training: Push Day' : 'Full Body Workout') : 'Active Recovery: Walking or Stretching', completed: false },
            fasting: { plan: '16:8', completed: false },
            hydration: { targetMl: 2500, currentMl: 0 },
            recovery: { action: '10 minutes of stretching or meditation', completed: false },
          });
        }
        set({ currentPlan: days, planGeneratedAt: now.toISOString() });
      },
      toggleMeal: (date, index) => set((s) => ({
        currentPlan: s.currentPlan.map((d) => d.date === date ? {
          ...d, meals: d.meals.map((m, i) => i === index ? { ...m, completed: !m.completed } : m),
        } : d),
      })),
      toggleWorkout: (date) => set((s) => ({
        currentPlan: s.currentPlan.map((d) => d.date === date ? { ...d, workout: { ...d.workout, completed: !d.workout.completed } } : d),
      })),
      toggleFasting: (date) => set((s) => ({
        currentPlan: s.currentPlan.map((d) => d.date === date ? { ...d, fasting: { ...d.fasting, completed: !d.fasting.completed } } : d),
      })),
      toggleRecovery: (date) => set((s) => ({
        currentPlan: s.currentPlan.map((d) => d.date === date ? { ...d, recovery: { ...d.recovery, completed: !d.recovery.completed } } : d),
      })),
      getToday: () => {
        const today = new Date().toISOString().slice(0, 10);
        return get().currentPlan.find((d) => d.date === today);
      },
      getWeeklyCompletion: () => {
        const { currentPlan } = get();
        if (currentPlan.length === 0) return 0;
        let total = 0; let completed = 0;
        currentPlan.forEach((d) => {
          d.meals.forEach((m) => { total++; if (m.completed) completed++; });
          total++; if (d.workout.completed) completed++;
          total++; if (d.fasting.completed) completed++;
          total++; if (d.recovery.completed) completed++;
        });
        return Math.round((completed / total) * 100);
      },
      resetPlan: () => set({ currentPlan: [], planGeneratedAt: null }),
    }),
    { name: 'plan-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
