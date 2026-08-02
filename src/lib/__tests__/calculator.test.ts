import { calculateBMI, estimateBodyFatPct, calculateTDEE, calculateMacros, getWeightProgress } from '@/src/lib/calculator';
import type { ActivityLevel, Goal } from '@/src/types';

describe('calculator', () => {
  describe('calculateBMI', () => {
    it('should calculate BMI correctly', () => {
      const result = calculateBMI(70, 175);
      expect(result.bmi).toBeCloseTo(22.9, 0);
      expect(result.category).toBe('Healthy');
    });

    it('should classify underweight', () => {
      const result = calculateBMI(50, 175);
      expect(result.bmi).toBeLessThan(18.5);
      expect(result.category).toBe('Underweight');
    });

    it('should classify overweight', () => {
      const result = calculateBMI(85, 175);
      expect(result.bmi).toBeGreaterThanOrEqual(25);
      expect(result.bmi).toBeLessThan(30);
      expect(result.category).toBe('Overweight');
    });

    it('should classify obese class I', () => {
      const result = calculateBMI(95, 175);
      expect(result.bmi).toBeGreaterThanOrEqual(30);
      expect(result.category).toContain('Obese');
    });

    it('should calculate healthy weight range', () => {
      const result = calculateBMI(70, 175);
      expect(result.healthyMin).toBeGreaterThan(50);
      expect(result.healthyMax).toBeGreaterThan(70);
      expect(result.healthyMin).toBeLessThan(result.healthyMax);
    });
  });

  describe('estimateBodyFatPct', () => {
    it('should estimate body fat for males', () => {
      const bf = estimateBodyFatPct('male', 24, 30);
      expect(bf).toBeGreaterThan(5);
      expect(bf).toBeLessThan(35);
    });

    it('should estimate body fat for females', () => {
      const bf = estimateBodyFatPct('female', 22, 28);
      expect(bf).toBeGreaterThan(10);
      expect(bf).toBeLessThan(40);
    });

    it('should clamp to minimum 3%', () => {
      expect(estimateBodyFatPct('male', 10, 20)).toBe(3);
    });

    it('should clamp to maximum 50%', () => {
      expect(estimateBodyFatPct('female', 50, 60)).toBe(50);
    });
  });

  describe('calculateTDEE', () => {
    it('should calculate TDEE for moderately active male', () => {
      const tdee = calculateTDEE({ age: 30, sex: 'male', weightKg: 80, heightCm: 180 }, 'moderately_active');
      expect(tdee).toBeGreaterThan(2000);
      expect(tdee).toBeLessThan(3500);
    });

    it('should calculate TDEE for lightly active female', () => {
      const tdee = calculateTDEE({ age: 25, sex: 'female', weightKg: 65, heightCm: 165 }, 'lightly_active');
      expect(tdee).toBeGreaterThan(1500);
      expect(tdee).toBeLessThan(2500);
    });

    it('should return higher TDEE for very active', () => {
      const metrics = { age: 30, sex: 'male' as const, weightKg: 80, heightCm: 180 };
      const low = calculateTDEE(metrics, 'lightly_active');
      const high = calculateTDEE(metrics, 'very_active');
      expect(high).toBeGreaterThan(low);
    });
  });

  describe('calculateMacros', () => {
    it('should calculate macros for weight loss', () => {
      const result = calculateMacros(2500, 'lose_weight', 80);
      expect(result.calorieTarget).toBe(2000);
      expect(result.proteinG).toBe(160);
      expect(result.carbsG).toBeGreaterThan(0);
      expect(result.fatG).toBeGreaterThan(0);
    });

    it('should calculate macros for muscle building', () => {
      const result = calculateMacros(2500, 'build_muscle', 80);
      expect(result.calorieTarget).toBe(2800);
      expect(result.proteinG).toBe(160);
    });

    it('should maintain calories for maintain goal', () => {
      const result = calculateMacros(2500, 'maintain', 80);
      expect(result.calorieTarget).toBe(2500);
    });

    it('should never return negative carbs', () => {
      const result = calculateMacros(1000, 'lose_weight', 100);
      expect(result.carbsG).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getWeightProgress', () => {
    it('should report weight loss correctly', () => {
      const result = getWeightProgress(75, 80, 'lose_weight');
      expect(result.lost).toBe(5);
      expect(result.pct).toBeCloseTo(6.3, 0);
    });

    it('should report weight gain for muscle building', () => {
      const result = getWeightProgress(85, 80, 'build_muscle');
      expect(result.lost).toBe(-5);
      expect(result.pct).toBeCloseTo(6.3, 0);
    });

    it('should report no change', () => {
      const result = getWeightProgress(80, 80, 'maintain');
      expect(result.lost).toBe(0);
    });
  });
});
