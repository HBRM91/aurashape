import type { WebNavItem } from '@/src/web/navItems';

export type ProfileSex = 'male' | 'female' | null;

export function getFeatureAvailability(profile: { sex: ProfileSex }): { cycle: boolean } {
  return { cycle: profile.sex !== 'male' };
}

export function getVisibleNavItems<T extends WebNavItem>(items: T[], profile: { sex: ProfileSex }): T[] {
  const availability = getFeatureAvailability(profile);
  return items.filter((item) => item.label !== 'Cycle' || availability.cycle);
}

export function getCycleRouteDestination(sex: ProfileSex): '/progress' | null {
  return sex === 'male' ? '/progress' : null;
}
