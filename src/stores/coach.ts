import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  generateWeeklyPlan: () => void;
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
      generateWeeklyPlan: () => {
        const now = Date.now();
        const plan: CoachRecommendation[] = [
          { id: `c-${now}-1`, category: 'nutrition', recommendation: 'Increase protein to 30g per meal', reason: 'Based on your diary, you average 22g/meal. Research shows 30-40g maximizes muscle protein synthesis.', action: 'Add one egg or 100g Greek yogurt to each meal', createdAt: new Date().toISOString(), applied: false },
          { id: `c-${now}-2`, category: 'fasting', recommendation: 'Move your eating window 1 hour earlier', reason: 'Your current window ends at 9 PM. Early time-restricted feeding (by 7-8 PM) improves insulin sensitivity.', action: 'Start your fast at 7 PM instead of 8 PM', createdAt: new Date().toISOString(), applied: false },
          { id: `c-${now}-3`, category: 'workout', recommendation: 'Add one more set per exercise', reason: 'You average 2.3 sets/exercise. 3-4 sets maximizes hypertrophy at your training frequency.', action: 'Add one set to each exercise this week', createdAt: new Date().toISOString(), applied: false },
          { id: `c-${now}-4`, category: 'hydration', recommendation: 'Increase water intake to 2.5L', reason: 'Your average is 1.6L/day. Adding 900ml would hit your target consistently.', action: 'Drink one extra glass of water with each meal', createdAt: new Date().toISOString(), applied: false },
          { id: `c-${now}-5`, category: 'recovery', recommendation: 'Add one full rest day', reason: 'You trained 6 of the last 7 days. Muscle grows during rest, not training.', action: 'Take tomorrow off — light walking only', createdAt: new Date().toISOString(), applied: false },
        ];
        set({ weeklyPlan: plan, aiHistory: [...plan, ...get().aiHistory].slice(0, 50) });
      },
      applyRecommendation: (id) => set((s) => ({
        weeklyPlan: s.weeklyPlan.map((r) => r.id === id ? { ...r, applied: true } : r),
      })),
      clearHistory: () => set({ aiHistory: [], weeklyPlan: [] }),
    }),
    { name: 'coach-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
