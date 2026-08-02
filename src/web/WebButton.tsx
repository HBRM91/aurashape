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
import { WEB_TOKENS, type WebButtonVariant } from './tokens';

export interface WebButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: WebButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function WebButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: WebButtonProps) {
  const [focused, setFocused] = useState(false);
  const selectedStyles = {
    primary: {
      button: styles.primaryButton,
      label: styles.primaryLabel,
    },
    secondary: {
      button: styles.secondaryButton,
      label: styles.secondaryLabel,
    },
    ghost: {
      button: styles.ghostButton,
      label: styles.ghostLabel,
    },
  }[variant];
  const handleFocus: PressableProps['onFocus'] = () => setFocused(true);
  const handleBlur: PressableProps['onBlur'] = () => setFocused(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        selectedStyles.button,
        pressed && !disabled ? styles.pressed : undefined,
        focused ? styles.focused : undefined,
        disabled ? styles.disabled : undefined,
        style,
      ]}
    >
      <Text style={[styles.label, selectedStyles.label, disabled ? styles.disabledLabel : undefined]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: WEB_TOKENS.radii.pill,
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
    borderWidth: 1,
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
