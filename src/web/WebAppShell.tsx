import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { usePathname } from 'expo-router';
import { getWebTokens, WEB_TOKENS } from './tokens';
import { WebSidebar } from './WebSidebar';
import { WebTopBar } from './WebTopBar';
import { WebMobileNav } from './WebMobileNav';
import { getActiveNavItem } from './navItems';
import { useIsDark } from '@/src/stores/theme';

export interface WebAppShellProps {
  children: ReactNode;
  title?: string;
}

export function WebAppShell({ children, title }: WebAppShellProps) {
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const isDesktop = width >= 768;
  const tokens = getWebTokens(useIsDark());

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={[styles.shell, { backgroundColor: tokens.colors.page }]}>
      <WebSidebar />

      <View style={[styles.contentArea, isDesktop ? styles.contentAreaDesktop : styles.contentAreaMobile]}>
        <WebTopBar title={title ?? getActiveNavItem(pathname)?.label} />

        <View style={[styles.contentRegion, { backgroundColor: tokens.colors.page }]}>
          {children}
        </View>

        {!isDesktop ? <WebMobileNav /> : null}
      </View>
    </View>
  );
}

const SIDEBAR_WIDTH = 240;

const styles = StyleSheet.create({
  shell: {
    backgroundColor: WEB_TOKENS.colors.page,
    flex: 1,
    flexDirection: 'row',
    minHeight: '100vh' as unknown as number,
  },
  contentArea: {
    flex: 1,
    minWidth: 0,
    minHeight: '100vh' as unknown as number,
  },
  contentAreaDesktop: {
    marginLeft: SIDEBAR_WIDTH,
  },
  contentAreaMobile: {
    marginLeft: 0,
    paddingBottom: 64,
  },
  contentRegion: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden' as const,
  },
});
