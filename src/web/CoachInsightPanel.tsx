import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WEB_TOKENS } from './tokens';
import { WebButton } from './WebButton';

export interface CoachInsight {
  id: string;
  category: 'nutrition' | 'fasting' | 'workout' | 'recovery' | 'hydration';
  recommendation: string;
  reason: string;
  action: string;
  createdAt: string;
  applied: boolean;
}

interface CoachInsightPanelProps {
  recommendation: CoachInsight;
  onApply: (id: string) => void;
  onDismiss: (id: string) => void;
}

const CATEGORY_ICONS: Record<CoachInsight['category'], string> = {
  nutrition: '🥗',
  fasting: '⏱️',
  workout: '🏋️',
  recovery: '😴',
  hydration: '💧',
};

export function CoachInsightPanel({ recommendation, onApply, onDismiss }: CoachInsightPanelProps) {
  const [showReason, setShowReason] = useState(false);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.icon}>{CATEGORY_ICONS[recommendation.category]}</Text>
        <Text style={styles.title}>Coach Insight</Text>
      </View>
      <Text style={styles.recommendation}>{recommendation.recommendation}</Text>
      <TouchableOpacity
        accessibilityLabel="Why this?"
        accessibilityRole="button"
        onPress={() => setShowReason((visible) => !visible)}
        style={styles.whyButton}
      >
        <Text style={styles.whyText}>{showReason ? 'Hide why' : 'Why this?'}</Text>
      </TouchableOpacity>
      {showReason && <Text style={styles.reason}>{recommendation.reason}</Text>}
      <Text style={styles.action}>{recommendation.action}</Text>
      <View style={styles.actions}>
        <WebButton
          accessibilityLabel="Apply recommendation"
          label="Apply"
          onPress={() => onApply(recommendation.id)}
          variant="primary"
        />
        <WebButton
          accessibilityLabel="Dismiss recommendation"
          label="Dismiss"
          onPress={() => onDismiss(recommendation.id)}
          variant="ghost"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderColor: WEB_TOKENS.colors.border,
    borderRadius: WEB_TOKENS.radii.md,
    borderWidth: 1,
    marginBottom: WEB_TOKENS.spacing.md,
    padding: WEB_TOKENS.spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
  },
  recommendation: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.text,
  },
  whyButton: {
    alignSelf: 'flex-start',
    marginTop: WEB_TOKENS.spacing.sm,
  },
  whyText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
  },
  reason: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: WEB_TOKENS.spacing.xs,
  },
  action: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primaryStrong,
    marginTop: WEB_TOKENS.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    marginTop: WEB_TOKENS.spacing.md,
  },
});
