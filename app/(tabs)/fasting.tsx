import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FASTING_COLORS } from '@/src/constants/theme';
import { useFastingStore } from '@/src/stores/fasting';
import { trackScreen } from '@/src/lib/analytics';
import { useThemeColors } from '@/src/stores/theme';
import { useEffect, useState, useRef } from 'react';
import type { FastingPlan } from '@/src/types';
import { Pause, Play, Clock, Calendar, List } from 'phosphor-react-native';

const RING_SIZE = 220;
const STROKE_WIDTH = 14;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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

export default function FastingScreen() {
  useEffect(() => { trackScreen('fasting'); }, []);
  const {
    currentPlan,
    activeSession,
    setPlan,
    startFast,
    endFast,
    getElapsedSeconds,
    getRemainingSeconds,
    getProgress,
  } = useFastingStore();
  const colors = useThemeColors();

  const [elapsed, setElapsed] = useState(activeSession ? getElapsedSeconds() : 0);
  const [remaining, setRemaining] = useState(activeSession ? getRemainingSeconds() : 0);
  const [progress, setProgress] = useState(activeSession ? getProgress() : 0);
  const [historyView, setHistoryView] = useState<'list' | 'calendar'>('list');
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

  const planHours = PLAN_OPTIONS.find((p) => p.value === currentPlan)?.hours || 16;
  const isActive = !!activeSession;

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bgSecondary }}>
      <View className="items-center pt-8 pb-4">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Fasting Tracker
        </Text>
        <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          {isActive ? 'Fast in progress' : 'Ready to start'}
        </Text>
      </View>

      <View className="items-center py-4">
        <View className="relative items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={colors.bgInput}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {isActive && (
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke={progress >= 1 ? FASTING_COLORS.eating : FASTING_COLORS.fasting}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            )}
          </Svg>
          <View className="absolute items-center">
            {isActive ? (
              <>
                <Text className="text-3xl font-bold" style={{ color: colors.text }}>{formatTime(elapsed)}</Text>
                <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>elapsed</Text>
                {remaining > 0 && (
                  <Text className="text-xs mt-2 font-semibold" style={{ color: FASTING_COLORS.fasting }}>
                    {formatTime(remaining)} remaining
                  </Text>
                )}
                {progress >= 1 && (
                  <Text className="text-sm font-bold mt-2" style={{ color: FASTING_COLORS.eating }}>
                    Finished!
                  </Text>
                )}
              </>
            ) : (
              <>
                <Clock size={32} color={colors.textMuted} />
                <Text className="text-lg font-semibold mt-3" style={{ color: colors.textMuted }}>
                  {currentPlan} ({planHours}h)
                </Text>
                <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>Not fasting</Text>
              </>
            )}
          </View>
        </View>

        {progress > 0 && progress < 1 && (
          <View className="mt-4 w-48 h-1 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgInput }}>
            <View
              className="h-full rounded-full"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: FASTING_COLORS.fasting,
              }}
            />
          </View>
        )}
      </View>

      <View className="px-6 mb-6">
        {isActive ? (
          <TouchableOpacity
            onPress={endFast}
            className="py-4 rounded-2xl items-center"
            style={{ backgroundColor: COLORS.error }}
          >
            <View className="flex-row items-center gap-2">
              <Pause size={20} color="white" weight="fill" />
              <Text className="text-white text-base font-bold">End Fast Early</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={startFast}
            className="py-4 rounded-2xl items-center"
            style={{ backgroundColor: FASTING_COLORS.fasting }}
          >
            <View className="flex-row items-center gap-2">
              <Play size={20} color="white" weight="fill" />
              <Text className="text-white text-base font-bold">Start Fasting</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View className="px-6 mb-6">
        <Text className="text-sm font-bold mb-3 ml-1" style={{ color: colors.textSecondary }}>Plans</Text>
        <View className="flex-row flex-wrap gap-2">
          {PLAN_OPTIONS.map((plan) => {
            const isSelected = currentPlan === plan.value;
            return (
              <TouchableOpacity
                key={plan.value}
                onPress={() => setPlan(plan.value)}
                className={`rounded-xl border px-4 py-3 ${isSelected ? 'border-purple-400 bg-purple-50' : ''}`}
                style={isSelected ? undefined : { borderColor: colors.border, backgroundColor: colors.bgCard }}
              >
                <Text
                  className={`text-sm font-semibold ${isSelected ? 'text-purple-700' : ''}`}
                  style={isSelected ? undefined : { color: colors.textSecondary }}
                >
                  {plan.label}
                </Text>
                <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{plan.difficulty}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="px-6 pb-10">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Calendar size={18} color={colors.textMuted} />
            <Text className="text-sm font-bold" style={{ color: colors.textSecondary }}>History</Text>
          </View>
          <View className="flex-row rounded-lg p-0.5" style={{ backgroundColor: colors.bgInput }}>
            <TouchableOpacity
              onPress={() => setHistoryView('list')}
              className={`px-3 py-1.5 rounded-md ${historyView === 'list' ? 'shadow-sm' : ''}`}
              style={historyView === 'list' ? { backgroundColor: colors.bgCard } : undefined}
            >
              <List size={14} color={historyView === 'list' ? colors.textSecondary : colors.textMuted} weight="fill" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setHistoryView('calendar')}
              className={`px-3 py-1.5 rounded-md ${historyView === 'calendar' ? 'shadow-sm' : ''}`}
              style={historyView === 'calendar' ? { backgroundColor: colors.bgCard } : undefined}
            >
              <Calendar size={14} color={historyView === 'calendar' ? colors.textSecondary : colors.textMuted} weight="fill" />
            </TouchableOpacity>
          </View>
        </View>
        {historyView === 'list' ? <HistorySection colors={colors} /> : <FastingCalendar colors={colors} />}
      </View>
    </ScrollView>
  );
}

function FastingCalendar({ colors }: { colors: ReturnType<typeof useThemeColors> }) {
  const { history } = useFastingStore();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const historyMap = new Map<string, boolean>();
  history.forEach((s) => {
    const dateStr = new Date(s.startTime).toISOString().slice(0, 10);
    if (s.completed) historyMap.set(dateStr, true);
    else historyMap.set(dateStr, false);
  });

  const monthLabel = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View className="rounded-2xl border p-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
      <Text className="text-sm font-bold text-center mb-3" style={{ color: colors.textSecondary }}>{monthLabel}</Text>
      <View className="flex-row mb-2">
        {dayNames.map((d) => (
          <View key={d} className="flex-1 items-center">
            <Text className="text-xs" style={{ color: colors.textMuted }}>{d}</Text>
          </View>
        ))}
      </View>
      <View className="flex-row flex-wrap">
        {Array.from({ length: firstDay }).map((_, i) => (
          <View key={`empty-${i}`} className="w-[14.28%] aspect-square p-1" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const completed = historyMap.get(dateStr);
          const isToday = day === today.getDate();

          return (
            <View key={day} className="w-[14.28%] aspect-square p-1">
              <View
                className="flex-1 rounded-lg items-center justify-center"
                style={{
                  backgroundColor: completed === true
                    ? FASTING_COLORS.eating + '30'
                    : completed === false
                    ? '#FEE2E2'
                    : 'transparent',
                  borderWidth: isToday ? 2 : 0,
                  borderColor: isToday ? FASTING_COLORS.fasting : 'transparent',
                }}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isToday
                      ? 'text-purple-600'
                      : completed
                      ? 'text-green-600'
                      : completed === false
                      ? 'text-red-400'
                      : ''
                  }`}
                  style={(!isToday && completed !== true && completed !== false)
                    ? { color: colors.textMuted }
                    : undefined}
                >
                  {day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <View className="flex-row justify-center gap-4 mt-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: FASTING_COLORS.eating + '30' }} />
          <Text className="text-xs" style={{ color: colors.textMuted }}>Completed</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm bg-red-100" />
          <Text className="text-xs" style={{ color: colors.textMuted }}>Incomplete</Text>
        </View>
      </View>
    </View>
  );
}

function HistorySection({ colors }: { colors: ReturnType<typeof useThemeColors> }) {
  const { history } = useFastingStore();

  if (history.length === 0) {
    return (
      <View className="rounded-xl p-6 items-center" style={{ backgroundColor: colors.bgInput }}>
        <Text className="text-sm" style={{ color: colors.textMuted }}>No fasting history yet</Text>
        <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>Start your first fast to begin tracking</Text>
      </View>
    );
  }

  return (
    <View className="gap-2">
      {history.slice(0, 10).map((session) => {
        const start = new Date(session.startTime);
        const end = session.endTime ? new Date(session.endTime) : null;
        const durationH = end
          ? Math.round(((end.getTime() - start.getTime()) / (1000 * 3600)) * 10) / 10
          : session.targetHours;

        return (
          <View key={session.id} className="flex-row items-center justify-between rounded-xl px-4 py-3" style={{ backgroundColor: colors.bgInput }}>
            <View>
              <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
                {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text className="text-xs" style={{ color: colors.textMuted }}>
                {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {end ? ` - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ' - ongoing'}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-bold" style={{ color: FASTING_COLORS.fasting }}>
                {durationH}h
              </Text>
              <Text className="text-xs" style={{ color: colors.textMuted }}>
                {session.completed ? 'Completed' : 'Incomplete'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
