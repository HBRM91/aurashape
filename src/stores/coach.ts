import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateCoaching } from '@/src/lib/aiClient';
import { useDiaryStore } from '@/src/stores/diary';
import { useWaterStore } from '@/src/stores/water';
import { useWorkoutStore } from '@/src/stores/workout';
import { useFastingStore } from '@/src/stores/fasting';

interface CoachRecommendation {
  id: string;
  category: 'nutrition' | 'fasting' | 'workout' | 'recovery' | 'hydration';
  recommendation: string;
  reason: string;
  action: string;
  createdAt: string;
  applied: boolean;
}

interface CoachState {
  weeklyPlan: CoachRecommendation[];
  aiEnabled: boolean;
  aiHistory: CoachRecommendation[];
  setAIEnabled: (enabled: boolean) => void;
  generateWeeklyPlan: () => Promise<void>;
  applyRecommendation: (id: string) => void;
  clearHistory: () => void;
}

export const useCoachStore = create<CoachState>()(
  persist(
    (set, get) => ({
      weeklyPlan: [],
      aiEnabled: true,
      aiHistory: [],
      setAIEnabled: (enabled) => set({ aiEnabled: enabled }),
      generateWeeklyPlan: async () => {
        if (!get().aiEnabled) return;

        const dates = Array.from({ length: 7 }, (_, index) => {
          const date = new Date();
          date.setDate(date.getDate() - index);
          return date.toISOString().slice(0, 10);
        });
        const diary = useDiaryStore.getState();
        const water = useWaterStore.getState();
        const workouts = useWorkoutStore.getState().history;
        const fasting = useFastingStore.getState().history;
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const averageCalories = Math.round(
          dates.reduce((sum, date) => sum + diary.getDailyCalories(date), 0) / dates.length,
        );
        const context = {
          periodDays: 7,
          averageCalories,
          waterTargetMl: 2000,
          waterByDate: dates.map((date) => water.waterMl[date] || 0),
          workoutsCompleted: workouts.filter((workout) => new Date(workout.endTime).getTime() >= cutoff).length,
          fastingSessions: fasting.filter((session) => new Date(session.startTime).getTime() >= cutoff).length,
          diaryEntries: diary.entries.filter((entry) => dates.includes(entry.date)).length,
        };

        try {
          const result = await generateCoaching(context);
          const createdAt = result.generatedAt || new Date().toISOString();
          const plan: CoachRecommendation[] = result.recommendations.map((recommendation, index) => ({
            id: `c-${Date.now()}-${index + 1}`,
            category: recommendation.category,
            recommendation: recommendation.recommendation,
            reason: recommendation.reason,
            action: recommendation.recommendation,
            createdAt,
            applied: false,
          }));
          set({ weeklyPlan: plan, aiHistory: [...plan, ...get().aiHistory].slice(0, 50) });
        } catch {
          // Keep the last usable plan when the AI service is unavailable.
        }
      },
      applyRecommendation: (id) => set((s) => ({
        weeklyPlan: s.weeklyPlan.map((r) => r.id === id ? { ...r, applied: true } : r),
      })),
      clearHistory: () => set({ aiHistory: [], weeklyPlan: [] }),
    }),
    { name: 'coach-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
