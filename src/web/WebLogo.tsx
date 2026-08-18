import type { ReactNode } from 'react';
import {
  Image,
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

// The actual Aurashape mark (aura/glow icon) — same asset used for the app
// icon and favicon, so the brand is consistent between the browser tab, the
// home-screen icon, and the in-app UI instead of a generic letter tile.
const LOGO_MARK = require('../../assets/images/icon.svg');

export function WebLogo({ compact = false, children, style }: WebLogoProps) {
  return (
    <View accessible={true} accessibilityLabel="Aurashape" accessibilityRole="image" style={[styles.logo, style]}>
      <Image source={LOGO_MARK} style={styles.mark} accessibilityIgnoresInvertColors />
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
    borderRadius: WEB_TOKENS.radii.sm,
    height: 36,
    width: 36,
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
