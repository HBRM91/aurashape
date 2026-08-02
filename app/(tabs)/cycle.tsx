import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useCycleStore } from '@/src/stores/cycle';
import { useThemeColors } from '@/src/stores/theme';
import { useEffect, useState } from 'react';
import { trackScreen } from '@/src/lib/analytics';
import type { SymptomType, FlowLevel } from '@/src/types';
import { Drop, Calendar, Warning, Trash } from 'phosphor-react-native';

const SYMPTOM_OPTIONS: { value: SymptomType; label: string; emoji: string }[] = [
  { value: 'cramps', label: 'Cramps', emoji: '😖' },
  { value: 'headache', label: 'Headache', emoji: '🤕' },
  { value: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { value: 'bloating', label: 'Bloating', emoji: '🤰' },
  { value: 'mood_swings', label: 'Mood Swings', emoji: '😤' },
  { value: 'acne', label: 'Acne', emoji: '💢' },
  { value: 'tender_breasts', label: 'Tender Breasts', emoji: '💔' },
  { value: 'back_pain', label: 'Back Pain', emoji: '🥴' },
  { value: 'nausea', label: 'Nausea', emoji: '🤢' },
  { value: 'insomnia', label: 'Insomnia', emoji: '🥱' },
  { value: 'cravings', label: 'Cravings', emoji: '🍫' },
];

const FLOW_OPTIONS: { value: FlowLevel; label: string; color: string }[] = [
  { value: 'spotting', label: 'Spotting', color: '#FCD34D' },
  { value: 'light', label: 'Light', color: '#F472B6' },
  { value: 'medium', label: 'Medium', color: '#EC4899' },
  { value: 'heavy', label: 'Heavy', color: '#BE185D' },
];

const PHASE_INFO: Record<string, { label: string; color: string; emoji: string }> = {
  menstrual: { label: 'Menstrual Phase', color: '#EC4899', emoji: '🩸' },
  follicular: { label: 'Follicular Phase', color: '#8B5CF6', emoji: '🌱' },
  ovulation: { label: 'Ovulation', color: '#06B6D4', emoji: '✨' },
  luteal: { label: 'Luteal Phase', color: '#F59E0B', emoji: '🌙' },
};

export default function CycleScreen() {
  useEffect(() => { trackScreen('cycle'); }, []);
  const colors = useThemeColors();
  const {
    entries,
    currentCycleLength,
    currentPeriodLength,
    addEntry,
    removeEntry,
    setCycleLength,
    setPeriodLength,
    getPrediction,
  } = useCycleStore();

  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEndDate, setNewEndDate] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<FlowLevel>('medium');
  const [notes, setNotes] = useState('');

  const prediction = getPrediction();

  const [tab, setTab] = useState<'overview' | 'history' | 'settings'>('overview');

  const handleAddEntry = () => {
    if (!newStartDate) return;
    addEntry({
      startDate: newStartDate,
      endDate: newEndDate || undefined,
      cycleLength: currentCycleLength,
      periodLength: currentPeriodLength,
      symptoms: selectedSymptoms.map((s) => ({ type: s, intensity: 3 })),
      flowLevel: selectedFlow,
      notes: notes || undefined,
    });
    setShowAddEntry(false);
    setNewStartDate(new Date().toISOString().slice(0, 10));
    setNewEndDate('');
    setSelectedSymptoms([]);
    setSelectedFlow('medium');
    setNotes('');
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this cycle entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeEntry(id) },
    ]);
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="items-center pt-8 pb-4">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Cycle Tracker
        </Text>
        <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>Track & predict your cycle</Text>
      </View>

      <View className="flex-row mx-4 mb-4 rounded-xl p-1" style={{ backgroundColor: colors.bgInput }}>
        {(['overview', 'history', 'settings'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg items-center ${tab === t ? 'shadow-sm' : ''}`}
            style={tab === t ? { backgroundColor: colors.bgCard } : undefined}
          >
            <Text
              className={`text-sm font-semibold capitalize ${tab === t ? 'text-green-600' : ''}`}
              style={tab !== t ? { color: colors.textSecondary } : undefined}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'overview' && (
        <View className="px-4">
          {prediction ? (
            <View>
              <View
                className="rounded-2xl p-5 mb-4"
                style={{ backgroundColor: '#FFF1F2' }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Drop size={20} color="#EC4899" weight="fill" />
                    <Text className="text-lg font-bold ml-2" style={{ color: '#BE185D' }}>
                      Current Phase
                    </Text>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: (PHASE_INFO[prediction.currentPhase]?.color || '#8B5CF6') + '20' }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: PHASE_INFO[prediction.currentPhase]?.color }}>
                      Day {prediction.cycleDay}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  {Object.entries(PHASE_INFO).map(([phase, info]) => (
                    <View key={phase} className="items-center">
                      <Text className="text-lg">{info.emoji}</Text>
                      <View
                        className={`w-3 h-3 rounded-full mt-1 ${phase === prediction.currentPhase ? 'border-2' : ''}`}
                        style={{
                          backgroundColor: info.color,
                          borderColor: phase === prediction.currentPhase ? '#000' : 'transparent',
                        }}
                      />
                      <Text className="text-[10px] text-center mt-1" style={{ color: info.color }}>
                        {phase === 'menstrual' ? 'Period' : phase.charAt(0).toUpperCase() + phase.slice(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="flex-row mb-4 space-x-3">
                <View className="flex-1 bg-green-50 rounded-xl p-4">
                  <View className="flex-row items-center mb-1">
                    <Calendar size={16} color="#22C55E" weight="fill" />
                    <Text className="text-xs text-green-700 ml-1 font-semibold">Next Period</Text>
                  </View>
                  <Text className="text-lg font-bold text-green-800">{prediction.nextPeriodStart}</Text>
                  <Text className="text-xs text-green-600 mt-1">{prediction.nextPeriodEnd}</Text>
                </View>

                <View className="flex-1 bg-blue-50 rounded-xl p-4">
                  <View className="flex-row items-center mb-1">
                    <Warning size={16} color="#3B82F6" weight="fill" />
                    <Text className="text-xs text-blue-700 ml-1 font-semibold">Ovulation</Text>
                  </View>
                  <Text className="text-lg font-bold text-blue-800">{prediction.ovulationDate}</Text>
                  <Text className="text-xs text-blue-600 mt-1">
                    {prediction.fertileWindow.start} - {prediction.fertileWindow.end}
                  </Text>
                </View>
              </View>

              <View className="rounded-xl p-4 mb-4" style={{ backgroundColor: colors.bgCard }}>
                <Text className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>Cycle Summary</Text>
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>Cycle Length</Text>
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>{currentCycleLength}d</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>Period Length</Text>
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>{currentPeriodLength}d</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-xs" style={{ color: colors.textSecondary }}>Entries</Text>
                    <Text className="text-lg font-bold" style={{ color: colors.text }}>{entries.length}</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View className="items-center justify-center py-16">
              <Drop size={64} color={colors.textMuted} weight="fill" />
              <Text className="text-lg font-semibold mt-4" style={{ color: colors.textMuted }}>No cycle data yet</Text>
              <Text className="text-sm mt-2 text-center" style={{ color: colors.textMuted }}>
                Log your first period to get predictions{'\n'}and symptom tracking.
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddEntry(true)}
                className="mt-6 bg-green-500 px-8 py-3 rounded-xl"
              >
                <Text className="text-white font-bold">Log First Period</Text>
              </TouchableOpacity>
            </View>
          )}

          {prediction && (
            <TouchableOpacity
              onPress={() => setShowAddEntry(true)}
              className="bg-green-500 py-3 rounded-xl items-center mb-8"
            >
              <Text className="text-white font-bold">+ Log Period</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {tab === 'history' && (
        <View className="px-4 mb-8">
          {entries.length === 0 ? (
            <View className="items-center py-16">
              <Calendar size={48} color={colors.textMuted} weight="fill" />
              <Text className="mt-4" style={{ color: colors.textMuted }}>No history yet</Text>
            </View>
          ) : (
            [...entries]
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
              .map((entry) => (
                <View key={entry.id} className="rounded-xl p-4 mb-3" style={{ backgroundColor: colors.bgCard }}>
                  <View className="flex-row justify-between items-start">
                    <View>
                      <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                        {entry.startDate}
                        {entry.endDate ? ` - ${entry.endDate}` : ''}
                      </Text>
                      <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
                        {entry.periodLength} days | {entry.flowLevel}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteEntry(entry.id)}
                      className="p-2"
                    >
                      <Trash size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  {entry.symptoms.length > 0 && (
                    <View className="flex-row flex-wrap gap-1 mt-2">
                      {entry.symptoms.map((s, i) => (
                        <View key={i} className="px-2 py-1 rounded-full" style={{ backgroundColor: colors.bg }}>
                          <Text className="text-xs" style={{ color: colors.textSecondary }}>
                            {SYMPTOM_OPTIONS.find((o) => o.value === s.type)?.emoji}{' '}
                            {s.type.replace('_', ' ')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {entry.notes && (
                    <Text className="text-xs mt-2 italic" style={{ color: colors.textMuted }}>"{entry.notes}"</Text>
                  )}
                </View>
              ))
          )}
        </View>
      )}

      {tab === 'settings' && (
        <View className="px-4 mb-8">
          <View className="rounded-xl p-5 mb-4" style={{ backgroundColor: colors.bgCard }}>
            <Text className="text-sm font-semibold mb-4" style={{ color: colors.textSecondary }}>Cycle Configuration</Text>

            <View className="mb-4">
              <Text className="text-xs mb-2" style={{ color: colors.textSecondary }}>Cycle Length: {currentCycleLength} days</Text>
              <View className="flex-row gap-2">
                {[21, 28, 30, 35, 40].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setCycleLength(d)}
                    className={`px-3 py-2 rounded-lg ${currentCycleLength === d ? 'bg-green-500' : ''}`}
                    style={currentCycleLength !== d ? { backgroundColor: colors.border } : undefined}
                  >
                    <Text
                      className={`text-sm font-semibold ${currentCycleLength === d ? 'text-white' : ''}`}
                      style={currentCycleLength !== d ? { color: colors.textSecondary } : undefined}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-xs mb-2" style={{ color: colors.textSecondary }}>Period Length: {currentPeriodLength} days</Text>
              <View className="flex-row gap-2">
                {[3, 4, 5, 6, 7].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setPeriodLength(d)}
                    className={`px-3 py-2 rounded-lg ${currentPeriodLength === d ? 'bg-green-500' : ''}`}
                    style={currentPeriodLength !== d ? { backgroundColor: colors.border } : undefined}
                  >
                    <Text
                      className={`text-sm font-semibold ${currentPeriodLength === d ? 'text-white' : ''}`}
                      style={currentPeriodLength !== d ? { color: colors.textSecondary } : undefined}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}

      {showAddEntry && (
        <View className="mx-4 rounded-xl p-5 mb-4" style={{ backgroundColor: colors.bgCard }}>
          <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>Log Period</Text>

          <View className="mb-4">
            <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>Start Date</Text>
            <TextInput
              value={newStartDate}
              onChangeText={setNewStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              className="rounded-lg px-4 py-3"
              style={{ backgroundColor: colors.bgInput, color: colors.text }}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>End Date (optional)</Text>
            <TextInput
              value={newEndDate}
              onChangeText={setNewEndDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              className="rounded-lg px-4 py-3"
              style={{ backgroundColor: colors.bgInput, color: colors.text }}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>Flow Level</Text>
            <View className="flex-row gap-2">
              {FLOW_OPTIONS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => setSelectedFlow(f.value)}
                  className={`px-3 py-2 rounded-lg ${selectedFlow === f.value ? 'border-2' : ''}`}
                  style={{
                    borderColor: selectedFlow === f.value ? f.color : 'transparent',
                    backgroundColor: selectedFlow === f.value ? f.color + '20' : colors.bg,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: selectedFlow === f.value ? f.color : colors.textMuted }}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm mb-2" style={{ color: colors.textSecondary }}>Symptoms</Text>
            <View className="flex-row flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => {
                    setSelectedSymptoms((prev) =>
                      prev.includes(s.value)
                        ? prev.filter((x) => x !== s.value)
                        : [...prev, s.value]
                    );
                  }}
                  className={`px-3 py-2 rounded-full ${selectedSymptoms.includes(s.value) ? 'bg-pink-100 border border-pink-300' : ''}`}
                  style={!selectedSymptoms.includes(s.value) ? { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1 } : undefined}
                >
                  <Text className="text-xs">
                    {s.emoji} {s.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>Notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="How are you feeling?"
              placeholderTextColor={colors.textMuted}
              className="rounded-lg px-4 py-3"
              style={{ backgroundColor: colors.bgInput, color: colors.text }}
              multiline
            />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowAddEntry(false)}
              className="flex-1 py-3 rounded-xl items-center"
              style={{ borderColor: colors.border, borderWidth: 1 }}
            >
              <Text className="font-semibold" style={{ color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddEntry}
              className="flex-1 bg-pink-500 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Log It</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
