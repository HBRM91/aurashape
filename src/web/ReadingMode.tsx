import { useEffect, useState } from 'react';
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
import { analyzeReading } from '@/src/lib/aiClient';
import type { ReadingSummary } from '@/src/lib/aiTypes';

interface ReadingModeProps {
  articleId: string;
  claim?: string;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ReadingMode({ articleId, claim, onClose, style }: ReadingModeProps) {
  const [saved, setSaved] = useState(false);
  const [summary, setSummary] = useState<ReadingSummary>(() => createFallbackSummary(claim));
  const [loading, setLoading] = useState(Boolean(claim));
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const addExplanation = useReadingStore((s) => s.addExplanation);

  const sources = claim ? findSource(claim) : [];

  useEffect(() => {
    if (!claim) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(false);
    void analyzeReading({ articleId, claim })
      .then((result) => {
        if (active) setSummary(result);
      })
      .catch(() => {
        if (active) {
          setSummary(createFallbackSummary(claim));
          setError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [articleId, claim, retryCount]);

  const handleSave = () => {
    if (!saved && !loading) {
      addExplanation({
        articleId,
        claim: claim || 'Article explanation',
        summary: summary.summary,
        evidenceGrade: summary.evidenceGrade,
        citations: summary.citations,
        practicalActions: summary.practicalActions,
      });
      setSaved(true);
    }
  };

  const gradeLabel = summary.evidenceGrade.charAt(0).toUpperCase() + summary.evidenceGrade.slice(1);

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

         {error && (
           <View style={styles.errorBox}>
             <Text style={styles.errorText}>AI explanation unavailable.</Text>
             <TouchableOpacity
               accessibilityLabel="Retry explanation"
               accessibilityRole="button"
               onPress={() => setRetryCount((count) => count + 1)}
               style={styles.retryBtn}
             >
               <Text style={styles.retryText}>Retry explanation</Text>
             </TouchableOpacity>
           </View>
         )}

         {loading ? (
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Analyzing evidence...</Text>
             <Text style={styles.bodyText}>Checking the claim against the available evidence.</Text>
           </View>
         ) : (
           <>
             <View style={styles.section}>
               <Text style={styles.sectionTitle}>Summary</Text>
               <Text style={styles.bodyText}>{summary.summary}</Text>
               <View style={styles.gradeBadge}>
                 <Text style={styles.gradeText}>Evidence: {gradeLabel}</Text>
               </View>
             </View>

             <View style={styles.section}>
               <Text style={styles.sectionTitle}>Claims and citations</Text>
               {summary.claims.length > 0 ? summary.claims.map((item, index) => (
                 <View key={`${item.text}-${index}`} style={styles.sourceCard}>
                   <Text style={styles.sourceTitle}>{item.text}</Text>
                   <Text style={styles.sourceMeta}>
                     Evidence: {item.evidenceGrade}
                   </Text>
                   {item.citations.map((citation, citationIndex) => (
                     <Text key={`${citation.title}-${citationIndex}`} style={styles.sourceSummary}>
                       {citation.title} — {citation.authors}, {citation.journal} ({citation.year})
                     </Text>
                   ))}
                 </View>
               )) : sources.slice(0, 3).map((source: ReadingSource) => (
                 <View key={source.id} style={styles.sourceCard}>
                   <Text style={styles.sourceTitle}>{source.title}</Text>
                   <Text style={styles.sourceMeta}>
                     {source.authors} — {source.journal}, {source.year}
                   </Text>
                   <Text style={styles.sourceSummary}>{source.summary}</Text>
                 </View>
               ))}
               {summary.claims.length === 0 && sources.length === 0 && (
                 <Text style={styles.bodyText}>No matching studies found in the local reference database.</Text>
               )}
             </View>

             <View style={styles.section}>
               <Text style={styles.sectionTitle}>Practical Actions</Text>
               {summary.practicalActions.map((action, index) => (
                 <View key={`${action}-${index}`} style={styles.actionRow}>
                   <Text style={styles.actionBullet}>•</Text>
                   <Text style={styles.actionText}>{action}</Text>
                 </View>
               ))}
             </View>
           </>
         )}

        <View style={styles.section}>
          <Text style={styles.disclaimer}>
            AI features are experimental. This is not medical advice.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          accessibilityLabel={saved ? 'Explanation saved' : 'Save explanation'}
          accessibilityRole="button"
          disabled={saved || loading}
          style={[styles.saveBtn, saved || loading ? styles.saveBtnSaved : undefined]}
        >
          <Text style={[styles.saveBtnText, saved ? styles.saveBtnTextSaved : undefined]}>
            {saved ? 'Saved ✓' : 'Save explanation'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createFallbackSummary(claim?: string): ReadingSummary {
  const sources = claim ? findSource(claim) : [];
  const citations = sources.slice(0, 3).map((source) => ({
    authors: source.authors,
    journal: source.journal,
    year: source.year,
    title: source.title,
  }));

  return {
    title: claim || 'Article explanation',
    summary: claim
      ? `This claim relates to available research on ${claim}. The local fallback is informational and may not reflect the full evidence.`
      : 'No specific claim to analyze. Browse the article and select a claim to analyze.',
    claims: [],
    evidenceGrade: sources.length > 0 ? 'moderate' : 'weak',
    citations,
    practicalActions: [
      'Consider your individual context and goals.',
      'Track your results and adjust gradually.',
    ],
    limitations: ['AI analysis is unavailable; this is a local reference fallback.'],
    disclaimer: 'This is not medical advice.',
  };
}

const styles = StyleSheet.create({
  overlay: {
    // 'fixed' and 'inset' are web-only CSS values react-native-web supports
    // at runtime but React Native's own ViewStyle type doesn't model.
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(18, 35, 27, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  } as unknown as ViewStyle,
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
  errorBox: {
    backgroundColor: WEB_TOKENS.colors.errorSurface,
    borderColor: WEB_TOKENS.colors.errorBorder,
    borderRadius: WEB_TOKENS.radii.sm,
    borderWidth: 1,
    marginBottom: WEB_TOKENS.spacing.md,
    padding: WEB_TOKENS.spacing.md,
  },
  errorText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.error,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    marginTop: WEB_TOKENS.spacing.sm,
  },
  retryText: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.primaryStrong,
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
