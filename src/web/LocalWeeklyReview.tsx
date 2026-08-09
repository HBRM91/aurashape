import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getWeeklyRecommendation, type LocalCoachContext } from '@/src/lib/localCoach';
import { WEB_TOKENS } from './tokens';

interface LocalWeeklyReviewProps {
  contexts: LocalCoachContext[];
  onDelete: () => void;
}

export function LocalWeeklyReview({ contexts, onDelete }: LocalWeeklyReviewProps) {
  const recommendation = getWeeklyRecommendation(contexts);
  const loggedDays = Math.max(...contexts.map((context) => context.diaryDaysLogged), 0);
  const workouts = contexts.reduce((sum, context) => sum + context.workoutsCompleted, 0);
  const fasting = contexts.reduce((sum, context) => sum + context.fastingSessionsCompleted, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weekly review</Text>
          <Text style={styles.provenance}>Computed on this device</Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Delete weekly review" onPress={onDelete}>
          <Text style={styles.delete}>Delete</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.stats}>
        <Text style={styles.stat}>Logged {loggedDays}/7 days</Text>
        <Text style={styles.stat}>{workouts} workouts</Text>
        <Text style={styles.stat}>{fasting} fasts</Text>
      </View>
      {recommendation ? (
        <View style={styles.nextAction}>
          <Text style={styles.kicker}>NEXT WEEK</Text>
          <Text style={styles.actionTitle}>{recommendation.title}</Text>
          <Text style={styles.action}>{recommendation.action}</Text>
          <Text style={styles.reason}>{recommendation.reason}</Text>
        </View>
      ) : (
        <Text style={styles.empty}>Keep logging locally to unlock a useful next-week experiment.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: WEB_TOKENS.colors.surface, borderColor: WEB_TOKENS.colors.border, borderRadius: WEB_TOKENS.radii.md, borderWidth: 1, marginBottom: WEB_TOKENS.spacing.md, padding: WEB_TOKENS.spacing.md },
  header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  title: { ...WEB_TOKENS.typography.subheading, color: WEB_TOKENS.colors.text },
  provenance: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.primaryStrong, fontSize: 12, marginTop: 2 },
  delete: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.error },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: WEB_TOKENS.spacing.sm, marginTop: WEB_TOKENS.spacing.md },
  stat: { ...WEB_TOKENS.typography.caption, backgroundColor: WEB_TOKENS.colors.surfaceMuted, borderRadius: WEB_TOKENS.radii.pill, color: WEB_TOKENS.colors.textMuted, paddingHorizontal: WEB_TOKENS.spacing.sm, paddingVertical: 4 },
  nextAction: { backgroundColor: WEB_TOKENS.colors.secondary, borderRadius: WEB_TOKENS.radii.sm, marginTop: WEB_TOKENS.spacing.md, padding: WEB_TOKENS.spacing.md },
  kicker: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.primaryStrong, fontSize: 12 },
  actionTitle: { ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.text, marginTop: WEB_TOKENS.spacing.xs },
  action: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.text, marginTop: 2 },
  reason: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, fontSize: 12, marginTop: WEB_TOKENS.spacing.xs },
  empty: { ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginTop: WEB_TOKENS.spacing.md },
});
