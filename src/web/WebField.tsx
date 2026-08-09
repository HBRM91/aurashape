import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { getWebTokens, WEB_TOKENS } from './tokens';
import { useIsDark } from '@/src/stores/theme';

export interface WebFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function WebField({
  label,
  error,
  nativeID,
  style,
  accessibilityLabel,
  onFocus,
  onBlur,
  ...props
}: WebFieldProps) {
  const tokens = getWebTokens(useIsDark());
  const [focused, setFocused] = useState(false);
  const errorId = `${nativeID ?? `web-field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}-error`;
  const handleFocus: TextInputProps['onFocus'] = (event) => {
    setFocused(true);
    onFocus?.(event);
  };
  const handleBlur: TextInputProps['onBlur'] = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: tokens.colors.text }]}>{label}</Text>
      <TextInput
        {...props}
        {...{ 'aria-invalid': Boolean(error) }}
        {...{ 'aria-describedby': error ? errorId : undefined }}
        accessibilityLabel={accessibilityLabel ?? label}
        nativeID={nativeID}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholderTextColor={props.placeholderTextColor ?? tokens.colors.textMuted}
        style={[styles.input, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border, color: tokens.colors.text }, focused ? [styles.focused, { borderColor: tokens.colors.focus }] : undefined, error ? [styles.errorInput, { borderColor: tokens.colors.error }] : undefined, style]}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" nativeID={errorId} style={[styles.error, { color: tokens.colors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: WEB_TOKENS.spacing.xs,
    width: '100%',
  },
  label: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
  } satisfies TextStyle,
  input: {
    ...WEB_TOKENS.typography.body,
    backgroundColor: WEB_TOKENS.colors.surface,
    borderColor: WEB_TOKENS.colors.border,
    borderRadius: WEB_TOKENS.radii.sm,
    borderWidth: 2,
    color: WEB_TOKENS.colors.text,
    minHeight: 48,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm,
  },
  focused: {
    borderColor: WEB_TOKENS.colors.focus,
    borderWidth: 2,
  },
  errorInput: {
    borderColor: WEB_TOKENS.colors.error,
  },
  error: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.error,
  },
});
