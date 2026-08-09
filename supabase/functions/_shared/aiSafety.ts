const UNSAFE_PATTERNS = [
  'diagnose',
  'prescribe',
  'treatment for',
  'you have',
  'your condition',
  'cure for',
  'treat your',
  'increase your dose',
  'stop taking',
  'switch to a different drug',
  'change your medication',
  'try this drug',
  'purge',
  'starve yourself',
  'laxative',
  'binge and restrict',
];

export function findUnsafeContent(values: string[]): string | null {
  const text = values.join(' ').toLowerCase();
  return UNSAFE_PATTERNS.find((pattern) => text.includes(pattern)) || null;
}

export function requireSafeContent(values: string[]): void {
  const pattern = findUnsafeContent(values);
  if (pattern) throw new Error(`AI response rejected for unsafe content: ${pattern}`);
}

export function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

export function confidenceOrLow(value: unknown): 'high' | 'medium' | 'low' {
  return value === 'high' || value === 'medium' || value === 'low' ? value : 'low';
}
