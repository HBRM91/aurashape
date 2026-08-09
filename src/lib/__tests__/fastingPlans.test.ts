import { FASTING_PLANS } from '../fastingPlans';

describe('fasting plans', () => {
  it('includes an explicit opt-out and safety guidance', () => {
    expect(FASTING_PLANS.none.label).toBe('Not now');
    expect(FASTING_PLANS['16:8'].tradeoffs.length).toBeGreaterThan(20);
    expect(FASTING_PLANS['16:8'].safety.length).toBeGreaterThan(20);
  });
});
