export const FASTING_PLANS = {
  none: {
    label: 'Not now',
    description: 'Keep a regular eating pattern and revisit fasting later.',
    tradeoffs: 'No fasting schedule to maintain; you can still use meal timing and balanced nutrition.',
    safety: 'Choose this if fasting is not suitable for you or you do not want to use it.',
  },
  '12:12': {
    label: '12:12',
    description: 'A gentle overnight break from food.',
    tradeoffs: 'Easy to fit into family routines, with less evidence of additional benefit beyond a consistent calorie pattern.',
    safety: 'Avoid compensating with large meals; hydration and adequate nutrition still matter.',
  },
  '14:10': {
    label: '14:10',
    description: 'A beginner-friendly eating window.',
    tradeoffs: 'May reduce late-night eating while preserving flexibility for social meals.',
    safety: 'Stop if you feel unwell and discuss fasting with a clinician if you take glucose-lowering medication.',
  },
  '16:8': {
    label: '16:8',
    description: 'A common time-restricted eating schedule.',
    tradeoffs: 'Can simplify meals and reduce grazing, but may make training, social meals, or adequate intake harder.',
    safety: 'Not appropriate for everyone; seek professional advice during pregnancy, eating-disorder recovery, or medical treatment.',
  },
  '18:6': {
    label: '18:6',
    description: 'A narrower eating window for experienced users.',
    tradeoffs: 'Fewer meals may make protein, fiber, and total energy harder to reach consistently.',
    safety: 'Use extra caution with intense training, medication, dizziness, or a history of disordered eating.',
  },
  '20:4': {
    label: '20:4',
    description: 'An advanced and restrictive schedule.',
    tradeoffs: 'Difficult to sustain and more likely to interfere with adequate nutrition and social routines.',
    safety: 'Do not use without professional guidance if you have a health condition or take medication.',
  },
  '5:2': {
    label: '5:2',
    description: 'Five regular days and two reduced-intake days.',
    tradeoffs: 'Flexible across a week, but reduced-intake days can increase hunger and affect training quality.',
    safety: 'Reduced-intake days should not become starvation days; professional guidance is recommended for medical conditions.',
  },
} as const;
