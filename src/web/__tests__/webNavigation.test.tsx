import { fireEvent, render } from '@testing-library/react-native';
import { Platform, StyleSheet } from 'react-native';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const push = jest.fn();
const setMode = jest.fn();

jest.mock('expo-router', () => ({
  usePathname: () => '/diary',
  useRouter: () => ({ push }),
}));

jest.mock('@/src/stores/theme', () => ({
  useThemeStore: (selector: (state: { mode: 'light'; setMode: typeof setMode }) => unknown) =>
    selector({ mode: 'light', setMode }),
}));

import { WebMobileNav } from '../WebMobileNav';
import { WebSidebar } from '../WebSidebar';
import { NAV_ITEMS, isNavItemActive } from '../navItems';

describe('web navigation', () => {
  const nativePlatform = Platform.OS;
  let dimensions: jest.SpyInstance;

  beforeAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  });

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: nativePlatform });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    dimensions?.mockRestore();
  });

  it('maps every requested destination to its route and visible web path', () => {
    const expected = {
      Home: { route: '/(tabs)', path: '/' },
      Diary: { route: '/(tabs)/diary', path: '/diary' },
      Fasting: { route: '/(tabs)/fasting', path: '/fasting' },
      Workout: { route: '/(tabs)/workout', path: '/workout' },
      Progress: { route: '/(tabs)/progress', path: '/progress' },
      Cycle: { route: '/(tabs)/cycle', path: '/cycle' },
      Mindful: { route: '/(tabs)/meditation', path: '/meditation' },
      Community: { route: '/(tabs)/community', path: '/community' },
      Learn: { route: '/articles', path: '/articles' },
      Profile: { route: '/(tabs)/profile', path: '/profile' },
    } as const;

    for (const [label, destination] of Object.entries(expected)) {
      expect(NAV_ITEMS).toContainEqual(expect.objectContaining({ label, ...destination }));
    }
  });

  it('matches normalized Expo Router paths, including nested paths', () => {
    const diary = NAV_ITEMS.find((item) => item.label === 'Diary');
    expect(diary).toBeDefined();
    expect(isNavItemActive('/diary', diary!)).toBe(true);
    expect(isNavItemActive('/diary/entry', diary!)).toBe(true);
    expect(isNavItemActive('/progress', diary!)).toBe(false);
  });

  it('makes every desktop destination navigable and marks the current route active', async () => {
    dimensions = jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({
      width: 1200,
      height: 900,
      scale: 1,
      fontScale: 1,
    });

    const { getByRole } = await render(<WebSidebar />);

    expect(StyleSheet.flatten(getByRole('link', { name: 'Navigate to Diary' }).props.style)).toEqual(
      expect.objectContaining({ backgroundColor: expect.any(String) }),
    );

    for (const item of NAV_ITEMS) {
      await fireEvent.press(getByRole('link', { name: `Navigate to ${item.label}` }));
    }

    expect(push).toHaveBeenCalledWith('/(tabs)');
    expect(push).toHaveBeenCalledWith('/articles');
    expect(push).toHaveBeenCalledTimes(NAV_ITEMS.length);
  });

  it('keeps all destinations reachable from compact mobile navigation', async () => {
    dimensions = jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({
      width: 375,
      height: 812,
      scale: 1,
      fontScale: 1,
    });

    const { getByRole } = await render(<WebMobileNav />);
    await fireEvent.press(getByRole('button', { name: 'More navigation options' }));

    for (const item of NAV_ITEMS) {
      expect(getByRole('button', { name: item.label })).toBeTruthy();
    }
  });

  it('uses Slot for web tab content while retaining the native Tabs branch', () => {
    const layout = readFileSync(resolve(__dirname, '../../../app/(tabs)/_layout.tsx'), 'utf8');

    expect(layout).toContain("import { Slot, Tabs } from 'expo-router'");
    expect(layout).toContain('if (Platform.OS === \'web\')');
    expect(layout).toContain('<Slot />');
    expect(layout).toContain('<Tabs');
  });
});
