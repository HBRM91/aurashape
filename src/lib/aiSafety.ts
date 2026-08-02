import type {
  FoodAnalysisResult,
  ReadingSummary,
  WeeklyCoaching,
} from '@/src/lib/aiTypes';

const MEDICAL_ADVICE_PATTERNS = [
  'diagnose',
  'prescribe',
  'treatment for',
  'you have',
  'your condition',
  'cure for',
  'treat your',
];

const MEDICATION_ADVICE_PATTERNS = [
  'increase your dose',
  'stop taking',
  'switch to',
  'change your medication',
  'try this drug',
];

const ED_CONTENT_PATTERNS = [
  'purge',
  'starve yourself',
  'skip meals to lose weight faster',
  'laxative',
  'binge and',
];

function matchesAnyPattern(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase();
  return patterns.some((p) => lower.includes(p));
}

export function containsMedicalAdvice(text: string): boolean {
  return matchesAnyPattern(text, MEDICAL_ADVICE_PATTERNS);
}

export function containsMedicationAdvice(text: string): boolean {
  return matchesAnyPattern(text, MEDICATION_ADVICE_PATTERNS);
}

export function containsEDContent(text: string): boolean {
  return matchesAnyPattern(text, ED_CONTENT_PATTERNS);
}

const ALLOWED_COACHING_CATEGORIES = new Set([
  'nutrition',
  'fasting',
  'workout',
  'recovery',
  'hydration',
]);

export function validateFoodAnalysis(
  result: FoodAnalysisResult
): { valid: boolean; reason?: string } {
  if (!result.items || result.items.length === 0) {
    return { valid: false, reason: 'Food analysis must contain at least one item' };
  }

  if (result.confidence === 'low') {
    return {
      valid: false,
      reason: 'Food analysis confidence is too low to display',
    };
  }

  const severeWarnings = result.warnings.some((w) => {
    const lower = w.toLowerCase();
    return (
      containsMedicalAdvice(lower) ||
      containsEDContent(lower)
    );
  });

  if (severeWarnings) {
    return {
      valid: false,
      reason: 'Food analysis contains unsafe warning content',
    };
  }

  for (const item of result.items) {
    if (!item.name) {
      return { valid: false, reason: 'Food item missing name' };
    }
    if (item.estimatedCalories < 0) {
      return { valid: false, reason: 'Food item has negative calories' };
    }
    if (item.confidence === 'low') {
      return {
        valid: false,
        reason: `Food item "${item.name}" has low confidence`,
      };
    }
  }

  return { valid: true };
}

export function validateReadingSummary(
  summary: ReadingSummary
): { valid: boolean; reason?: string } {
  if (!summary.title) {
    return { valid: false, reason: 'Reading summary missing title' };
  }

  if (!summary.summary) {
    return { valid: false, reason: 'Reading summary missing summary text' };
  }

  if (!summary.disclaimer) {
    return { valid: false, reason: 'Reading summary missing disclaimer' };
  }

  const combinedText = [
    summary.summary,
    ...summary.claims.map((c) => c.text),
    ...summary.practicalActions,
  ].join(' ');

  if (containsMedicalAdvice(combinedText)) {
    return {
      valid: false,
      reason: 'Reading summary contains medical advice language',
    };
  }

  if (containsEDContent(combinedText)) {
    return {
      valid: false,
      reason: 'Reading summary contains eating disorder triggers',
    };
  }

  return { valid: true };
}

export function validateCoaching(
  coaching: WeeklyCoaching
): { valid: boolean; reason?: string } {
  if (!coaching.recommendations || coaching.recommendations.length === 0) {
    return { valid: false, reason: 'Coaching must contain at least one recommendation' };
  }

  if (!coaching.disclaimer) {
    return { valid: false, reason: 'Coaching missing disclaimer' };
  }

  for (const rec of coaching.recommendations) {
    if (!ALLOWED_COACHING_CATEGORIES.has(rec.category)) {
      return {
        valid: false,
        reason: `Disallowed coaching category: "${rec.category}"`,
      };
    }

    if (!rec.recommendation) {
      return { valid: false, reason: 'Recommendation text is empty' };
    }

    if (containsMedicalAdvice(rec.recommendation)) {
      return {
        valid: false,
        reason: 'Coaching recommendation contains medical advice language',
      };
    }

    if (containsEDContent(rec.recommendation)) {
      return {
        valid: false,
        reason: 'Coaching recommendation contains eating disorder triggers',
      };
    }
  }

  return { valid: true };
}

export function generateDisclaimer(): string {
  return (
    'Disclaimer: Aurashape provides general wellness information and AI-generated suggestions for educational purposes only. ' +
    'This is not medical advice. Always consult a licensed healthcare professional before making changes to your diet, ' +
    'exercise routine, fasting protocol, or supplement regimen. AI-generated content may contain inaccuracies.'
  );
}
