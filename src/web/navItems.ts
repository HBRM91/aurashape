export interface WebNavItem {
  route: string;
  path: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: WebNavItem[] = [
  { route: '/(tabs)', path: '/', label: 'Home', icon: '🏠' },
  { route: '/(tabs)/diary', path: '/diary', label: 'Diary', icon: '🍽️' },
  { route: '/(tabs)/fasting', path: '/fasting', label: 'Fasting', icon: '⏱️' },
  { route: '/(tabs)/workout', path: '/workout', label: 'Workout', icon: '🏋️' },
  { route: '/(tabs)/plan', path: '/plan', label: 'Plan', icon: '📋' },
  { route: '/(tabs)/progress', path: '/progress', label: 'Progress', icon: '📊' },
  { route: '/(tabs)/cycle', path: '/cycle', label: 'Cycle', icon: '🩸' },
  { route: '/(tabs)/meditation', path: '/meditation', label: 'Mindful', icon: '🧘' },
  { route: '/articles', path: '/articles', label: 'Learn', icon: '📚' },
  { route: '/(tabs)/community', path: '/community', label: 'Community', icon: '👥' },
  { route: '/(tabs)/profile', path: '/profile', label: 'Profile', icon: '👤' },
];

export function isNavItemActive(pathname: string, item: WebNavItem): boolean {
  return item.path === '/'
    ? pathname === '/'
    : pathname === item.path || pathname.startsWith(`${item.path}/`);
}

export function getActiveNavItem(pathname: string): WebNavItem | undefined {
  return NAV_ITEMS.find((item) => isNavItemActive(pathname, item));
}
