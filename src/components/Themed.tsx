import { View, Text, ScrollView, type ViewProps, type TextProps, type ScrollViewProps, type TextInputProps } from 'react-native';
import { useThemeColors } from '@/src/stores/theme';

export function ThemedView({ style, ...props }: ViewProps) {
  return <View style={[{ backgroundColor: 'transparent' }, style]} {...props} />;
}

export function ThemedScrollView({ style, ...props }: ScrollViewProps) {
  const colors = useThemeColors();
  return (
    <ScrollView
      style={[{ backgroundColor: colors.bgSecondary }, style]}
      {...props}
    />
  );
}

export function ThemedCard({ style, ...props }: ViewProps) {
  const colors = useThemeColors();
  return (
    <View
      style={[{ backgroundColor: colors.bgCard, borderColor: colors.border }, style]}
      {...props}
    />
  );
}

export function ThemedText({ style, colorType, ...props }: TextProps & { colorType?: 'primary' | 'secondary' | 'muted' }) {
  const colors = useThemeColors();
  const textColor = colorType === 'secondary' ? colors.textSecondary :
    colorType === 'muted' ? colors.textMuted : colors.text;
  return <Text style={[{ color: textColor }, style]} {...props} />;
}

export function ThemedHeader({ style, ...props }: ViewProps) {
  const colors = useThemeColors();
  return (
    <View
      style={[{ backgroundColor: colors.headerBg, borderColor: colors.border }, style]}
      {...props}
    />
  );
}

export function ThemedInput({ style, ...props }: TextInputProps) {
  const colors = useThemeColors();
  return {
    style: [{ backgroundColor: colors.bgInput, color: colors.text, borderColor: colors.border }, style],
    placeholderTextColor: colors.textMuted,
    ...props,
  };
}

export { useThemeColors, useIsDark } from '@/src/stores/theme';
