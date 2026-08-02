import {
  containsMedicalAdvice,
  containsMedicationAdvice,
  containsEDContent,
  validateFoodAnalysis,
  validateReadingSummary,
  validateCoaching,
  generateDisclaimer,
} from '@/src/lib/aiSafety';
import type {
  FoodAnalysisResult,
  ReadingSummary,
  WeeklyCoaching,
} from '@/src/lib/aiTypes';

function makeFoodAnalysis(
  overrides: Partial<FoodAnalysisResult> = {}
): FoodAnalysisResult {
  return {
    items: [
      {
        name: 'Chicken salad',
        estimatedCalories: 350,
        proteinG: 30,
        carbsG: 15,
        fatG: 18,
        confidence: 'medium',
      },
    ],
    estimatedTotalCalories: 350,
    macros: { protein: 30, carbs: 15, fat: 18 },
    confidence: 'medium',
    assumptions: ['Standard portion size'],
    warnings: [],
    ...overrides,
  };
}

function makeReadingSummary(
  overrides: Partial<ReadingSummary> = {}
): ReadingSummary {
  return {
    title: 'Intermittent fasting and metabolic health',
    summary:
      'A systematic review examining the effects of time-restricted eating on insulin sensitivity.',
    claims: [
      {
        text: 'Time-restricted eating improved insulin sensitivity by 15%.',
        evidenceGrade: 'moderate',
        citations: [
          {
            authors: 'Smith J, Doe A',
            journal: 'Journal of Nutrition',
            year: 2024,
            title: 'Effects of TRE on insulin sensitivity',
          },
        ],
      },
    ],
    evidenceGrade: 'moderate',
    citations: [
      {
        authors: 'Smith J, Doe A',
        journal: 'Journal of Nutrition',
        year: 2024,
        title: 'Effects of TRE on insulin sensitivity',
      },
    ],
    practicalActions: ['Try a 16:8 fasting schedule', 'Consult your doctor'],
    limitations: ['Small sample size'],
    disclaimer: 'This is not medical advice.',
    ...overrides,
  };
}

function makeCoaching(
  overrides: Partial<WeeklyCoaching> = {}
): WeeklyCoaching {
  return {
    recommendations: [
      {
        category: 'nutrition',
        recommendation: 'Add more leafy greens to your meals this week.',
        reason: 'You averaged 2 servings of vegetables per day.',
        confidence: 'medium',
      },
      {
        category: 'hydration',
        recommendation: 'Drink water before each meal.',
        reason: 'Your logged water intake is below target.',
        confidence: 'high',
      },
    ],
    generatedAt: '2025-01-15T10:00:00Z',
    disclaimer: 'This is not medical advice. AI features are experimental.',
    ...overrides,
  };
}

