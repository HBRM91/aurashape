import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '@/src/lib/analytics';
import type { FastingPlan } from '@/src/types';

interface FastingSession {
  id: string;
  startTime: string;
  endTime: string | null;
  targetHours: number;
  completed: boolean;
}

interface FastingState {
  currentPlan: FastingPlan;
  customHours: number;
  activeSession: FastingSession | null;
  history: FastingSession[];
  setPlan: (plan: FastingPlan, customHours?: number) => void;
  startFast: () => void;
  endFast: () => void;
  getElapsedSeconds: () => number;
  getRemainingSeconds: () => number;
  getProgress: () => number;
}

const PLAN_HOURS: Record<FastingPlan, number> = {
  '14:10': 14,
  '16:8': 16,
  '18:6': 18,
  '20:4': 20,
  '5:2': 16,
  '6:1': 16,
  custom: 16,
};

function now(): string {
  return new Date().toISOString();
}

function nowMs(): number {
  return Date.now();
}

let sessionId = 1;

export const useFastingStore = create<FastingState>()(
  persist(
    (set, get) => ({
      currentPlan: '16:8',
      customHours: 16,
      activeSession: null,
      history: [],

      setPlan: (plan, customHours) => {
        const updates: Partial<FastingState> = { currentPlan: plan };
        if (customHours) updates.customHours = customHours;
        set(updates);
      },

      startFast: () => {
        const { currentPlan, customHours } = get();
        const hours = currentPlan === 'custom' ? customHours : PLAN_HOURS[currentPlan];
        const session: FastingSession = {
          id: String(sessionId++),
          startTime: now(),
          endTime: null,
          targetHours: hours,
          completed: false,
        };
        set({ activeSession: session });
        track('fast_started', { plan: currentPlan, targetHours: hours });
      },

      endFast: () => {
        const { activeSession, history } = get();
        if (!activeSession) return;
        const durH = Math.round((nowMs() - new Date(activeSession.startTime).getTime()) / 360000) / 10;
        const completed = { ...activeSession, endTime: now(), completed: true };
        set({ activeSession: null, history: [completed, ...history].slice(0, 90) });
        track('fast_completed', { targetHours: activeSession.targetHours, actualHours: durH });
        try { require('./achievements').useAchievementsStore.getState().checkAchievements(); } catch {}
      },

      getElapsedSeconds: () => {
        const { activeSession } = get();
        if (!activeSession) return 0;
        return Math.floor((nowMs() - new Date(activeSession.startTime).getTime()) / 1000);
      },

      getRemainingSeconds: () => {
        const { activeSession } = get();
        if (!activeSession) return 0;
        const elapsed = nowMs() - new Date(activeSession.startTime).getTime();
        const target = activeSession.targetHours * 3600 * 1000;
        return Math.max(0, Math.floor((target - elapsed) / 1000));
      },

      getProgress: () => {
        const { activeSession } = get();
        if (!activeSession) return 0;
        const elapsed = nowMs() - new Date(activeSession.startTime).getTime();
        const target = activeSession.targetHours * 3600 * 1000;
        return Math.min(elapsed / target, 1);
      },
    }),
    {
      name: 'fasting-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentPlan: state.currentPlan,
        customHours: state.customHours,
        history: state.history,
      }),
    }
  )
);
