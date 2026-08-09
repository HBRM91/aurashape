import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { LocalRecommendation } from '@/src/lib/localCoach';
import { WEB_TOKENS } from './tokens';

interface LocalCoachCardProps {
  recommendation: LocalRecommendation;
  onDismiss: (id: string) => void;
  onSnooze: (id: string) => void;
}

export function LocalCoachCard({ recommendation, onDismiss, onSnooze }: LocalCoachCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.kicker}>LOCAL COACH</Text>
        <Text style={styles.badge}>On-device</Text>
      </View>
      <Text style={styles.title}>{recommendation.title}</Text>
      <Text style={styles.action}>{recommendation.action}</Text>
      <Text style={styles.reason}>{recommendation.reason}</Text>
      <Text style={styles.provenance}>Computed on this device · {recommendation.confidence} confidence</Text>
      <View style={styles.actions}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Snooze coaching suggestion" onPress={() => onSnooze(recommendation.id)} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Later</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Dismiss coaching suggestion" onPress={() => onDismiss(recommendation.id)} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: WEB_TOKENS.colors.secondary, borderColor: WEB_TOKENS.colors.border, borderRadius: WEB_TOKENS.radii.md, borderWidth: 1, marginBottom: WEB_TOKENS.spacing.md, padding: WEB_TOKENS.spacing.md },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  kicker: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.primaryStrong, letterSpacing: 0.5 },
  badge: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.primary, fontSize: 12 },
  title: { ...WEB_TOKENS.typography.subheading, color: WEB_TOKENS.colors.text, marginTop: WEB_TOKENS.spacing.sm },
  action: { ...WEB_TOKENS.typography.body, color: WEB_TOKENS.colors.text, marginTop: WEB_TOKENS.spacing.xs },
  reason: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginTop: WEB_TOKENS.spacing.sm },
  provenance: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.primaryStrong, fontSize: 12, marginTop: WEB_TOKENS.spacing.sm },
  actions: { flexDirection: 'row', gap: WEB_TOKENS.spacing.sm, marginTop: WEB_TOKENS.spacing.md },
  secondaryButton: { borderColor: WEB_TOKENS.colors.border, borderRadius: WEB_TOKENS.radii.pill, borderWidth: 1, paddingHorizontal: WEB_TOKENS.spacing.md, paddingVertical: WEB_TOKENS.spacing.xs },
  secondaryText: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.primaryStrong },
});
