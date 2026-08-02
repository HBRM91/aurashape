import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { WEB_TOKENS } from './tokens';

export interface WebSectionProps extends ViewProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  contentStyle?: StyleProp<ViewStyle>;
}

export function WebSection({
  children,
  title,
  description,
  contentStyle,
  style,
  ...props
}: WebSectionProps) {
  return (
    <View {...props} style={[styles.section, style]}>
      <View style={[styles.content, contentStyle]}>
        {title ? <Text accessibilityRole="header" style={styles.title}>{title}</Text> : null}
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
  content: {
    alignSelf: 'center',
    maxWidth: WEB_TOKENS.contentWidths.desktop,
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    width: '100%',
  },
  title: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.sm,
  } satisfies TextStyle,
  description: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.textMuted,
    marginBottom: WEB_TOKENS.spacing.lg,
  } satisfies TextStyle,
});
