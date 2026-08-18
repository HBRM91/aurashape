import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useIsDesktop } from '@/src/web/useIsDesktop';
import { usePathname, useRouter } from 'expo-router';
import { WebLogo } from './WebLogo';
import { getWebTokens, WEB_TOKENS } from './tokens';
import { isNavItemActive, NAV_ITEMS } from './navItems';
import { useIsDark, useThemeStore } from '@/src/stores/theme';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { getVisibleNavItems } from '@/src/lib/profileEligibility';

export function WebSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const tokens = getWebTokens(useIsDark());
  const sex = useOnboardingStore((s) => s.sex);

  if (Platform.OS !== 'web' || !isDesktop) {
    return null;
  }

  const toggleDarkMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };
  const visibleNavItems = getVisibleNavItems(NAV_ITEMS, { sex });

  return (
    <View style={[styles.sidebar, { backgroundColor: tokens.colors.surface, borderRightColor: tokens.colors.border }]}>
      <View style={styles.logoWrap}>
        <WebLogo compact />
      </View>

      <ScrollView style={styles.navScroll} contentContainerStyle={styles.navScrollContent}>
        {visibleNavItems.map((item) => {
          const active = isNavItemActive(pathname, item);
          return (
            <Pressable
              key={item.route}
              accessibilityLabel={item.label}
              accessibilityRole="link"
              accessibilityState={{ selected: active }}
              onPress={() => router.push(item.route as Parameters<typeof router.push>[0])}
              style={[
                styles.navItem,
                active ? [styles.navItemActive, { backgroundColor: tokens.colors.secondary }] : undefined,
              ]}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.navLabel,
                  active ? styles.navLabelActive : undefined,
                  { color: active ? tokens.colors.primary : tokens.colors.textMuted },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.bottomSection, { borderTopColor: tokens.colors.border }]}>
        <Pressable
          accessibilityLabel="Toggle dark mode"
          accessibilityRole="button"
          onPress={toggleDarkMode}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleIcon}>{mode === 'dark' ? '☀️' : '🌙'}</Text>
          <Text style={[styles.toggleLabel, { color: tokens.colors.textMuted }]}>
            {mode === 'dark' ? 'Light mode' : 'Dark mode'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const SIDEBAR_WIDTH = 240;

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRightColor: WEB_TOKENS.colors.border,
    borderRightWidth: 1,
    height: '100vh' as unknown as number,
    paddingBottom: WEB_TOKENS.spacing.md,
    paddingTop: WEB_TOKENS.spacing.md,
    // web-only CSS value; react-native-web supports it, RN's ViewStyle doesn't model it.
    position: 'fixed' as unknown as ViewStyle['position'],
    left: 0,
    top: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 10,
  },
  logoWrap: {
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm,
  },
  navScroll: {
    flex: 1,
    marginTop: WEB_TOKENS.spacing.lg,
  },
  navScrollContent: {
    gap: 2,
    paddingHorizontal: WEB_TOKENS.spacing.sm,
  },
  navItem: {
    alignItems: 'center',
    borderRadius: WEB_TOKENS.radii.sm,
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm + 2,
  },
  navItemActive: {
    backgroundColor: WEB_TOKENS.colors.secondary,
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  navLabelActive: {
    color: WEB_TOKENS.colors.primary,
    fontWeight: '600',
  },
  bottomSection: {
    borderTopColor: WEB_TOKENS.colors.border,
    borderTopWidth: 1,
    paddingHorizontal: WEB_TOKENS.spacing.sm,
    paddingTop: WEB_TOKENS.spacing.sm,
  },
  toggleButton: {
    alignItems: 'center',
    borderRadius: WEB_TOKENS.radii.sm,
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm + 2,
  },
  toggleIcon: {
    fontSize: 18,
  },
  toggleLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
});
