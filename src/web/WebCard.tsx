import type { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { getWebTokens, WEB_TOKENS } from './tokens';
import { useIsDark } from '@/src/stores/theme';

export interface WebCardProps extends ViewProps {
  children?: ReactNode;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function WebCard({
  children,
  elevated = true,
  accessibilityLabel,
  accessibilityRole,
  style,
  ...props
}: WebCardProps) {
  const tokens = getWebTokens(useIsDark());
  return (
    <View
      {...props}
      accessible={accessibilityLabel ? true : props.accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole ?? (accessibilityLabel ? 'summary' : undefined)}
      style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }, elevated ? WEB_TOKENS.shadows.card : undefined, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderColor: WEB_TOKENS.colors.border,
    borderRadius: WEB_TOKENS.radii.md,
    borderWidth: 1,
    padding: WEB_TOKENS.spacing.lg,
    width: '100%',
  },
});
