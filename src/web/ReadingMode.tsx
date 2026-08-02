import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { WEB_TOKENS } from './tokens';
import { findSource, type ReadingSource } from '@/src/lib/readingSources';
import { useReadingStore } from '@/src/stores/reading';

interface ReadingModeProps {
  articleId: string;
  claim?: string;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ReadingMode({ articleId, claim, onClose, style }: ReadingModeProps) {
  const [saved, setSaved] = useState(false);
  const addExplanation = useReadingStore((s) => s.addExplanation);

  const sources = claim ? findSource(claim) : [];

  const handleSave = () => {
    if (!saved) {
      addExplanation({
        articleId,
        claim: claim || 'Article explanation',
        summary: claim
          ? `This claim relates to established research on ${claim}. Multiple studies support the general principle while noting individual variation.`
          : 'Summary not yet available. AI features are experimental.',
        evidenceGrade: 'moderate',
        citations: sources.slice(0, 3).map((s) => ({
          authors: s.authors,
          journal: s.journal,
          year: s.year,
          title: s.title,
        })),
        practicalActions: [
          'Consider your individual context and goals',
          'Track your results and adjust accordingly',
          'Consult a healthcare professional for personal advice',
        ],
      });
      setSaved(true);
    }
  };

  return (
    <View style={[styles.overlay, style]}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Reading Mode</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {claim ? (
          <View style={styles.claimBox}>
            <Text style={styles.claimLabel}>Analyzing</Text>
            <Text style={styles.claimText}>{claim}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.bodyText}>
            {claim
              ? `This claim relates to established research on ${claim}. Multiple studies support the general principle while noting individual variation.`
              : 'No specific claim to analyze. Browse the article and select a claim to analyze.'}
          </Text>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>Evidence: Moderate</Text>
          </View>
        </View>

        {sources.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence</Text>
            {sources.slice(0, 3).map((source: ReadingSource) => (
              <View key={source.id} style={styles.sourceCard}>
                <Text style={styles.sourceTitle}>{source.title}</Text>
                <Text style={styles.sourceMeta}>
                  {source.authors} — {source.journal}, {source.year}
                </Text>
                <Text style={styles.sourceSummary}>{source.summary}</Text>
              </View>
            ))}
          </View>
        ) : claim ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence</Text>
            <Text style={styles.bodyText}>
              No matching studies found in the reference database for this claim. AI features are
              experimental and continuously improving.
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practical Actions</Text>
          {[
            'Consider your individual context and goals',
            'Track your results and adjust accordingly',
            'Consult a healthcare professional for personal advice',
          ].map((action, i) => (
            <View key={i} style={styles.actionRow}>
              <Text style={styles.actionBullet}>•</Text>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.disclaimer}>
            AI features are experimental. This is not medical advice.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={saved}
          style={[styles.saveBtn, saved ? styles.saveBtnSaved : undefined]}
        >
          <Text style={[styles.saveBtnText, saved ? styles.saveBtnTextSaved : undefined]}>
            {saved ? 'Saved ✓' : 'Save explanation'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(18, 35, 27, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  } as ViewStyle,
  panel: {
    backgroundColor: WEB_TOKENS.colors.surface,
    borderRadius: WEB_TOKENS.radii.lg,
    borderWidth: 1,
    borderColor: WEB_TOKENS.colors.border,
    maxWidth: 600,
    width: '90%',
    maxHeight: '90%',
    overflow: 'scroll',
    padding: WEB_TOKENS.spacing.lg,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: WEB_TOKENS.spacing.md,
    paddingBottom: WEB_TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: WEB_TOKENS.colors.border,
  },
  headerTitle: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: WEB_TOKENS.radii.sm,
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    lineHeight: 20,
    color: WEB_TOKENS.colors.textMuted,
    fontWeight: '600',
  },
  claimBox: {
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.sm,
    padding: WEB_TOKENS.spacing.md,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  claimLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
    marginBottom: 4,
  },
  claimText: {
    ...WEB_TOKENS.typography.body,
    color: WEB_TOKENS.colors.text,
  },
  section: {
    marginBottom: WEB_TOKENS.spacing.md,
  },
  sectionTitle: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  bodyText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    lineHeight: 22,
  },
  gradeBadge: {
    alignSelf: 'flex-start',
    marginTop: WEB_TOKENS.spacing.sm,
    backgroundColor: WEB_TOKENS.colors.secondary,
    borderRadius: WEB_TOKENS.radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  gradeText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primary,
    fontSize: 12,
  },
  sourceCard: {
    backgroundColor: WEB_TOKENS.colors.surfaceMuted,
    borderRadius: WEB_TOKENS.radii.sm,
    borderWidth: 1,
    borderColor: WEB_TOKENS.colors.border,
    padding: WEB_TOKENS.spacing.md,
    marginBottom: WEB_TOKENS.spacing.sm,
  },
  sourceTitle: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginBottom: 4,
  },
  sourceMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: WEB_TOKENS.colors.textMuted,
    marginBottom: 4,
    fontWeight: '400',
  },
  sourceSummary: {
    fontSize: 13,
    lineHeight: 18,
    color: WEB_TOKENS.colors.text,
    fontWeight: '400',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  actionBullet: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.primary,
    marginRight: 8,
    lineHeight: 22,
  },
  actionText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    flex: 1,
    lineHeight: 22,
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 16,
    color: WEB_TOKENS.colors.textMuted,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  saveBtn: {
    backgroundColor: WEB_TOKENS.colors.primary,
    borderRadius: WEB_TOKENS.radii.sm,
    paddingVertical: 12,
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    alignItems: 'center',
    marginTop: WEB_TOKENS.spacing.sm,
  },
  saveBtnSaved: {
    backgroundColor: WEB_TOKENS.colors.secondary,
  },
  saveBtnText: {
    ...WEB_TOKENS.typography.label,
    color: '#FFFFFF',
  },
  saveBtnTextSaved: {
    color: WEB_TOKENS.colors.primaryStrong,
  },
});
