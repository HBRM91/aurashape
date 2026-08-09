import { create } from 'zustand';
import type { Exercise } from '@/src/lib/exercises';
import type { WorkoutHistoryEntry } from './workout';
import { useWorkoutStore } from './workout';

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: Array<{
    exercise: Exercise;
    sets: number;
    reps: string;
    restSeconds: number;
    notes?: string;
  }>;
  category: 'push' | 'pull' | 'legs' | 'full_body' | 'cardio' | 'custom';
  difficulty: 1 | 2 | 3;
  estimatedMinutes: number;
  lastUsed?: string;
  timesUsed: number;
}

interface WorkoutPlanState {
  templates: WorkoutTemplate[];
  addTemplate: (t: Omit<WorkoutTemplate, 'id' | 'timesUsed'>) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<WorkoutTemplate>) => void;
  useTemplate: (id: string) => void;
  getByCategory: (cat: WorkoutTemplate['category']) => WorkoutTemplate[];
  getAdaptations: () => WorkoutAdaptation[];
}

export interface WorkoutAdaptation {
  exerciseId: string;
  exerciseName: string;
  direction: 'increase' | 'decrease';
  message: string;
}

export function deriveWorkoutAdaptations(history: WorkoutHistoryEntry[]): WorkoutAdaptation[] {
  const sessionsByExercise = new Map<string, Array<{ name: string; sets: WorkoutHistoryEntry['exercises'][number]['sets'] }>>();
  history.forEach((entry) => {
    entry.exercises.forEach((exercise) => {
      const sessions = sessionsByExercise.get(exercise.exercise.id) || [];
      sessions.push({ name: exercise.exercise.name, sets: exercise.sets });
      sessionsByExercise.set(exercise.exercise.id, sessions);
    });
  });

  const adaptations: WorkoutAdaptation[] = [];
  sessionsByExercise.forEach((sessions, exerciseId) => {
    const recent = sessions.slice(0, 3);
    const comfortable = recent.length >= 3 && recent.every((session) => (
      session.sets.length > 0 && session.sets.every((set) => set.reps > 0 && (set.rpe ?? 8) <= 7)
    ));
    const hard = recent.length >= 2 && recent.every((session) => (
      session.sets.length > 0 && session.sets.some((set) => set.reps === 0 || (set.rpe ?? 0) >= 9)
    ));
    if (comfortable) {
      adaptations.push({
        exerciseId,
        exerciseName: sessions[0].name,
        direction: 'increase',
        message: `You have completed ${recent.length} comfortable sessions. Consider a small weight or rep increase.`,
      });
      return;
    }
    if (hard) {
      adaptations.push({
        exerciseId,
        exerciseName: sessions[0].name,
        direction: 'decrease',
        message: `Recent sessions were consistently high effort. Reduce load slightly and rebuild with control.`,
      });
    }
  });
  return adaptations;
}

let templateId = Date.now();

