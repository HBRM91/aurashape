import { useWorkoutStore } from '@/src/stores/workout';
import type { Exercise } from '@/src/lib/exercises';
import type { SetLog } from '@/src/types';

const mockExercise: Exercise = {
  id: 'push_ups',
  name: 'Push Ups',
  category: 'bodyweight',
  muscleGroup: 'chest',
  difficulty: 1,
};

const mockExercise2: Exercise = {
  id: 'deadlift',
  name: 'Deadlift',
  category: 'barbell',
  muscleGroup: 'back',
  difficulty: 2,
};

beforeEach(() => {
  useWorkoutStore.setState({
    activeWorkout: null,
    history: [],
    personalRecords: {},
  });
});

describe('Workout Store', () => {
  describe('startWorkout', () => {
    it('should create an active workout', () => {
      useWorkoutStore.getState().startWorkout();
      const workout = useWorkoutStore.getState().activeWorkout;
      expect(workout).not.toBeNull();
      expect(workout!.completed).toBe(false);
      expect(workout!.exercises).toHaveLength(0);
    });

    it('should set start time', () => {
      useWorkoutStore.getState().startWorkout();
      const workout = useWorkoutStore.getState().activeWorkout;
      expect(workout!.startTime).toBeDefined();
      expect(new Date(workout!.startTime).getTime()).toBeGreaterThan(0);
    });
  });

  describe('cancelWorkout', () => {
    it('should clear the active workout', () => {
      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().cancelWorkout();
      expect(useWorkoutStore.getState().activeWorkout).toBeNull();
    });

    it('should not add cancelled workout to history', () => {
      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().cancelWorkout();
      expect(useWorkoutStore.getState().history).toHaveLength(0);
    });
  });

  describe('addExercise', () => {
    it('should add an exercise to the active workout', () => {
      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().addExercise(mockExercise);
      const exercises = useWorkoutStore.getState().activeWorkout!.exercises;
      expect(exercises).toHaveLength(1);
      expect(exercises[0].exercise.name).toBe('Push Ups');
    });

    it('should create an initial empty set', () => {
      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().addExercise(mockExercise);
      const sets = useWorkoutStore.getState().activeWorkout!.exercises[0].sets;
      expect(sets).toHaveLength(1);
      expect(sets[0].set_number).toBe(1);
      expect(sets[0].reps).toBe(0);
    });

    it('should not throw when no active workout', () => {
      expect(() => useWorkoutStore.getState().addExercise(mockExercise)).not.toThrow();
    });
  });

  describe('removeExercise', () => {
    it('should remove an exercise by index', () => {
      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().addExercise(mockExercise);
      useWorkoutStore.getState().addExercise(mockExercise2);
      useWorkoutStore.getState().removeExercise(0);
      const exercises = useWorkoutStore.getState().activeWorkout!.exercises;
      expect(exercises).toHaveLength(1);
      expect(exercises[0].exercise.name).toBe('Deadlift');
    });
  });

  describe('addSet', () => {
    it('should add a set to an exercise', () => {
      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().addExercise(mockExercise);

      const newSet: SetLog = { set_number: 0, weight_kg: 20, reps: 12 };
      useWorkoutStore.getState().addSet(0, newSet);

      const sets = useWorkoutStore.getState().activeWorkout!.exercises[0].sets;
      expect(sets).toHaveLength(2);
      expect(sets[1].weight_kg).toBe(20);
      expect(sets[1].reps).toBe(12);
      expect(sets[1].set_number).toBe(2);
    });
  });

  describe('updateSet', () => {
    it('should update a specific set', () => {
      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().addExercise(mockExercise);
      useWorkoutStore.getState().updateSet(0, 0, { weight_kg: 30, reps: 10 });
      const sets = useWorkoutStore.getState().activeWorkout!.exercises[0].sets;
      expect(sets[0].weight_kg).toBe(30);
      expect(sets[0].reps).toBe(10);
    });
  });

  describe('removeSet', () => {
    it('should remove a set by index', () => {
      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().addExercise(mockExercise);

      const set2: SetLog = { set_number: 0, weight_kg: 20, reps: 10 };
      useWorkoutStore.getState().addSet(0, set2);
      useWorkoutStore.getState().removeSet(0, 0);

      const sets = useWorkoutStore.getState().activeWorkout!.exercises[0].sets;
      expect(sets).toHaveLength(1);
    });
  });

  describe('finishWorkout', () => {
    it('should return null when no active workout', () => {
      const result = useWorkoutStore.getState().finishWorkout();
      expect(result).toBeNull();
    });

    it('should complete workout and add to history', () => {
      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().addExercise(mockExercise);
      useWorkoutStore.getState().updateSet(0, 0, { weight_kg: 60, reps: 10 });

      const result = useWorkoutStore.getState().finishWorkout();

      expect(result).not.toBeNull();
      expect(result!.completed).toBe(true);
      expect(result!.totalVolume).toBe(600);
      expect(useWorkoutStore.getState().activeWorkout).toBeNull();
      expect(useWorkoutStore.getState().history).toHaveLength(1);
    });

    it('should track personal records for heaviest set', () => {
      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().addExercise(mockExercise);
      useWorkoutStore.getState().updateSet(0, 0, { weight_kg: 80, reps: 5 });

      useWorkoutStore.getState().finishWorkout();

      const prs = useWorkoutStore.getState().personalRecords;
      expect(prs[mockExercise.id]).toBeDefined();
      expect(prs[mockExercise.id].weight).toBe(80);
      expect(prs[mockExercise.id].reps).toBe(5);
    });

    it('should update PR only if heavier than existing', () => {
      useWorkoutStore.setState({
        personalRecords: {
          [mockExercise.id]: { weight: 100, reps: 3, date: '2026-01-01' },
        },
      });

      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().addExercise(mockExercise);
      useWorkoutStore.getState().updateSet(0, 0, { weight_kg: 80, reps: 5 });
      useWorkoutStore.getState().finishWorkout();

      const prs = useWorkoutStore.getState().personalRecords;
      expect(prs[mockExercise.id].weight).toBe(100);
    });

    it('should cap history at 100 entries', () => {
      for (let i = 0; i < 110; i++) {
        useWorkoutStore.getState().startWorkout();
        useWorkoutStore.getState().addExercise(mockExercise);
        useWorkoutStore.getState().finishWorkout();
      }
      expect(useWorkoutStore.getState().history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getVolume', () => {
    it('should return 0 when no active workout', () => {
      expect(useWorkoutStore.getState().getVolume()).toBe(0);
    });

    it('should calculate total volume from all sets', () => {
      useWorkoutStore.getState().startWorkout();
      useWorkoutStore.getState().addExercise(mockExercise);
      useWorkoutStore.getState().updateSet(0, 0, { weight_kg: 50, reps: 10 });

      const set2: SetLog = { set_number: 0, weight_kg: 60, reps: 8 };
      useWorkoutStore.getState().addSet(0, set2);

      const volume = useWorkoutStore.getState().getVolume();
      expect(volume).toBe(50 * 10 + 60 * 8);
    });
  });

  describe('getElapsedMinutes', () => {
    it('should return 0 when no active workout', () => {
      expect(useWorkoutStore.getState().getElapsedMinutes()).toBe(0);
    });

    it('should return positive minutes after starting', () => {
      useWorkoutStore.getState().startWorkout();
      const minutes = useWorkoutStore.getState().getElapsedMinutes();
      expect(minutes).toBeGreaterThanOrEqual(0);
    });
  });
});
