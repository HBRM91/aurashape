import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '@/src/lib/analytics';
import type { MeditationSession, BreathingPattern } from '@/src/types';

interface MeditationState {
  sessions: MeditationSession[];
  totalMinutes: number;
  streak: number;
  lastSessionDate: string | null;
  breathingPatterns: BreathingPattern[];
  addSession: (session: Omit<MeditationSession, 'id'>) => void;
  getTotalSessions: () => number;
  getWeeklyMinutes: () => number;
  getStreak: () => number;
}

let sessionId = Date.now();

const DEFAULT_PATTERNS: BreathingPattern[] = [
  { name: 'Box Breathing', inhaleSeconds: 4, holdInSeconds: 4, exhaleSeconds: 4, holdOutSeconds: 4, description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Navy SEAL technique for calm focus.' },
  { name: '4-7-8 Breathing', inhaleSeconds: 4, holdInSeconds: 7, exhaleSeconds: 8, holdOutSeconds: 0, description: 'Inhale 4s, hold 7s, exhale 8s. Promotes deep relaxation and sleep.' },
  { name: 'Deep Belly', inhaleSeconds: 5, holdInSeconds: 0, exhaleSeconds: 5, holdOutSeconds: 0, description: 'Inhale 5s, exhale 5s. Simple deep breathing for stress relief.' },
  { name: 'Energizing', inhaleSeconds: 6, holdInSeconds: 0, exhaleSeconds: 2, holdOutSeconds: 0, description: 'Inhale 6s, exhale 2s. Quick energizing breath pattern.' },
  { name: 'Coherent Breathing', inhaleSeconds: 5, holdInSeconds: 0, exhaleSeconds: 5, holdOutSeconds: 1, description: 'Inhale 5s, exhale 5s. Balances nervous system at 6 breaths/min.' },
];

export const useMeditationStore = create<MeditationState>()(
  persist(
    (set, get) => ({
      sessions: [],
      totalMinutes: 0,
      streak: 0,
      lastSessionDate: null,
      breathingPatterns: DEFAULT_PATTERNS,

      addSession: (session) => {
        const id = String(sessionId++);
        const today = new Date().toISOString().slice(0, 10);
        const { lastSessionDate, streak, sessions } = get();

        let newStreak = streak;
        if (lastSessionDate === today) {
          newStreak = streak;
        } else if (lastSessionDate && new Date(today).getTime() - new Date(lastSessionDate).getTime() <= 86400000) {
          newStreak = streak + 1;
        } else {
          newStreak = 1;
        }

        set({
          sessions: [...sessions, { ...session, id }],
          totalMinutes: get().totalMinutes + session.durationMinutes,
          streak: newStreak,
          lastSessionDate: today,
        });
        track('meditation_completed', { type: session.type, duration: session.durationMinutes });
        try { require('./achievements').useAchievementsStore.getState().checkAchievements(); } catch {}
      },

      getTotalSessions: () => get().sessions.length,
      getWeeklyMinutes: () => {
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        return get().sessions
          .filter((s) => s.completedAt >= weekAgo && s.completed)
          .reduce((sum, s) => sum + s.durationMinutes, 0);
      },
      getStreak: () => get().streak,
    }),
    {
      name: 'meditation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
