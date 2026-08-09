import { cmToIn, inToCm, kgToLb, lbToKg } from '../unitConversion';

describe('unit conversion', () => {
  it('converts weight both ways with stable display rounding', () => {
    expect(kgToLb(70)).toBe(154.3);
    expect(lbToKg(154.3)).toBeCloseTo(70, 1);
  });

  it('converts height both ways', () => {
    expect(cmToIn(175)).toBe(68.9);
    expect(inToCm(68.9)).toBeCloseTo(175, 0);
  });
});
