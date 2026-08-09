import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMeditationStore } from '@/src/stores/meditation';
import type { MeditationType } from '@/src/types';
import { useIsDark } from '@/src/stores/theme';
import { getWebTokens } from '../tokens';
import { WebCard } from '../WebCard';
import { WebButton } from '../WebButton';

const TYPES: { value: MeditationType; label: string; description: string }[] = [
  { value: 'breathing', label: 'Breathing', description: 'Regulate your pace and settle in.' },
  { value: 'body_scan', label: 'Body scan', description: 'Move attention through the body.' },
  { value: 'focus', label: 'Focus', description: 'Create a quiet space for concentration.' },
  { value: 'sleep', label: 'Sleep', description: 'Wind down for restorative rest.' },
  { value: 'stress_relief', label: 'Stress relief', description: 'Release tension with a short reset.' },
];
const DURATIONS = [1, 3, 5, 10, 15, 20];

export function WebMeditation() {
  const tokens = getWebTokens(useIsDark());
  const { sessions, addSession, getWeeklyMinutes, getStreak } = useMeditationStore();
  const [selectedType, setSelectedType] = useState<MeditationType>('breathing');
  const [duration, setDuration] = useState(5);
  const [elapsed, setElapsed] = useState(0);
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const start = () => {
    if (active) return;
    setElapsed(0);
    setActive(true);
    timerRef.current = setInterval(() => {
      setElapsed((current) => {
        if (current + 1 >= duration * 60) {
          if (timerRef.current) clearInterval(timerRef.current);
          addSession({ type: selectedType, durationMinutes: duration, completedAt: new Date().toISOString(), completed: true });
          setActive(false);
          return duration * 60;
        }
        return current + 1;
      });
    }, 1000);
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    addSession({ type: selectedType, durationMinutes: Math.max(1, Math.round(elapsed / 60)), completedAt: new Date().toISOString(), completed: elapsed > 30 });
    setActive(false);
    setElapsed(0);
  };

  const selected = TYPES.find((item) => item.value === selectedType) || TYPES[0];
  const progress = elapsed / Math.max(1, duration * 60);

  return (
    <ScrollView style={[styles.page, { backgroundColor: tokens.colors.page }]} contentContainerStyle={styles.content}>
      <View style={styles.header}><View><Text style={[styles.title, { color: tokens.colors.text }]}>Mindful</Text><Text style={[styles.subtitle, { color: tokens.colors.textMuted }]}>Small pauses that help you come back to yourself.</Text></View><View style={[styles.streak, { backgroundColor: tokens.colors.secondary }]}><Text style={[styles.streakValue, { color: tokens.colors.primaryStrong }]}>{getStreak()}</Text><Text style={[styles.streakLabel, { color: tokens.colors.textMuted }]}>day streak</Text></View></View>
      <View style={styles.grid}>
        <WebCard style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}>
          <Text style={[styles.cardTitle, { color: tokens.colors.text }]}>Choose a session</Text>
          <View style={styles.options}>{TYPES.map((item) => <TouchableOpacity key={item.value} accessibilityRole="radio" accessibilityState={{ selected: selectedType === item.value }} onPress={() => setSelectedType(item.value)} style={[styles.option, { borderColor: selectedType === item.value ? tokens.colors.primary : tokens.colors.border, backgroundColor: selectedType === item.value ? tokens.colors.secondary : tokens.colors.surface }]}><Text style={[styles.optionTitle, { color: selectedType === item.value ? tokens.colors.primaryStrong : tokens.colors.text }]}>{item.label}</Text><Text style={[styles.optionDescription, { color: tokens.colors.textMuted }]}>{item.description}</Text></TouchableOpacity>)}</View>
          <Text style={[styles.cardTitle, { color: tokens.colors.text, marginTop: 20 }]}>Duration</Text>
          <View style={styles.durationRow}>{DURATIONS.map((item) => <TouchableOpacity key={item} onPress={() => setDuration(item)} style={[styles.duration, { borderColor: duration === item ? tokens.colors.primary : tokens.colors.border, backgroundColor: duration === item ? tokens.colors.secondary : tokens.colors.surface }]}><Text style={[styles.durationText, { color: duration === item ? tokens.colors.primaryStrong : tokens.colors.textMuted }]}>{item}m</Text></TouchableOpacity>)}</View>
        </WebCard>
        <WebCard style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}>
          <Text style={[styles.cardTitle, { color: tokens.colors.text }]}>Your practice</Text>
          <View style={[styles.timer, { backgroundColor: tokens.colors.surfaceMuted, borderColor: tokens.colors.border }]}><Text style={[styles.timerValue, { color: tokens.colors.text }]}>{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</Text><Text style={[styles.timerLabel, { color: tokens.colors.textMuted }]}>{selected.label}</Text><View style={[styles.track, { backgroundColor: tokens.colors.border }]}><View style={[styles.fill, { backgroundColor: tokens.colors.primary, width: `${Math.min(100, progress * 100)}%` }]} /></View></View>
          <View style={styles.actions}>{active ? <WebButton label="Finish mindful session" onPress={finish} variant="secondary" /> : <WebButton label="Start mindful session" onPress={start} />}</View>
          <View style={styles.stats}><Stat label="This week" value={`${getWeeklyMinutes()} min`} tokens={tokens} /><Stat label="Sessions" value={String(sessions.length)} tokens={tokens} /></View>
        </WebCard>
      </View>
      <WebCard style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}><Text style={[styles.cardTitle, { color: tokens.colors.text }]}>Recent sessions</Text>{sessions.length === 0 ? <Text style={[styles.body, { color: tokens.colors.textMuted }]}>No sessions yet</Text> : sessions.slice().reverse().slice(0, 8).map((session) => <View key={session.id} style={[styles.session, { borderBottomColor: tokens.colors.border }]}><Text style={[styles.sessionTitle, { color: tokens.colors.text }]}>{session.type.replace('_', ' ')}</Text><Text style={[styles.body, { color: tokens.colors.textMuted }]}>{session.durationMinutes} min · {new Date(session.completedAt).toLocaleDateString()}</Text></View>)}</WebCard>
    </ScrollView>
  );
}

