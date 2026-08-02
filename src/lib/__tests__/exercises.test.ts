import { EXERCISES, EXERCISE_INSTRUCTIONS, getExerciseInstruction, CATEGORY_LABELS, CATEGORY_COLORS, MUSCLE_LABELS } from '@/src/lib/exercises';

describe('exercises library', () => {
  describe('EXERCISES', () => {
    it('should have 100 exercises', () => {
      expect(EXERCISES.length).toBe(100);
    });

    it('should have exercises in all 5 categories', () => {
      const cats = new Set(EXERCISES.map((e) => e.category));
      expect(cats.size).toBe(5);
      expect(cats.has('bodyweight')).toBe(true);
      expect(cats.has('dumbbell')).toBe(true);
      expect(cats.has('barbell')).toBe(true);
      expect(cats.has('cardio')).toBe(true);
      expect(cats.has('stretching')).toBe(true);
    });

    it('should have unique IDs', () => {
      const ids = EXERCISES.map((e) => e.id);
      expect(new Set(ids).size).toBe(100);
    });

    it('should have difficulty between 1-3', () => {
      EXERCISES.forEach((e) => {
        expect(e.difficulty).toBeGreaterThanOrEqual(1);
        expect(e.difficulty).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('EXERCISE_INSTRUCTIONS', () => {
    it('should have instructions for key exercises', () => {
      expect(EXERCISE_INSTRUCTIONS['bw-pushups']).toBeDefined();
      expect(EXERCISE_INSTRUCTIONS['bb-squat']).toBeDefined();
      expect(EXERCISE_INSTRUCTIONS['bb-deadlift']).toBeDefined();
    });

    it('should include instructions and tips', () => {
      const entry = EXERCISE_INSTRUCTIONS['bw-pushups'];
      expect(entry.instructions.length).toBeGreaterThan(0);
      expect(entry.tips.length).toBeGreaterThan(0);
    });
  });

  describe('getExerciseInstruction', () => {
    it('should return instructions for known exercise', () => {
      const result = getExerciseInstruction('bw-pushups');
      expect(result).toBeDefined();
      expect(result!.instructions).toBeDefined();
    });

    it('should return null for unknown exercise', () => {
      expect(getExerciseInstruction('nonexistent')).toBeNull();
    });
  });

  describe('CATEGORY_LABELS', () => {
    it('should have labels for all categories', () => {
      expect(CATEGORY_LABELS.bodyweight).toBe('Bodyweight');
      expect(CATEGORY_LABELS.dumbbell).toBe('Dumbbell');
      expect(CATEGORY_LABELS.barbell).toBe('Barbell');
      expect(CATEGORY_LABELS.cardio).toBe('Cardio');
      expect(CATEGORY_LABELS.stretching).toBe('Stretching');
    });
  });

  describe('CATEGORY_COLORS', () => {
    it('should have colors for all categories', () => {
      expect(CATEGORY_COLORS.bodyweight).toBe('#3B82F6');
      expect(CATEGORY_COLORS.dumbbell).toBe('#F59E0B');
      expect(CATEGORY_COLORS.barbell).toBe('#EF4444');
      expect(CATEGORY_COLORS.cardio).toBe('#22C55E');
      expect(CATEGORY_COLORS.stretching).toBe('#A855F7');
    });
  });

  describe('MUSCLE_LABELS', () => {
    it('should have labels for all muscle groups', () => {
      expect(MUSCLE_LABELS.chest).toBe('Chest');
      expect(MUSCLE_LABELS.back).toBe('Back');
      expect(MUSCLE_LABELS.legs).toBe('Legs');
      expect(MUSCLE_LABELS.core).toBe('Core');
      expect(MUSCLE_LABELS.full_body).toBe('Full Body');
    });
  });
});
