export function getSummaryDate(value: string | string[] | undefined, today: string): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : today;
}
