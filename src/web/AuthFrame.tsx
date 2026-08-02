import type { ReactNode } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { WEB_TOKENS } from './tokens';
import { AuthAside } from './AuthAside';
import { WebCard } from './WebCard';
import { WebLogo } from './WebLogo';

export interface AuthFrameProps {
  children: ReactNode;
  heading: string;
  subtitle: string;
  style?: StyleProp<ViewStyle>;
}

export function AuthFrame({ children, heading, subtitle, style }: AuthFrameProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={[styles.frame, style]}>
      <View style={styles.left}>
        <ScrollView
          contentContainerStyle={styles.formScroll}
          style={styles.formScrollView}
        >
          <View style={styles.formContainer}>
            <WebLogo compact style={styles.logo} />
            <Text style={styles.heading}>{heading}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <WebCard elevated={false} style={styles.formCard}>
              {children}
            </WebCard>
          </View>
        </ScrollView>
      </View>
      <AuthAside />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: WEB_TOKENS.colors.page,
    flex: 1,
    flexDirection: 'row',
  },
  left: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  formScroll: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: WEB_TOKENS.spacing.xl,
    paddingTop: WEB_TOKENS.spacing.xl,
  },
  formScrollView: {
    flex: 1,
  },
  formContainer: {
    maxWidth: 440,
    paddingHorizontal: WEB_TOKENS.spacing.xl,
    width: '100%',
  },
  logo: {
    alignSelf: 'center',
    marginBottom: WEB_TOKENS.spacing.xl,
  },
  heading: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.text,
    textAlign: 'center',
    marginBottom: WEB_TOKENS.spacing.xs,
  },
  subtitle: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.textMuted,
    textAlign: 'center',
    marginBottom: WEB_TOKENS.spacing.xl,
  },
  formCard: {
    maxWidth: 440,
    padding: WEB_TOKENS.spacing.xl,
  },
});
