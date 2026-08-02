import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReadingState {
  savedExplanations: Array<{
    id: string;
    articleId: string;
    claim: string;
    summary: string;
    evidenceGrade: string;
    citations: Array<{ authors: string; journal: string; year: number; title: string }>;
    practicalActions: string[];
    createdAt: string;
  }>;
  recentExplanations: string[];
  addExplanation: (exp: Omit<ReadingState['savedExplanations'][0], 'id' | 'createdAt'>) => void;
  removeExplanation: (id: string) => void;
  addRecentClaim: (claim: string) => void;
  clearRecentClaims: () => void;
}

let explanationId = Date.now();

export const useReadingStore = create<ReadingState>()(
  persist(
    (set) => ({
      savedExplanations: [],
      recentExplanations: [],

      addExplanation: (exp) => {
        const newExp = {
          ...exp,
          id: `exp-${explanationId++}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          savedExplanations: [...s.savedExplanations, newExp],
        }));
      },

      removeExplanation: (id) => {
        set((s) => ({
          savedExplanations: s.savedExplanations.filter((e) => e.id !== id),
        }));
      },

      addRecentClaim: (claim) => {
        set((s) => ({
          recentExplanations: [
            claim,
            ...s.recentExplanations.filter((c) => c !== claim),
          ].slice(0, 5),
        }));
      },

      clearRecentClaims: () => {
        set({ recentExplanations: [] });
      },
    }),
    {
      name: 'reading-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
