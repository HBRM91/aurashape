import { getSummaryDate } from '@/src/lib/summary';

describe('getSummaryDate', () => {
  it('keeps a valid diary date', () => {
    expect(getSummaryDate('2026-01-15', '2026-08-08')).toBe('2026-01-15');
  });

  it('falls back to today for missing or malformed dates', () => {
    expect(getSummaryDate(undefined, '2026-08-08')).toBe('2026-08-08');
    expect(getSummaryDate('yesterday', '2026-08-08')).toBe('2026-08-08');
  });
});
