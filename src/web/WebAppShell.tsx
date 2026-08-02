import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { WEB_TOKENS } from './tokens';
import { WebSidebar } from './WebSidebar';
import { WebTopBar } from './WebTopBar';
import { WebMobileNav } from './WebMobileNav';

export interface WebAppShellProps {
  children: ReactNode;
  title?: string;
}

export function WebAppShell({ children, title }: WebAppShellProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.shell}>
      <WebSidebar />

      <View style={[styles.contentArea, isDesktop ? styles.contentAreaDesktop : styles.contentAreaMobile]}>
        <WebTopBar title={title} />

        <ScrollView
          contentContainerStyle={styles.contentPadding}
          style={styles.contentScroll}
        >
          {children}
        </ScrollView>

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
  },
  contentArea: {
    flex: 1,
    minWidth: 0,
  },
  contentAreaDesktop: {
    marginLeft: SIDEBAR_WIDTH,
  },
  contentAreaMobile: {
    marginLeft: 0,
    paddingBottom: 64,
  },
  contentScroll: {
    flex: 1,
  },
  contentPadding: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: WEB_TOKENS.contentWidths.desktop,
    padding: WEB_TOKENS.spacing.lg,
    paddingTop: WEB_TOKENS.spacing.lg,
    width: '100%',
  },
});
