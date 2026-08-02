import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '@/src/lib/analytics';
import type { SetLog } from '@/src/types';
import type { Exercise } from '@/src/lib/exercises';

interface WorkoutExercise {
  exercise: Exercise;
  sets: SetLog[];
}

interface WorkoutSession {
  id: string;
  startTime: string;
  endTime: string | null;
  exercises: WorkoutExercise[];
  completed: boolean;
}

export interface WorkoutHistoryEntry extends WorkoutSession {
  endTime: string;
  totalVolume: number;
  durationMinutes: number;
}

interface WorkoutState {
  activeWorkout: WorkoutSession | null;
  history: WorkoutHistoryEntry[];
  personalRecords: Record<string, { weight: number; reps: number; date: string }>;
  startWorkout: () => void;
  cancelWorkout: () => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (index: number) => void;
  addSet: (exerciseIndex: number, newSet: SetLog) => void;
  updateSet: (exerciseIndex: number, setIndex: number, set: Partial<SetLog>) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  finishWorkout: () => WorkoutHistoryEntry | null;
  getVolume: () => number;
  getElapsedMinutes: () => number;
}

let workoutId = Date.now();

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      activeWorkout: null,
      history: [],
      personalRecords: {},

      startWorkout: () => {
        set({
          activeWorkout: {
            id: String(workoutId++),
            startTime: new Date().toISOString(),
            endTime: null,
            exercises: [],
            completed: false,
          },
        });
        track('workout_started');
      },

      cancelWorkout: () => {
        set({ activeWorkout: null });
      },

      addExercise: (exercise) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        set({
          activeWorkout: {
            ...activeWorkout,
            exercises: [
              ...activeWorkout.exercises,
              { exercise, sets: [{ set_number: 1, weight_kg: undefined, reps: 0 }] },
            ],
          },
        });
      },

      removeExercise: (index) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const exercises = [...activeWorkout.exercises];
        exercises.splice(index, 1);
        set({ activeWorkout: { ...activeWorkout, exercises } });
      },

      addSet: (exerciseIndex, newSet) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const exercises = [...activeWorkout.exercises];
        const nextNumber = exercises[exerciseIndex].sets.length + 1;
        exercises[exerciseIndex] = {
          ...exercises[exerciseIndex],
          sets: [...exercises[exerciseIndex].sets, { ...newSet, set_number: nextNumber }],
        };
        set({ activeWorkout: { ...activeWorkout, exercises } });
      },

      updateSet: (exerciseIndex, setIndex, update) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const exercises = [...activeWorkout.exercises];
        const sets = [...exercises[exerciseIndex].sets];
        sets[setIndex] = { ...sets[setIndex], ...update };
        exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
        set({ activeWorkout: { ...activeWorkout, exercises } });
      },

      removeSet: (exerciseIndex, setIndex) => {
        const { activeWorkout } = get();
        if (!activeWorkout) return;
        const exercises = [...activeWorkout.exercises];
        const sets = [...exercises[exerciseIndex].sets];
        sets.splice(setIndex, 1);
        exercises[exerciseIndex] = { ...exercises[exerciseIndex], sets };
        set({ activeWorkout: { ...activeWorkout, exercises } });
      },

      finishWorkout: () => {
        const { activeWorkout, history, personalRecords } = get();
        if (!activeWorkout) return null;

        const endTime = new Date().toISOString();
        const durationMinutes = Math.round(
          (new Date(endTime).getTime() - new Date(activeWorkout.startTime).getTime()) / 60000
        );
        const totalVolume = activeWorkout.exercises.reduce(
          (sum, we) =>
            sum + we.sets.reduce((s, set) => s + (set.weight_kg || 0) * set.reps, 0),
          0
        );

        const entry: WorkoutHistoryEntry = {
          ...activeWorkout,
          endTime,
          completed: true,
          totalVolume,
          durationMinutes,
        };

        // Check personal records
        const newPRs = { ...personalRecords };
        activeWorkout.exercises.forEach((we) => {
          we.sets.forEach((set) => {
            if (set.weight_kg) {
              const key = we.exercise.id;
              const existing = newPRs[key];
              if (!existing || set.weight_kg > existing.weight) {
                newPRs[key] = { weight: set.weight_kg, reps: set.reps, date: endTime };
              }
            }
          });
        });

        set({
          activeWorkout: null,
          history: [entry, ...history].slice(0, 100),
          personalRecords: newPRs,
        });

        track('workout_completed', { duration: durationMinutes, volume: totalVolume, exercises: activeWorkout.exercises.length });

        try { require('./achievements').useAchievementsStore.getState().checkAchievements(); } catch {}

        return entry;
      },

      getVolume: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return 0;
        return activeWorkout.exercises.reduce(
          (sum, we) =>
            sum + we.sets.reduce((s, set) => s + (set.weight_kg || 0) * set.reps, 0),
          0
        );
      },

      getElapsedMinutes: () => {
        const { activeWorkout } = get();
        if (!activeWorkout) return 0;
        return Math.round(
          (Date.now() - new Date(activeWorkout.startTime).getTime()) / 60000
        );
      },
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        history: state.history,
        personalRecords: state.personalRecords,
      }),
    }
  )
);
