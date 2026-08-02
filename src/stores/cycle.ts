import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '@/src/lib/analytics';
import type { CycleEntry, CyclePrediction } from '@/src/types';

interface CycleState {
  entries: CycleEntry[];
  currentCycleLength: number;
  currentPeriodLength: number;
  addEntry: (entry: Omit<CycleEntry, 'id'>) => void;
  updateEntry: (id: string, updates: Partial<CycleEntry>) => void;
  removeEntry: (id: string) => void;
  setCycleLength: (days: number) => void;
  setPeriodLength: (days: number) => void;
  getPrediction: () => CyclePrediction | null;
  getLastEntry: () => CycleEntry | null;
}

let entryId = Date.now();

export function predictCycle(lastStartDate: string, cycleLength: number, periodLength: number): CyclePrediction {
  const lastStart = new Date(lastStartDate);
  const nextStart = new Date(lastStart);
  nextStart.setDate(nextStart.getDate() + cycleLength);
  
  const nextEnd = new Date(nextStart);
  nextEnd.setDate(nextEnd.getDate() + periodLength);

  const ovulation = new Date(nextStart);
  ovulation.setDate(ovulation.getDate() - 14);

  const fertileStart = new Date(ovulation);
  fertileStart.setDate(fertileStart.getDate() - 5);
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(fertileEnd.getDate() + 1);

  const today = new Date();
  const dayDiff = Math.floor((today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
  const cycleDay = (dayDiff % cycleLength) + 1;

  let currentPhase: CyclePrediction['currentPhase'] = 'menstrual';
  if (cycleDay <= periodLength) {
    currentPhase = 'menstrual';
  } else if (cycleDay <= periodLength + 7) {
    currentPhase = 'follicular';
  } else if (cycleDay >= cycleLength - 14 && cycleDay <= cycleLength - 12) {
    currentPhase = 'ovulation';
  } else {
    currentPhase = 'luteal';
  }

  return {
    nextPeriodStart: nextStart.toISOString().slice(0, 10),
    nextPeriodEnd: nextEnd.toISOString().slice(0, 10),
    ovulationDate: ovulation.toISOString().slice(0, 10),
    fertileWindow: {
      start: fertileStart.toISOString().slice(0, 10),
      end: fertileEnd.toISOString().slice(0, 10),
    },
    currentPhase,
    cycleDay,
  };
}

export const useCycleStore = create<CycleState>()(
  persist(
    (set, get) => ({
      entries: [],
      currentCycleLength: 28,
      currentPeriodLength: 5,

      addEntry: (entry) => {
        const id = String(entryId++);
        set((s) => ({ entries: [...s.entries, { ...entry, id }] }));
        track('cycle_logged');
        try { require('./achievements').useAchievementsStore.getState().checkAchievements(); } catch {}
      },

      updateEntry: (id, updates) => {
        set((s) => ({
          entries: s.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },

      removeEntry: (id) => {
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) }));
      },

      setCycleLength: (days) => set({ currentCycleLength: Math.max(20, Math.min(45, days)) }),
      setPeriodLength: (days) => set({ currentPeriodLength: Math.max(1, Math.min(10, days)) }),

      getPrediction: () => {
        const last = get().getLastEntry();
        if (!last) return null;
        return predictCycle(last.startDate, get().currentCycleLength, get().currentPeriodLength);
      },

      getLastEntry: () => {
        const { entries } = get();
        if (entries.length === 0) return null;
        return entries.reduce((latest, e) =>
          new Date(e.startDate) > new Date(latest.startDate) ? e : latest
        );
      },
    }),
    {
      name: 'cycle-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
