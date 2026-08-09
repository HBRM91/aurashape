import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { getWebTokens, WEB_TOKENS } from './tokens';
import { getActiveNavItem, isNavItemActive, NAV_ITEMS } from './navItems';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { getVisibleNavItems } from '@/src/lib/profileEligibility';
import { useIsDark } from '@/src/stores/theme';

const VISIBLE_COUNT = 5;

export function WebMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);
  const sex = useOnboardingStore((s) => s.sex);
  const tokens = getWebTokens(useIsDark());

  if (Platform.OS !== 'web') {
    return null;
  }

  const navItems = getVisibleNavItems(NAV_ITEMS, { sex });
  const visibleItems = navItems.slice(0, VISIBLE_COUNT);
  const moreItems = navItems.slice(VISIBLE_COUNT);
  const activeItem = getActiveNavItem(pathname);
  const moreSelected = activeItem !== undefined && moreItems.includes(activeItem);

  return (
    <>
      <View style={[styles.nav, { backgroundColor: tokens.colors.surface, borderTopColor: tokens.colors.border }]}>
        {visibleItems.map((item) => {
          const active = isNavItemActive(pathname, item);
          return (
            <Pressable
              key={item.route}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => router.push(item.route as Parameters<typeof router.push>[0])}
              style={[styles.navItem, active ? [styles.navItemActive, { backgroundColor: tokens.colors.secondary }] : undefined]}
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

        <Pressable
          accessibilityLabel="More navigation options"
          accessibilityRole="button"
          accessibilityState={{ expanded: showMore, selected: moreSelected }}
          onPress={() => setShowMore(!showMore)}
          style={[styles.navItem, moreSelected ? [styles.navItemActive, { backgroundColor: tokens.colors.secondary }] : undefined]}
        >
          <Text style={styles.navIcon}>{showMore ? '✕' : '⋯'}</Text>
          <Text style={[styles.navLabel, moreSelected ? styles.navLabelActive : undefined, { color: moreSelected ? tokens.colors.primary : tokens.colors.textMuted }]}>More</Text>
        </Pressable>
      </View>

      {showMore ? (
        <View style={styles.moreOverlay}>
           <View style={[styles.morePanel, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}>
            {moreItems.map((item) => {
              const active = isNavItemActive(pathname, item);
              return (
                <Pressable
                  key={item.route}
                  accessibilityLabel={item.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    router.push(item.route as Parameters<typeof router.push>[0]);
                    setShowMore(false);
                  }}
                  style={[
                    styles.moreItem,
                     active ? [styles.moreItemActive, { backgroundColor: tokens.colors.secondary }] : undefined,
                  ]}
                >
                  <Text style={styles.navIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.moreLabel,
                       active ? styles.moreLabelActive : undefined,
                       { color: active ? tokens.colors.primary : tokens.colors.textMuted },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderTopColor: WEB_TOKENS.colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 8,
    paddingTop: 8,
    position: 'fixed' as const,
    width: '100%',
    zIndex: 20,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    minWidth: 0,
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  navItemActive: {
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.sm,
  },
  navIcon: {
    fontSize: 20,
  },
  navLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    flexShrink: 1,
    maxWidth: '100%',
  },
  navLabelActive: {
    color: WEB_TOKENS.colors.primary,
    fontWeight: '600',
  },
  moreOverlay: {
    bottom: 64,
    left: 0,
    position: 'fixed' as const,
    right: 0,
    zIndex: 20,
  },
  morePanel: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderColor: WEB_TOKENS.colors.border,
    borderRadius: WEB_TOKENS.radii.md,
    borderWidth: 1,
    marginHorizontal: WEB_TOKENS.spacing.md,
    paddingHorizontal: WEB_TOKENS.spacing.sm,
    paddingVertical: WEB_TOKENS.spacing.sm,
    gap: 2,
    ...WEB_TOKENS.shadows.card,
  },
  moreItem: {
    alignItems: 'center',
    borderRadius: WEB_TOKENS.radii.sm,
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm + 2,
  },
  moreItemActive: {
    backgroundColor: WEB_TOKENS.colors.secondary,
  },
  moreLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  moreLabelActive: {
    color: WEB_TOKENS.colors.primary,
    fontWeight: '600',
  },
});
