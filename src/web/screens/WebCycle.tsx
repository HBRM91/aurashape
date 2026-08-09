import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCycleStore } from '@/src/stores/cycle';
import type { FlowLevel, SymptomType } from '@/src/types';
import { useIsDark } from '@/src/stores/theme';
import { getWebTokens } from '../tokens';
import { WebCard } from '../WebCard';
import { WebButton } from '../WebButton';

const FLOW_OPTIONS: { value: FlowLevel; label: string }[] = [
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

const SYMPTOMS: { value: SymptomType; label: string }[] = [
  { value: 'cramps', label: 'Cramps' },
  { value: 'headache', label: 'Headache' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'bloating', label: 'Bloating' },
  { value: 'mood_swings', label: 'Mood swings' },
  { value: 'cravings', label: 'Cravings' },
];

type Tab = 'overview' | 'history' | 'settings';

export function WebCycle() {
  const tokens = getWebTokens(useIsDark());
  const { entries, currentCycleLength, currentPeriodLength, addEntry, removeEntry, setCycleLength, setPeriodLength, getPrediction } = useCycleStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [flow, setFlow] = useState<FlowLevel>('medium');
  const [symptoms, setSymptoms] = useState<SymptomType[]>([]);
  const [notes, setNotes] = useState('');
  const prediction = getPrediction();

  const saveEntry = () => {
    if (!startDate) return;
    addEntry({ startDate, endDate: endDate || undefined, cycleLength: currentCycleLength, periodLength: currentPeriodLength, flowLevel: flow, symptoms: symptoms.map((type) => ({ type, intensity: 3 })), notes: notes || undefined });
    setShowForm(false);
    setEndDate('');
    setSymptoms([]);
    setNotes('');
  };

  return (
    <ScrollView style={[styles.page, { backgroundColor: tokens.colors.page }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: tokens.colors.text }]}>Cycle Tracker</Text>
          <Text style={[styles.subtitle, { color: tokens.colors.textMuted }]}>Understand your rhythm with private, personal tracking.</Text>
        </View>
        <WebButton label="Log cycle entry" onPress={() => setShowForm(true)} />
      </View>

      <View style={[styles.tabs, { backgroundColor: tokens.colors.surfaceMuted }]}>
        {(['overview', 'history', 'settings'] as Tab[]).map((item) => (
          <TouchableOpacity key={item} accessibilityRole="tab" accessibilityState={{ selected: tab === item }} onPress={() => setTab(item)} style={[styles.tab, tab === item ? { backgroundColor: tokens.colors.surface } : undefined]}>
            <Text style={[styles.tabText, { color: tab === item ? tokens.colors.primaryStrong : tokens.colors.textMuted }]}>{item[0].toUpperCase() + item.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showForm && (
        <WebCard style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}>
          <Text style={[styles.cardTitle, { color: tokens.colors.text }]}>Log a cycle entry</Text>
          <Text style={[styles.label, { color: tokens.colors.textMuted }]}>Start date</Text>
          <TextInput accessibilityLabel="Cycle start date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor={tokens.colors.textMuted} style={[styles.input, { backgroundColor: tokens.colors.surfaceMuted, borderColor: tokens.colors.border, color: tokens.colors.text }]} />
          <Text style={[styles.label, { color: tokens.colors.textMuted }]}>End date (optional)</Text>
          <TextInput accessibilityLabel="Cycle end date" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" placeholderTextColor={tokens.colors.textMuted} style={[styles.input, { backgroundColor: tokens.colors.surfaceMuted, borderColor: tokens.colors.border, color: tokens.colors.text }]} />
          <Text style={[styles.label, { color: tokens.colors.textMuted }]}>Flow</Text>
          <View style={styles.chips}>{FLOW_OPTIONS.map((item) => <TouchableOpacity key={item.value} onPress={() => setFlow(item.value)} style={[styles.chip, { borderColor: flow === item.value ? tokens.colors.primary : tokens.colors.border, backgroundColor: flow === item.value ? tokens.colors.secondary : tokens.colors.surface }]}><Text style={[styles.chipText, { color: flow === item.value ? tokens.colors.primaryStrong : tokens.colors.textMuted }]}>{item.label}</Text></TouchableOpacity>)}</View>
          <Text style={[styles.label, { color: tokens.colors.textMuted }]}>Symptoms</Text>
          <View style={styles.chips}>{SYMPTOMS.map((item) => { const selected = symptoms.includes(item.value); return <TouchableOpacity key={item.value} onPress={() => setSymptoms((current) => selected ? current.filter((value) => value !== item.value) : [...current, item.value])} style={[styles.chip, { borderColor: selected ? tokens.colors.primary : tokens.colors.border, backgroundColor: selected ? tokens.colors.secondary : tokens.colors.surface }]}><Text style={[styles.chipText, { color: selected ? tokens.colors.primaryStrong : tokens.colors.textMuted }]}>{item.label}</Text></TouchableOpacity>; })}</View>
          <TextInput accessibilityLabel="Cycle notes" value={notes} onChangeText={setNotes} placeholder="Notes (optional)" placeholderTextColor={tokens.colors.textMuted} style={[styles.input, styles.notes, { backgroundColor: tokens.colors.surfaceMuted, borderColor: tokens.colors.border, color: tokens.colors.text }]} multiline />
          <View style={styles.actions}><WebButton label="Cancel" variant="ghost" onPress={() => setShowForm(false)} /><WebButton label="Save entry" onPress={saveEntry} /></View>
        </WebCard>
      )}

      {tab === 'overview' && <Overview prediction={prediction} entries={entries} tokens={tokens} onLog={() => setShowForm(true)} />}
      {tab === 'history' && <WebCard style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}><Text style={[styles.cardTitle, { color: tokens.colors.text }]}>History</Text>{entries.length === 0 ? <Text style={[styles.body, { color: tokens.colors.textMuted }]}>No cycle entries yet.</Text> : entries.slice().reverse().map((entry) => <View key={entry.id} style={[styles.historyRow, { borderBottomColor: tokens.colors.border }]}><View><Text style={[styles.historyTitle, { color: tokens.colors.text }]}>{entry.startDate}{entry.endDate ? ` - ${entry.endDate}` : ''}</Text><Text style={[styles.body, { color: tokens.colors.textMuted }]}>{entry.flowLevel} flow{entry.notes ? ` · ${entry.notes}` : ''}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Delete cycle entry ${entry.startDate}`} onPress={() => removeEntry(entry.id)}><Text style={{ color: tokens.colors.error }}>Delete</Text></TouchableOpacity></View>)}</WebCard>}
      {tab === 'settings' && <WebCard style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}><Text style={[styles.cardTitle, { color: tokens.colors.text }]}>Cycle settings</Text><Setting label="Cycle length" value={currentCycleLength} min={20} max={45} onChange={setCycleLength} tokens={tokens} /><Setting label="Period length" value={currentPeriodLength} min={1} max={10} onChange={setPeriodLength} tokens={tokens} /><Text style={[styles.body, { color: tokens.colors.textMuted }]}>Predictions are estimates and should not replace medical advice.</Text></WebCard>}
    </ScrollView>
  );
}

function Overview({ prediction, entries, tokens, onLog }: { prediction: ReturnType<ReturnType<typeof import('@/src/stores/cycle').useCycleStore.getState>['getPrediction']>; entries: Array<{ id: string }>; tokens: ReturnType<typeof getWebTokens>; onLog: () => void }) {
  return <View style={styles.grid}>{prediction ? <WebCard style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}><Text style={[styles.cardTitle, { color: tokens.colors.text }]}>Current phase</Text><Text style={[styles.phase, { color: tokens.colors.primary }]}>{prediction.currentPhase}</Text><Text style={[styles.body, { color: tokens.colors.textMuted }]}>Cycle day {prediction.cycleDay}</Text><View style={styles.dateGrid}><Stat label="Next period" value={prediction.nextPeriodStart} tokens={tokens} /><Stat label="Ovulation estimate" value={prediction.ovulationDate} tokens={tokens} /></View></WebCard> : <WebCard style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}><Text style={[styles.emptyTitle, { color: tokens.colors.text }]}>No cycle entries yet</Text><Text style={[styles.body, { color: tokens.colors.textMuted }]}>Log your latest cycle to unlock predictions and trends.</Text><WebButton label="Log cycle entry" onPress={onLog} /></WebCard>}<WebCard style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}><Text style={[styles.cardTitle, { color: tokens.colors.text }]}>Tracking snapshot</Text><Text style={[styles.phase, { color: tokens.colors.text }]}>{entries.length}</Text><Text style={[styles.body, { color: tokens.colors.textMuted }]}>entries saved privately on this device</Text></WebCard></View>;
}

function Setting({ label, value, min, max, onChange, tokens }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; tokens: ReturnType<typeof getWebTokens> }) {
  return <View style={styles.setting}><View><Text style={[styles.historyTitle, { color: tokens.colors.text }]}>{label}</Text><Text style={[styles.body, { color: tokens.colors.textMuted }]}>{min}-{max} days</Text></View><View style={styles.stepper}><TouchableOpacity onPress={() => onChange(value - 1)}><Text style={[styles.step, { color: tokens.colors.primary }]}>−</Text></TouchableOpacity><Text style={[styles.value, { color: tokens.colors.text }]}>{value}</Text><TouchableOpacity onPress={() => onChange(value + 1)}><Text style={[styles.step, { color: tokens.colors.primary }]}>+</Text></TouchableOpacity></View></View>;
}

function Stat({ label, value, tokens }: { label: string; value: string; tokens: ReturnType<typeof getWebTokens> }) { return <View style={[styles.stat, { backgroundColor: tokens.colors.surfaceMuted }]}><Text style={[styles.value, { color: tokens.colors.text }]}>{value}</Text><Text style={[styles.body, { color: tokens.colors.textMuted }]}>{label}</Text></View>; }

const styles = StyleSheet.create({ page: { flex: 1 }, content: { maxWidth: 1000, width: '100%', alignSelf: 'center', padding: 24, gap: 16 }, header: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 16 }, title: { fontSize: 32, fontWeight: '700' }, subtitle: { fontSize: 14, marginTop: 4 }, tabs: { borderRadius: 12, flexDirection: 'row', padding: 4 }, tab: { borderRadius: 8, flex: 1, padding: 10, alignItems: 'center' }, tabText: { fontSize: 13, fontWeight: '600' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, card: { flex: 1, minWidth: 300, padding: 24 }, cardTitle: { fontSize: 19, fontWeight: '700', marginBottom: 12 }, body: { fontSize: 14, lineHeight: 20 }, emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6 }, phase: { fontSize: 28, fontWeight: '700', marginBottom: 4, textTransform: 'capitalize' }, dateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 }, stat: { borderRadius: 10, flex: 1, minWidth: 150, padding: 12 }, value: { fontSize: 16, fontWeight: '700' }, label: { fontSize: 12, fontWeight: '600', marginBottom: 6 }, input: { borderRadius: 8, borderWidth: 1, fontSize: 15, marginBottom: 12, minHeight: 44, paddingHorizontal: 12 }, notes: { minHeight: 84, paddingTop: 12, textAlignVertical: 'top' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }, chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 }, chipText: { fontSize: 12, fontWeight: '600' }, actions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }, historyRow: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 }, historyTitle: { fontSize: 15, fontWeight: '600' }, setting: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }, stepper: { alignItems: 'center', flexDirection: 'row', gap: 14 }, step: { fontSize: 28, fontWeight: '700' },
});
