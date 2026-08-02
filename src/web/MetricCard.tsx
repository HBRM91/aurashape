import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { WEB_TOKENS } from './tokens';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: string;
  accentColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function MetricCard({ label, value, subtext, icon, accentColor, style }: MetricCardProps) {
  return (
    <View style={[styles.card, style]}>
      {icon ? (
        <View style={styles.iconRow}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={[styles.value, accentColor ? { color: accentColor } : undefined]}>
            {value}
          </Text>
        </View>
      ) : (
        <Text style={[styles.value, accentColor ? { color: accentColor } : undefined]}>
          {value}
        </Text>
      )}
      <Text style={styles.label}>{label}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRadius: WEB_TOKENS.radii.md,
    borderColor: WEB_TOKENS.colors.border,
    borderWidth: 1,
    flex: 1,
    minWidth: 160,
    padding: WEB_TOKENS.spacing.lg,
    ...WEB_TOKENS.shadows.card,
  },
  iconRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.xs,
  },
  icon: {
    fontSize: 22,
  },
  value: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
  },
  label: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: 2,
  },
  subtext: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});
