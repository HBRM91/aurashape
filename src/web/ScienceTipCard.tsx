import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WEB_TOKENS } from './tokens';
import type { Tip } from '@/src/lib/tips';

export interface ScienceTipCardProps {
  tip: Tip;
}

const CATEGORY_COLORS: Record<Tip['category'], { bg: string; text: string }> = {
  food_hack: { bg: '#ECFDF5', text: '#065F46' },
  health_hack: { bg: '#EFF6FF', text: '#1E40AF' },
  fasting_science: { bg: '#F5F3FF', text: '#5B21B6' },
};

const CATEGORY_LABELS: Record<Tip['category'], string> = {
  food_hack: 'Food Hack',
  health_hack: 'Health Hack',
  fasting_science: 'Fasting Science',
};

export function ScienceTipCard({ tip }: ScienceTipCardProps) {
  const [showScience, setShowScience] = useState(false);

  const catColors = CATEGORY_COLORS[tip.category];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.bulb}>💡</Text>
        <Text style={styles.title}>Today's Science</Text>
        <View style={[styles.badge, { backgroundColor: catColors.bg }]}>
          <Text style={[styles.badgeText, { color: catColors.text }]}>
            {CATEGORY_LABELS[tip.category]}
          </Text>
        </View>
      </View>

      <Text style={styles.heading}>{tip.title}</Text>
      <Text style={styles.body}>{tip.body}</Text>
      <Text style={styles.source}>Source: {tip.source}</Text>

      {tip.study ? (
        <View style={styles.studySection}>
          <View
            accessible
            accessibilityRole="button"
            accessibilityLabel={showScience ? 'Hide the science' : 'Show the science'}
            style={styles.studyToggle}
          >
            <Text style={styles.flask}>🧪</Text>
            <Text
              style={styles.studyToggleText}
              onPress={() => setShowScience(!showScience)}
            >
              {showScience ? 'Hide' : 'Show'} The Science
            </Text>
          </View>

          {showScience ? (
            <View style={styles.studyCard}>
              <Text style={styles.studyTitle}>{tip.study.title}</Text>
              <Text style={styles.studyMeta}>
                {tip.study.authors} — {tip.study.journal}, {tip.study.year}
              </Text>
              <Text style={styles.studySummary}>{tip.study.summary}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRadius: WEB_TOKENS.radii.md,
    borderColor: WEB_TOKENS.colors.border,
    borderWidth: 1,
    padding: WEB_TOKENS.spacing.lg,
    ...WEB_TOKENS.shadows.card,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  bulb: {
    fontSize: 20,
  },
  title: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    flex: 1,
  },
  badge: {
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: WEB_TOKENS.spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  heading: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginBottom: 4,
  },
  body: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    lineHeight: 20,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  source: {
    color: WEB_TOKENS.colors.textMuted,
    fontStyle: 'italic',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  studySection: {
    marginTop: WEB_TOKENS.spacing.xs,
  },
  studyToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: WEB_TOKENS.spacing.sm,
    paddingVertical: WEB_TOKENS.spacing.sm,
  },
  flask: {
    fontSize: 16,
  },
  studyToggleText: {
    ...WEB_TOKENS.typography.label,
    color: '#B45309',
    fontSize: 12,
  },
  studyCard: {
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    marginTop: WEB_TOKENS.spacing.sm,
    padding: WEB_TOKENS.spacing.md,
  },
  studyTitle: {
    ...WEB_TOKENS.typography.label,
    color: '#92400E',
    fontSize: 12,
    marginBottom: 4,
  },
  studyMeta: {
    color: '#A16207',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  studySummary: {
    color: '#78350F',
    fontSize: 12,
    lineHeight: 18,
  },
});
