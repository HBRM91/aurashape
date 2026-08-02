import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useFastingStore } from '@/src/stores/fasting';
import type { FastingPlan } from '@/src/types';
import { WebCard } from '../WebCard';
import { WebButton } from '../WebButton';
import { WEB_TOKENS } from '../tokens';

const PLAN_OPTIONS: { value: FastingPlan; label: string; hours: number; difficulty: string }[] = [
  { value: '14:10', label: '14:10', hours: 14, difficulty: 'Beginner' },
  { value: '16:8', label: '16:8', hours: 16, difficulty: 'Recommended' },
  { value: '18:6', label: '18:6', hours: 18, difficulty: 'Intermediate' },
  { value: '20:4', label: '20:4', hours: 20, difficulty: 'Advanced' },
  { value: '5:2', label: '5:2', hours: 16, difficulty: '5 days eat, 2 fast' },
  { value: '6:1', label: '6:1', hours: 16, difficulty: '6 days eat, 1 fast' },
  { value: 'custom', label: 'Custom', hours: 0, difficulty: 'Set your own' },
];

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function WebFasting() {
  useEffect(() => {
    try { require('@/src/lib/analytics').trackScreen('fasting'); } catch {}
  }, []);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    currentPlan,
    activeSession,
    setPlan,
    startFast,
    endFast,
    getElapsedSeconds,
    getRemainingSeconds,
    getProgress,
    history,
  } = useFastingStore();

  const [elapsed, setElapsed] = useState(activeSession ? getElapsedSeconds() : 0);
  const [remaining, setRemaining] = useState(activeSession ? getRemainingSeconds() : 0);
  const [progress, setProgress] = useState(activeSession ? getProgress() : 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => {
        const p = getProgress();
        setElapsed(getElapsedSeconds());
        setRemaining(getRemainingSeconds());
        setProgress(p);
        if (p >= 1) {
          endFast();
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  const isActive = !!activeSession;
  const planHours = PLAN_OPTIONS.find((p) => p.value === currentPlan)?.hours || 16;
  const progressPct = Math.round(progress * 100);
  const fastingColor = '#8B5CF6';

  const timerSection = (
    <View style={styles.timerColumn}>
      <WebCard>
        <Text style={styles.timerTitle}>
          {isActive ? 'Fasting In Progress' : 'Ready to Start'}
        </Text>

        <View style={styles.timerRing}>
          {isActive ? (
            <>
              <Text style={styles.elapsedTime}>{formatTime(elapsed)}</Text>
              <Text style={styles.timerLabel}>elapsed</Text>
              {remaining > 0 && (
                <Text style={[styles.timerLabel, { color: fastingColor, fontWeight: '600' }]}>
                  {formatTime(remaining)} remaining
                </Text>
              )}
              {progressPct > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                  </View>
                  <Text style={styles.progressPct}>{progressPct}%</Text>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.planHours}>{currentPlan}</Text>
              <Text style={styles.timerLabel}>{planHours} hours</Text>
              <Text style={styles.timerSub}>Not fasting</Text>
            </>
          )}
        </View>

        <View style={styles.timerBtnContainer}>
          {isActive ? (
            <WebButton label="End Fast Early" variant="secondary" onPress={endFast} />
          ) : (
            <WebButton label="Start Fasting" variant="primary" onPress={startFast} />
          )}
        </View>
      </WebCard>
    </View>
  );

  const rightSection = (
    <View style={styles.timerColumn}>
      <WebCard>
        <Text style={styles.cardHeading}>Select Plan</Text>
        <View style={styles.planGrid}>
          {PLAN_OPTIONS.map((plan) => {
            const isSelected = currentPlan === plan.value;
            return (
              <TouchableOpacity
                key={plan.value}
                onPress={() => setPlan(plan.value)}
                style={[
                  styles.planCard,
                  isSelected ? styles.planCardSelected : undefined,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select ${plan.label} plan`}
              >
                <Text style={[styles.planLabel, isSelected ? styles.planLabelSelected : undefined]}>
                  {plan.label}
                </Text>
                <Text style={styles.planDifficulty}>{plan.difficulty}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </WebCard>

      <WebCard>
        <Text style={styles.cardHeading}>History</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No fasting history yet</Text>
        ) : (
          history.slice(0, 15).map((session) => {
            const start = new Date(session.startTime);
            const end = session.endTime ? new Date(session.endTime) : null;
            const durationH = end
              ? Math.round(((end.getTime() - start.getTime()) / (1000 * 3600)) * 10) / 10
              : session.targetHours;
            return (
              <View key={session.id} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyDate}>
                    {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  <Text style={styles.historyTime}>
                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {end ? ` - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyDur}>{durationH}h</Text>
                  <Text style={[styles.historyStatus, { color: session.completed ? '#22C55E' : '#EF4444' }]}>
                    {session.completed ? 'Done' : 'Incomplete'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </WebCard>
    </View>
  );

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Fasting Tracker</Text>
      </View>
      <ScrollView style={styles.scroll}>
        <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
          {isDesktop ? (
            <>
              {timerSection}
              {rightSection}
            </>
          ) : (
            <>
              {timerSection}
              {rightSection}
            </>
          )}
        </View>
        <View style={{ height: WEB_TOKENS.spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: WEB_TOKENS.colors.page,
  },
  header: {
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    paddingTop: WEB_TOKENS.spacing.xl,
    paddingBottom: WEB_TOKENS.spacing.md,
  },
  pageTitle: {
    ...WEB_TOKENS.typography.heading,
    color: WEB_TOKENS.colors.text,
  },
  scroll: {
    flex: 1,
  },
  desktopGrid: {
    flexDirection: 'row',
    paddingHorizontal: WEB_TOKENS.spacing.lg,
    gap: WEB_TOKENS.spacing.lg,
  },
  mobileStack: {
    paddingHorizontal: WEB_TOKENS.spacing.md,
    gap: WEB_TOKENS.spacing.md,
  },
  timerColumn: {
    flex: 1,
    gap: WEB_TOKENS.spacing.md,
  },
  timerTitle: {
    ...WEB_TOKENS.typography.subheading,
    color: WEB_TOKENS.colors.text,
    textAlign: 'center',
    marginBottom: WEB_TOKENS.spacing.md,
  },
  timerRing: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: WEB_TOKENS.spacing.xl,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  elapsedTime: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    color: WEB_TOKENS.colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: 4,
  },
  timerSub: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    marginTop: 8,
  },
  planHours: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: WEB_TOKENS.spacing.sm,
    marginTop: WEB_TOKENS.spacing.md,
    width: '100%',
    maxWidth: 260,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: WEB_TOKENS.colors.secondary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  progressPct: {
    ...WEB_TOKENS.typography.label,
    color: '#8B5CF6',
    fontSize: 12,
  },
  timerBtnContainer: {
    alignItems: 'center',
  },
  cardHeading: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    marginBottom: WEB_TOKENS.spacing.md,
  },
  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WEB_TOKENS.spacing.sm,
  },
  planCard: {
    borderRadius: WEB_TOKENS.radii.md,
    borderWidth: 1,
    borderColor: WEB_TOKENS.colors.border,
    paddingHorizontal: WEB_TOKENS.spacing.md,
    paddingVertical: WEB_TOKENS.spacing.sm,
    minWidth: 90,
  },
  planCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  planLabel: {
    ...WEB_TOKENS.typography.label,
    color: WEB_TOKENS.colors.text,
    textAlign: 'center',
    fontSize: 13,
  },
  planLabelSelected: {
    color: '#7C3AED',
  },
  planDifficulty: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    textAlign: 'center',
    fontSize: 10,
    marginTop: 2,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: WEB_TOKENS.colors.surfaceMuted,
    gap: WEB_TOKENS.spacing.sm,
  },
  historyDate: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.text,
    fontWeight: '600',
  },
  historyTime: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyDur: {
    ...WEB_TOKENS.typography.label,
    color: '#8B5CF6',
  },
  historyStatus: {
    ...WEB_TOKENS.typography.caption,
    fontSize: 11,
  },
  emptyText: {
    ...WEB_TOKENS.typography.caption,
    color: WEB_TOKENS.colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: WEB_TOKENS.spacing.lg,
  },
});
