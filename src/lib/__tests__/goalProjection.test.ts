import { buildWeightProjection } from '../goalProjection';

describe('weight projection', () => {
  it('projects weight loss to the target date', () => {
    const projection = buildWeightProjection({ currentKg: 80, targetKg: 76, weeklyChangeKg: -0.5, startDate: '2026-08-10' });
    expect(projection[0]).toEqual({ date: '2026-08-10', weightKg: 80, projected: true });
    expect(projection.at(-1)).toEqual({ date: '2026-10-05', weightKg: 76, projected: true });
  });

  it('supports gain and never projects past the target', () => {
    const projection = buildWeightProjection({ currentKg: 70, targetKg: 72, weeklyChangeKg: 0.5, startDate: '2026-08-10' });
    expect(projection.at(-1)?.weightKg).toBe(72);
  });
});
