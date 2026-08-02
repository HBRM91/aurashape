import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
  category: 'tracking' | 'fitness' | 'nutrition' | 'mindfulness' | 'community';
}

interface AchievementsState {
  achievements: Achievement[];
  checkAchievements: () => void;
  totalUnlocked: () => number;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'a-first-meal', name: 'First Bite', description: 'Log your first meal', icon: '🍽️', unlocked: false, progress: 0, target: 1, category: 'nutrition' },
  { id: 'a-10-meals', name: 'Meal Master', description: 'Log 10 meals', icon: '🥗', unlocked: false, progress: 0, target: 10, category: 'nutrition' },
  { id: 'a-50-meals', name: 'Nutrition Enthusiast', description: 'Log 50 meals', icon: '🥩', unlocked: false, progress: 0, target: 50, category: 'nutrition' },
  { id: 'a-perfect-day', name: 'Perfect Day', description: 'Hit all macro targets in one day', icon: '🎯', unlocked: false, progress: 0, target: 1, category: 'nutrition' },
  { id: 'a-first-fast', name: 'First Fast', description: 'Complete your first fast', icon: '⏱️', unlocked: false, progress: 0, target: 1, category: 'fitness' },
  { id: 'a-7-fasts', name: 'Fasting Regular', description: 'Complete 7 fasts', icon: '🔥', unlocked: false, progress: 0, target: 7, category: 'fitness' },
  { id: 'a-first-workout', name: 'First Sweat', description: 'Complete your first workout', icon: '💪', unlocked: false, progress: 0, target: 1, category: 'fitness' },
  { id: 'a-10-workouts', name: 'Workout Warrior', description: 'Complete 10 workouts', icon: '🏋️', unlocked: false, progress: 0, target: 10, category: 'fitness' },
  { id: 'a-first-meditation', name: 'First Breath', description: 'Complete your first meditation', icon: '🧘', unlocked: false, progress: 0, target: 1, category: 'mindfulness' },
  { id: 'a-7-meditations', name: 'Zen Master', description: 'Meditate 7 times', icon: '🕉️', unlocked: false, progress: 0, target: 7, category: 'mindfulness' },
  { id: 'a-3-day-streak', name: '3-Day Streak', description: 'Log meals 3 days in a row', icon: '⭐', unlocked: false, progress: 0, target: 3, category: 'tracking' },
  { id: 'a-7-day-streak', name: 'Week Warrior', description: 'Log meals 7 days in a row', icon: '🌟', unlocked: false, progress: 0, target: 7, category: 'tracking' },
  { id: 'a-30-day-streak', name: 'Monthly Mastery', description: 'Log meals 30 days in a row', icon: '👑', unlocked: false, progress: 0, target: 30, category: 'tracking' },
  { id: 'a-water-goal', name: 'Hydration Hero', description: 'Hit water target in a day', icon: '💧', unlocked: false, progress: 0, target: 1, category: 'nutrition' },
  { id: 'a-first-cycle', name: 'Cycle Tracker', description: 'Log your first period', icon: '📅', unlocked: false, progress: 0, target: 1, category: 'tracking' },
  { id: 'a-recipe-save', name: 'Recipe Collector', description: 'Save 5 recipes', icon: '📖', unlocked: false, progress: 0, target: 5, category: 'nutrition' },
  { id: 'a-challenge-join', name: 'Team Player', description: 'Join your first challenge', icon: '🤝', unlocked: false, progress: 0, target: 1, category: 'community' },
  { id: 'a-all-rounder', name: 'All-Rounder', description: 'Use fasting, workout, meditation, and cycle', icon: '🏆', unlocked: false, progress: 0, target: 4, category: 'fitness' },
];

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: DEFAULT_ACHIEVEMENTS,

      checkAchievements: () => {
        const { useDiaryStore } = require('./diary');
        const { useFastingStore } = require('./fasting');
        const { useWorkoutStore } = require('./workout');
        const { useMeditationStore } = require('./meditation');
        const { useCycleStore } = require('./cycle');
        const { useWaterStore } = require('./water');
        const { useRecipeStore } = require('./recipes');
        const { useCommunityStore } = require('./community');

        const diary = useDiaryStore.getState();
        const fasting = useFastingStore.getState();
        const workout = useWorkoutStore.getState();
        const meditation = useMeditationStore.getState();
        const cycle = useCycleStore.getState();
        const water = useWaterStore.getState();
        const recipes = useRecipeStore.getState();
        const community = useCommunityStore.getState();

        const totalMeals = diary.entries.length;
        const totalFasts = fasting.history.length;
        const totalWorkouts = workout.history.length;
        const totalMeditations = meditation.sessions.length;
        const totalCycles = cycle.entries.length;

        const today = new Date().toISOString().slice(0, 10);
        const waterToday = water.waterMl[today] || 0;

        const streak = (() => {
          const dates = [...new Set(diary.entries.map((e: { date: string }) => e.date))].sort().reverse();
          let s = 0;
          for (let i = 0; i < dates.length; i++) {
            const expected = new Date();
            expected.setDate(expected.getDate() - i);
            if (dates[i] === expected.toISOString().slice(0, 10)) s++;
            else break;
          }
          return s;
        })();

        const featuresUsed = [
          totalFasts > 0,
          totalWorkouts > 0,
          totalMeditations > 0,
          totalCycles > 0,
        ].filter(Boolean).length;

        set((s) => ({
          achievements: s.achievements.map((a) => {
            let progress = 0;
            switch (a.id) {
              case 'a-first-meal': progress = Math.min(totalMeals, 1); break;
              case 'a-10-meals': progress = Math.min(totalMeals, 10); break;
              case 'a-50-meals': progress = Math.min(totalMeals, 50); break;
              case 'a-first-fast': progress = Math.min(totalFasts, 1); break;
              case 'a-7-fasts': progress = Math.min(totalFasts, 7); break;
              case 'a-first-workout': progress = Math.min(totalWorkouts, 1); break;
              case 'a-10-workouts': progress = Math.min(totalWorkouts, 10); break;
              case 'a-first-meditation': progress = Math.min(totalMeditations, 1); break;
              case 'a-7-meditations': progress = Math.min(totalMeditations, 7); break;
              case 'a-3-day-streak': progress = Math.min(streak, 3); break;
              case 'a-7-day-streak': progress = Math.min(streak, 7); break;
              case 'a-30-day-streak': progress = Math.min(streak, 30); break;
              case 'a-water-goal': progress = waterToday >= 2000 ? 1 : 0; break;
              case 'a-first-cycle': progress = Math.min(totalCycles, 1); break;
              case 'a-recipe-save': progress = Math.min(recipes.savedRecipes.length, 5); break;
              case 'a-challenge-join': progress = Math.min(community.joinedChallenges.length, 1); break;
              case 'a-all-rounder': progress = Math.min(featuresUsed, 4); break;
            }

            const wasUnlocked = a.unlocked;
            const nowUnlocked = progress >= a.target;
            const unlockedAt = nowUnlocked && !wasUnlocked ? new Date().toISOString() : a.unlockedAt;

            return { ...a, progress, unlocked: nowUnlocked, unlockedAt };
          }),
        }));
      },

      totalUnlocked: () => get().achievements.filter((a) => a.unlocked).length,
    }),
    {
      name: 'achievements-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
