export interface WeightProjectionPoint {
  date: string;
  weightKg: number;
  projected: true;
}

export interface WeightProjectionInput {
  currentKg: number;
  targetKg: number;
  weeklyChangeKg: number;
  startDate: string;
}

export function buildWeightProjection(input: WeightProjectionInput): WeightProjectionPoint[] {
  const { currentKg, targetKg, weeklyChangeKg, startDate } = input;
  if (!Number.isFinite(currentKg) || !Number.isFinite(targetKg) || !Number.isFinite(weeklyChangeKg) || weeklyChangeKg === 0) return [];
  if ((targetKg - currentKg) * weeklyChangeKg < 0) return [];

  const distance = Math.abs(targetKg - currentKg);
  const weeks = Math.ceil(distance / Math.abs(weeklyChangeKg));
  const start = new Date(`${startDate}T00:00:00Z`);
  if (!Number.isFinite(start.getTime()) || weeks > 520) return [];

  return Array.from({ length: weeks + 1 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + index * 7);
    const rawWeight = currentKg + weeklyChangeKg * index;
    const weightKg = index === weeks ? targetKg : Math.round(rawWeight * 10) / 10;
    return { date: date.toISOString().slice(0, 10), weightKg, projected: true as const };
  });
}