const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 't-push',
    name: 'Push Day',
    description: 'Chest, shoulders, and triceps push workout',
    exercises: [
      { exercise: { id: 'db-bench-press', name: 'Dumbbell Bench Press', category: 'dumbbell', muscleGroup: 'chest', difficulty: 2 }, sets: 4, reps: '8-12', restSeconds: 90 },
      { exercise: { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'dumbbell', muscleGroup: 'shoulders', difficulty: 2 }, sets: 3, reps: '10-12', restSeconds: 90 },
      { exercise: { id: 'bw-pushups', name: 'Push-ups', category: 'bodyweight', muscleGroup: 'chest', difficulty: 1 }, sets: 3, reps: '15-20', restSeconds: 60 },
      { exercise: { id: 'db-lateral-raise', name: 'Lateral Raises', category: 'dumbbell', muscleGroup: 'shoulders', difficulty: 1 }, sets: 3, reps: '12-15', restSeconds: 60 },
      { exercise: { id: 'bw-diamond-pushups', name: 'Diamond Push-ups', category: 'bodyweight', muscleGroup: 'triceps', difficulty: 2 }, sets: 3, reps: '8-12', restSeconds: 60 },
      { exercise: { id: 'bw-planks', name: 'Plank', category: 'bodyweight', muscleGroup: 'core', difficulty: 1 }, sets: 3, reps: '45-60 sec', restSeconds: 45 },
    ],
    category: 'push',
    difficulty: 2,
    estimatedMinutes: 45,
    timesUsed: 0,
  },
  {
    id: 't-pull',
    name: 'Pull Day',
    description: 'Back, biceps, and rear delts pull workout',
    exercises: [
      { exercise: { id: 'bw-pullups', name: 'Pull-ups', category: 'bodyweight', muscleGroup: 'back', difficulty: 2 }, sets: 4, reps: '6-10', restSeconds: 120 },
      { exercise: { id: 'db-row', name: 'Dumbbell Rows', category: 'dumbbell', muscleGroup: 'back', difficulty: 2 }, sets: 4, reps: '10-12', restSeconds: 90 },
      { exercise: { id: 'db-bicep-curl', name: 'Bicep Curls', category: 'dumbbell', muscleGroup: 'biceps', difficulty: 1 }, sets: 3, reps: '12-15', restSeconds: 60 },
      { exercise: { id: 'bw-chinups', name: 'Chin-ups', category: 'bodyweight', muscleGroup: 'biceps', difficulty: 2 }, sets: 3, reps: '6-10', restSeconds: 90 },
      { exercise: { id: 'db-rear-fly', name: 'Rear Delt Fly', category: 'dumbbell', muscleGroup: 'shoulders', difficulty: 2 }, sets: 3, reps: '12-15', restSeconds: 60 },
    ],
    category: 'pull',
    difficulty: 2,
    estimatedMinutes: 50,
    timesUsed: 0,
  },
  {
    id: 't-legs',
    name: 'Leg Day',
    description: 'Quads, hamstrings, glutes, and calves',
    exercises: [
      { exercise: { id: 'bw-squats', name: 'Bodyweight Squats', category: 'bodyweight', muscleGroup: 'legs', difficulty: 1 }, sets: 3, reps: '20-25', restSeconds: 60, notes: 'Warm-up' },
      { exercise: { id: 'db-goblet-squat', name: 'Goblet Squats', category: 'dumbbell', muscleGroup: 'legs', difficulty: 2 }, sets: 4, reps: '10-12', restSeconds: 90 },
      { exercise: { id: 'db-lunges', name: 'Dumbbell Lunges', category: 'dumbbell', muscleGroup: 'legs', difficulty: 2 }, sets: 3, reps: '10 per leg', restSeconds: 90 },
      { exercise: { id: 'bw-glute-bridge', name: 'Glute Bridges', category: 'bodyweight', muscleGroup: 'legs', difficulty: 1 }, sets: 3, reps: '15-20', restSeconds: 60 },
      { exercise: { id: 'bw-calf-raises', name: 'Calf Raises', category: 'bodyweight', muscleGroup: 'legs', difficulty: 1 }, sets: 4, reps: '20-25', restSeconds: 45 },
    ],
    category: 'legs',
    difficulty: 2,
    estimatedMinutes: 40,
    timesUsed: 0,
  },
  {
    id: 't-full-body',
    name: 'Full Body Circuit',
    description: 'Efficient full-body workout for busy days',
    exercises: [
      { exercise: { id: 'bw-burpees', name: 'Burpees', category: 'bodyweight', muscleGroup: 'full_body', difficulty: 3 }, sets: 3, reps: '10-12', restSeconds: 60 },
      { exercise: { id: 'bw-squats', name: 'Bodyweight Squats', category: 'bodyweight', muscleGroup: 'legs', difficulty: 1 }, sets: 3, reps: '15-20', restSeconds: 60 },
      { exercise: { id: 'bw-pushups', name: 'Push-ups', category: 'bodyweight', muscleGroup: 'chest', difficulty: 1 }, sets: 3, reps: '12-15', restSeconds: 60 },
      { exercise: { id: 'bw-pullups', name: 'Pull-ups (or banded)', category: 'bodyweight', muscleGroup: 'back', difficulty: 2 }, sets: 3, reps: '5-10', restSeconds: 90 },
      { exercise: { id: 'bw-planks', name: 'Plank', category: 'bodyweight', muscleGroup: 'core', difficulty: 1 }, sets: 3, reps: '30-45 sec', restSeconds: 30 },
      { exercise: { id: 'bw-mountain-climbers', name: 'Mountain Climbers', category: 'bodyweight', muscleGroup: 'full_body', difficulty: 2 }, sets: 3, reps: '20 per leg', restSeconds: 45 },
    ],
    category: 'full_body',
    difficulty: 2,
    estimatedMinutes: 30,
    timesUsed: 0,
  },
  {
    id: 't-cardio',
    name: 'HIIT Cardio Blast',
    description: 'High-intensity interval cardio for fat burning',
    exercises: [
      { exercise: { id: 'bw-burpees', name: 'Burpees', category: 'bodyweight', muscleGroup: 'full_body', difficulty: 3 }, sets: 4, reps: '30 sec on / 15 sec off', restSeconds: 60 },
      { exercise: { id: 'running', name: 'Running', category: 'cardio', muscleGroup: 'full_body', difficulty: 1 }, sets: 1, reps: '20 min', restSeconds: 0, notes: 'Steady pace warm-up' },
      { exercise: { id: 'bw-mountain-climbers', name: 'Mountain Climbers', category: 'bodyweight', muscleGroup: 'full_body', difficulty: 2 }, sets: 3, reps: '30 sec on / 15 sec off', restSeconds: 45 },
      { exercise: { id: 'cycling', name: 'Cycling', category: 'cardio', muscleGroup: 'legs', difficulty: 1 }, sets: 1, reps: '15 min', restSeconds: 0, notes: 'Moderate intensity' },
    ],
    category: 'cardio',
    difficulty: 3,
    estimatedMinutes: 35,
    timesUsed: 0,
  },
];

export const useWorkoutPlanStore = create<WorkoutPlanState>((set, get) => ({
  templates: DEFAULT_TEMPLATES,

  addTemplate: (t) =>
    set((s) => ({
      templates: [...s.templates, { ...t, id: String(templateId++), timesUsed: 0 }],
    })),

  removeTemplate: (id) =>
    set((s) => ({
      templates: s.templates.filter((t) => t.id !== id),
    })),

  updateTemplate: (id, updates) =>
    set((s) => ({
      templates: s.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  useTemplate: (id) =>
    set((s) => ({
      templates: s.templates.map((t) =>
        t.id === id
          ? { ...t, timesUsed: t.timesUsed + 1, lastUsed: new Date().toISOString() }
          : t
      ),
    })),

  getByCategory: (cat) => get().templates.filter((t) => t.category === cat),
  getAdaptations: () => deriveWorkoutAdaptations(useWorkoutStore.getState().history),
}));