function Stat({ label, value, tokens }: { label: string; value: string; tokens: ReturnType<typeof getWebTokens> }) { return <View style={[styles.stat, { backgroundColor: tokens.colors.surfaceMuted }]}><Text style={[styles.statValue, { color: tokens.colors.text }]}>{value}</Text><Text style={[styles.body, { color: tokens.colors.textMuted }]}>{label}</Text></View>; }

const styles = StyleSheet.create({ page: { flex: 1 }, content: { maxWidth: 1100, width: '100%', alignSelf: 'center', padding: 24, gap: 16 }, header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 16 }, title: { fontSize: 32, fontWeight: '700' }, subtitle: { fontSize: 14, marginTop: 4 }, streak: { alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }, streakValue: { fontSize: 20, fontWeight: '700' }, streakLabel: { fontSize: 11 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, card: { flex: 1, minWidth: 320, padding: 24 }, cardTitle: { fontSize: 19, fontWeight: '700', marginBottom: 12 }, options: { gap: 8 }, option: { borderRadius: 10, borderWidth: 1, padding: 12 }, optionTitle: { fontSize: 14, fontWeight: '700' }, optionDescription: { fontSize: 12, marginTop: 3 }, durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, duration: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 }, durationText: { fontSize: 13, fontWeight: '600' }, timer: { alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 28 }, timerValue: { fontSize: 48, fontWeight: '700', letterSpacing: 1 }, timerLabel: { fontSize: 14, marginTop: 4 }, track: { borderRadius: 4, height: 8, marginTop: 22, overflow: 'hidden', width: '100%' }, fill: { borderRadius: 4, height: '100%' }, actions: { marginTop: 16 }, stats: { flexDirection: 'row', gap: 8, marginTop: 16 }, stat: { alignItems: 'center', borderRadius: 10, flex: 1, padding: 12 }, statValue: { fontSize: 19, fontWeight: '700' }, body: { fontSize: 13, lineHeight: 19 }, session: { borderBottomWidth: 1, paddingVertical: 12 }, sessionTitle: { fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
});
