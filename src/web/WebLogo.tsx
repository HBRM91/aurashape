import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { WEB_TOKENS } from './tokens';

export interface WebLogoProps {
  compact?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function WebLogo({ compact = false, children, style }: WebLogoProps) {
  return (
    <View accessible={true} accessibilityLabel="Aurashape" accessibilityRole="image" style={[styles.logo, style]}>
      <View style={styles.mark}>
        <Text style={styles.markText}>A</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>Aurashape</Text>
        {!compact ? <Text style={styles.tagline}>Shape your everyday health</Text> : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
  },
  mark: {
    alignItems: 'center',
    backgroundColor: WEB_TOKENS.colors.primary,
    borderRadius: WEB_TOKENS.radii.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  markText: {
    color: WEB_TOKENS.colors.surface,
    fontSize: 20,
    fontWeight: '700',
  },
  copy: {
    gap: 1,
  },
  name: {
    color: WEB_TOKENS.colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  tagline: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
  },
});
