import { getCycleRouteDestination, getFeatureAvailability, getVisibleNavItems } from '@/src/lib/profileEligibility';
import { NAV_ITEMS } from '@/src/web/navItems';

describe('profile eligibility', () => {
  it('disables Cycle for male users and keeps it available otherwise', () => {
    expect(getFeatureAvailability({ sex: 'male' }).cycle).toBe(false);
    expect(getFeatureAvailability({ sex: 'female' }).cycle).toBe(true);
    expect(getFeatureAvailability({ sex: null }).cycle).toBe(true);
  });

  it('filters Cycle from visible navigation for male users', () => {
    expect(getVisibleNavItems(NAV_ITEMS, { sex: 'male' }).some((item) => item.label === 'Cycle')).toBe(false);
    expect(getVisibleNavItems(NAV_ITEMS, { sex: 'female' }).some((item) => item.label === 'Cycle')).toBe(true);
  });

  it('redirects male users away from the direct Cycle route', () => {
    expect(getCycleRouteDestination('male')).toBe('/progress');
    expect(getCycleRouteDestination('female')).toBeNull();
    expect(getCycleRouteDestination(null)).toBeNull();
  });
});
