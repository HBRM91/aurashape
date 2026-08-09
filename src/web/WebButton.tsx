import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { getWebTokens, WEB_TOKENS, type WebButtonVariant } from './tokens';
import { useIsDark } from '@/src/stores/theme';

export interface WebButtonProps {
  label: string;
  accessibilityLabel?: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: WebButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function WebButton({
  label,
  accessibilityLabel,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: WebButtonProps) {
  const tokens = getWebTokens(useIsDark());
  const [focused, setFocused] = useState(false);
  const selectedStyles = {
    primary: {
      button: [styles.primaryButton, { backgroundColor: tokens.colors.primary }],
      label: [styles.primaryLabel, { color: tokens.colors.surface }],
    },
    secondary: {
      button: [styles.secondaryButton, { backgroundColor: tokens.colors.secondary, borderColor: tokens.colors.border }],
      label: [styles.secondaryLabel, { color: tokens.colors.primaryStrong }],
    },
    ghost: {
      button: styles.ghostButton,
      label: [styles.ghostLabel, { color: tokens.colors.primaryStrong }],
    },
  }[variant];
  const handleFocus: PressableProps['onFocus'] = () => setFocused(true);
  const handleBlur: PressableProps['onBlur'] = () => setFocused(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        selectedStyles.button,
        pressed && !disabled ? styles.pressed : undefined,
        focused ? [styles.focused, { borderColor: tokens.colors.focus }] : undefined,
        disabled ? styles.disabled : undefined,
        style,
      ]}
    >
      <Text style={[styles.label, selectedStyles.label, disabled ? [styles.disabledLabel, { color: tokens.colors.textMuted }] : undefined]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: WEB_TOKENS.radii.pill,
    borderColor: 'transparent',
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    paddingVertical: WEB_TOKENS.spacing.sm,
  },
  label: {
    ...WEB_TOKENS.typography.label,
    textAlign: 'center',
  },
  primaryButton: {
    ...WEB_TOKENS.shadows.button,
    backgroundColor: WEB_TOKENS.colors.primary,
  },
  primaryLabel: {
    color: WEB_TOKENS.colors.surface,
  },
  secondaryButton: {
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderColor: WEB_TOKENS.colors.border,
    borderWidth: 2,
  },
  secondaryLabel: {
    color: WEB_TOKENS.colors.primaryStrong,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostLabel: {
    color: WEB_TOKENS.colors.primaryStrong,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  focused: {
    borderColor: WEB_TOKENS.colors.focus,
    borderWidth: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledLabel: {
    color: WEB_TOKENS.colors.textMuted,
  },
});