describe('aiSafety', () => {
  describe('containsMedicalAdvice', () => {
    it('should detect "diagnose"', () => {
      expect(containsMedicalAdvice('We can diagnose your issue')).toBe(true);
    });

    it('should detect "prescribe"', () => {
      expect(containsMedicalAdvice('I prescribe exercise')).toBe(true);
    });

    it('should detect "treatment for"', () => {
      expect(
        containsMedicalAdvice('This is the best treatment for obesity')
      ).toBe(true);
    });

    it('should detect "you have"', () => {
      expect(containsMedicalAdvice('You have high blood pressure')).toBe(true);
    });

    it('should detect "your condition"', () => {
      expect(
        containsMedicalAdvice('Based on your condition, try this')
      ).toBe(true);
    });

    it('should detect "cure for"', () => {
      expect(
        containsMedicalAdvice('There is a cure for diabetes')
      ).toBe(true);
    });

    it('should detect "treat your"', () => {
      expect(
        containsMedicalAdvice('We can treat your symptoms')
      ).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(containsMedicalAdvice('You Have a problem')).toBe(true);
      expect(containsMedicalAdvice('DIAGNOSE THIS')).toBe(true);
    });

    it('should pass normal content', () => {
      expect(
        containsMedicalAdvice('Eating vegetables is good for your health')
      ).toBe(false);
      expect(
        containsMedicalAdvice('Exercise regularly for better sleep')
      ).toBe(false);
    });

    it('should pass empty string', () => {
      expect(containsMedicalAdvice('')).toBe(false);
    });

    it('should pass very long strings without trigger words', () => {
      const long = 'Healthy eating '.repeat(200);
      expect(containsMedicalAdvice(long)).toBe(false);
    });
  });

  describe('containsMedicationAdvice', () => {
    it('should detect "increase your dose"', () => {
      expect(
        containsMedicationAdvice('You should increase your dose')
      ).toBe(true);
    });

    it('should detect "stop taking"', () => {
      expect(
        containsMedicationAdvice('Stop taking your medication')
      ).toBe(true);
    });

    it('should detect "switch to"', () => {
      expect(
        containsMedicationAdvice('Switch to a different drug')
      ).toBe(true);
    });

    it('should detect "change your medication"', () => {
      expect(
        containsMedicationAdvice('You should change your medication')
      ).toBe(true);
    });

    it('should detect "try this drug"', () => {
      expect(
        containsMedicationAdvice('Try this drug for better results')
      ).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(containsMedicationAdvice('STOP TAKING that')).toBe(true);
      expect(containsMedicationAdvice('Try This Drug')).toBe(true);
    });

    it('should pass normal content', () => {
      expect(
        containsMedicationAdvice('Take your vitamins daily')
      ).toBe(false);
      expect(
        containsMedicationAdvice('Follow the recommended diet')
      ).toBe(false);
    });

    it('should pass empty string', () => {
      expect(containsMedicationAdvice('')).toBe(false);
    });
  });

  describe('containsEDContent', () => {
    it('should detect "purge"', () => {
      expect(containsEDContent('You should purge after eating')).toBe(true);
    });

    it('should detect "starve yourself"', () => {
      expect(containsEDContent('Just starve yourself to lose weight')).toBe(
        true
      );
    });

    it('should detect "skip meals to lose weight faster"', () => {
      expect(
        containsEDContent('Skip meals to lose weight faster is my advice')
      ).toBe(true);
    });

    it('should detect "laxative"', () => {
      expect(containsEDContent('Use a laxative for weight loss')).toBe(true);
    });

    it('should detect "binge and"', () => {
      expect(containsEDContent('Just binge and then restrict')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(containsEDContent('PURGE after meals')).toBe(true);
    });

    it('should pass normal fasting advice', () => {
      expect(containsEDContent('Try intermittent fasting for health')).toBe(
        false
      );
      expect(
        containsEDContent('Skip breakfast if not hungry')
      ).toBe(false);
    });

    it('should pass empty string', () => {
      expect(containsEDContent('')).toBe(false);
    });
  });

  describe('validateFoodAnalysis', () => {
    it('should accept valid food analysis', () => {
      const result = makeFoodAnalysis();
      expect(validateFoodAnalysis(result)).toEqual({ valid: true });
    });

    it('should reject empty items array', () => {
      const result = makeFoodAnalysis({ items: [] });
      expect(validateFoodAnalysis(result)).toEqual({
        valid: false,
        reason: 'Food analysis must contain at least one item',
      });
    });

    it('should reject low overall confidence', () => {
      const result = makeFoodAnalysis({ confidence: 'low' });
      expect(validateFoodAnalysis(result)).toEqual({
        valid: false,
        reason: 'Food analysis confidence is too low to display',
      });
    });

    it('should reject item with low confidence', () => {
      const result = makeFoodAnalysis({
        items: [
          {
            name: 'Unknown soup',
            estimatedCalories: 200,
            proteinG: 10,
            carbsG: 20,
            fatG: 10,
            confidence: 'low',
          },
        ],
        confidence: 'high',
      });
      expect(validateFoodAnalysis(result)).toEqual({
        valid: false,
        reason: 'Food item "Unknown soup" has low confidence',
      });
    });

    it('should reject item with missing name', () => {
      const result = makeFoodAnalysis({
        items: [
          {
            name: '',
            estimatedCalories: 200,
            proteinG: 10,
            carbsG: 20,
            fatG: 10,
            confidence: 'high',
          },
        ],
      });
      expect(validateFoodAnalysis(result)).toEqual({
        valid: false,
        reason: 'Food item missing name',
      });
    });

    it('should reject item with negative calories', () => {
      const result = makeFoodAnalysis({
        items: [
          {
            name: 'Magic food',
            estimatedCalories: -100,
            proteinG: 10,
            carbsG: 20,
            fatG: 10,
            confidence: 'high',
          },
        ],
      });
      expect(validateFoodAnalysis(result)).toEqual({
        valid: false,
        reason: 'Food item has negative calories',
      });
    });

    it('should reject analysis with medical advice in warnings', () => {
      const result = makeFoodAnalysis({
        warnings: ['We can diagnose your condition from this meal'],
      });
      expect(validateFoodAnalysis(result)).toEqual({
        valid: false,
        reason: 'Food analysis contains unsafe warning content',
      });
    });

    it('should reject analysis with ED content in warnings', () => {
      const result = makeFoodAnalysis({
        warnings: ['You should purge after this meal'],
      });
      expect(validateFoodAnalysis(result)).toEqual({
        valid: false,
        reason: 'Food analysis contains unsafe warning content',
      });
    });

    it('should accept medium confidence analysis', () => {
      const result = makeFoodAnalysis({ confidence: 'medium' });
      expect(validateFoodAnalysis(result).valid).toBe(true);
    });

    it('should accept high confidence analysis', () => {
      const result = makeFoodAnalysis({ confidence: 'high' });
      expect(validateFoodAnalysis(result).valid).toBe(true);
    });
  });

  describe('validateReadingSummary', () => {
    it('should accept valid reading summary', () => {
      const summary = makeReadingSummary();
      expect(validateReadingSummary(summary)).toEqual({ valid: true });
    });

    it('should reject missing title', () => {
      const summary = makeReadingSummary({ title: '' });
      expect(validateReadingSummary(summary)).toEqual({
        valid: false,
        reason: 'Reading summary missing title',
      });
    });

    it('should reject missing summary text', () => {
      const summary = makeReadingSummary({ summary: '' });
      expect(validateReadingSummary(summary)).toEqual({
        valid: false,
        reason: 'Reading summary missing summary text',
      });
    });

    it('should reject missing disclaimer', () => {
      const summary = makeReadingSummary({ disclaimer: '' });
      expect(validateReadingSummary(summary)).toEqual({
        valid: false,
        reason: 'Reading summary missing disclaimer',
      });
    });

    it('should reject medical advice in summary text', () => {
      const summary = makeReadingSummary({
        summary: 'You have insulin resistance and we can treat your symptoms',
      });
      expect(validateReadingSummary(summary)).toEqual({
        valid: false,
        reason: 'Reading summary contains medical advice language',
      });
    });

    it('should reject medical advice in claims', () => {
      const summary = makeReadingSummary({
        claims: [
          {
            text: 'We can diagnose your metabolic disorder',
            evidenceGrade: 'weak',
            citations: [],
          },
        ],
      });
      expect(validateReadingSummary(summary)).toEqual({
        valid: false,
        reason: 'Reading summary contains medical advice language',
      });
    });

    it('should reject ED content in practical actions', () => {
      const summary = makeReadingSummary({
        practicalActions: ['Starve yourself for 24 hours'],
      });
      expect(validateReadingSummary(summary)).toEqual({
        valid: false,
        reason: 'Reading summary contains eating disorder triggers',
      });
    });

    it('should accept summary with empty claims array', () => {
      const summary = makeReadingSummary({ claims: [] });
      expect(validateReadingSummary(summary).valid).toBe(true);
    });
  });

  describe('validateCoaching', () => {
    it('should accept valid coaching', () => {
      const coaching = makeCoaching();
      expect(validateCoaching(coaching)).toEqual({ valid: true });
    });

    it('should reject empty recommendations', () => {
      const coaching = makeCoaching({ recommendations: [] });
      expect(validateCoaching(coaching)).toEqual({
        valid: false,
        reason: 'Coaching must contain at least one recommendation',
      });
    });

    it('should reject missing disclaimer', () => {
      const coaching = makeCoaching({ disclaimer: '' });
      expect(validateCoaching(coaching)).toEqual({
        valid: false,
        reason: 'Coaching missing disclaimer',
      });
    });

    it('should reject disallowed category', () => {
      const coaching = makeCoaching({
        recommendations: [
          {
            category: 'magic' as any,
            recommendation: 'Do magic',
            reason: 'Because',
            confidence: 'low',
          },
        ],
      });
      expect(validateCoaching(coaching)).toEqual({
        valid: false,
        reason: 'Disallowed coaching category: "magic"',
      });
    });

    it('should reject empty recommendation text', () => {
      const coaching = makeCoaching({
        recommendations: [
          {
            category: 'nutrition',
            recommendation: '',
            reason: 'Because',
            confidence: 'medium',
          },
        ],
      });
      expect(validateCoaching(coaching)).toEqual({
        valid: false,
        reason: 'Recommendation text is empty',
      });
    });

    it('should reject medical advice in recommendations', () => {
      const coaching = makeCoaching({
        recommendations: [
          {
            category: 'nutrition',
            recommendation: 'We can treat your condition with this diet',
            reason: 'Analysis',
            confidence: 'medium',
          },
        ],
      });
      expect(validateCoaching(coaching)).toEqual({
        valid: false,
        reason: 'Coaching recommendation contains medical advice language',
      });
    });

    it('should reject ED content in recommendations', () => {
      const coaching = makeCoaching({
        recommendations: [
          {
            category: 'nutrition',
            recommendation: 'Skip meals to lose weight faster',
            reason: 'Analysis',
            confidence: 'medium',
          },
        ],
      });
      expect(validateCoaching(coaching)).toEqual({
        valid: false,
        reason: 'Coaching recommendation contains eating disorder triggers',
      });
    });
  });

  describe('generateDisclaimer', () => {
    it('should return a non-empty string', () => {
      const disclaimer = generateDisclaimer();
      expect(disclaimer.length).toBeGreaterThan(0);
    });

    it('should contain key phrases', () => {
      const disclaimer = generateDisclaimer();
      expect(disclaimer).toContain('not medical advice');
      expect(disclaimer).toContain('consult');
      expect(disclaimer).toContain('healthcare professional');
      expect(disclaimer).toContain('educational purposes');
    });

    it('should return the same string each call', () => {
      expect(generateDisclaimer()).toBe(generateDisclaimer());
    });
  });

  describe('safety filter integration', () => {
    it('should allow normal nutrition content through all filters', () => {
      const text = 'Consider eating more vegetables and lean protein for balanced nutrition.';
      expect(containsMedicalAdvice(text)).toBe(false);
      expect(containsMedicationAdvice(text)).toBe(false);
      expect(containsEDContent(text)).toBe(false);
    });

    it('should allow normal fitness content through all filters', () => {
      const text = 'Try adding 30 minutes of walking to your daily routine for better cardiovascular health.';
      expect(containsMedicalAdvice(text)).toBe(false);
      expect(containsMedicationAdvice(text)).toBe(false);
      expect(containsEDContent(text)).toBe(false);
    });

    it('should allow normal fasting content through all filters', () => {
      const text = 'Intermittent fasting with a 16:8 schedule may support metabolic flexibility when combined with a nutritious diet.';
      expect(containsMedicalAdvice(text)).toBe(false);
      expect(containsMedicationAdvice(text)).toBe(false);
      expect(containsEDContent(text)).toBe(false);
    });

    it('should handle Unicode content through all filters', () => {
      const text = 'Consommez plus de légumes 🥗 et de protéines maigres pour une alimentation équilibrée.';
      expect(containsMedicalAdvice(text)).toBe(false);
      expect(containsMedicationAdvice(text)).toBe(false);
      expect(containsEDContent(text)).toBe(false);
    });
  });
});
