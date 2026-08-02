import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/src/stores/theme';
import { useMeditationStore } from '@/src/stores/meditation';
import { trackScreen } from '@/src/lib/analytics';
import { useState, useEffect, useRef } from 'react';
import type { MeditationType } from '@/src/types';
import Svg, { Circle } from 'react-native-svg';
import {
  Brain,
  Moon,
  Sun,
  Sparkle,
  Heart,
  Clock,
  Play,
  Stop,
  Wind,
  CalendarBlank,
} from 'phosphor-react-native';

const RING_SIZE = 200;
const STROKE_WIDTH = 12;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SESSION_TYPES: { value: MeditationType; label: string; icon: React.ComponentType<any>; color: string; description: string }[] = [
  { value: 'breathing', label: 'Breathing', icon: Wind, color: '#06B6D4', description: 'Guided breathing exercises' },
  { value: 'body_scan', label: 'Body Scan', icon: Brain, color: '#8B5CF6', description: 'Progressive body awareness' },
  { value: 'sleep', label: 'Sleep', icon: Moon, color: '#6366F1', description: 'Drift into restful sleep' },
  { value: 'focus', label: 'Focus', icon: Sparkle, color: '#F59E0B', description: 'Sharpen concentration' },
  { value: 'stress_relief', label: 'Stress Relief', icon: Heart, color: '#EC4899', description: 'Release tension & anxiety' },
  { value: 'morning', label: 'Morning', icon: Sun, color: '#F97316', description: 'Start your day mindfully' },
  { value: 'gratitude', label: 'Gratitude', icon: Heart, color: '#10B981', description: 'Cultivate appreciation' },
];

const DURATIONS = [1, 3, 5, 10, 15, 20];

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function MeditationScreen() {
  useEffect(() => { trackScreen('meditation'); }, []);
  const colors = useThemeColors();
  const { sessions, addSession, getWeeklyMinutes, streak, breathingPatterns } = useMeditationStore();
  const [selectedType, setSelectedType] = useState<MeditationType>('breathing');
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [isBreathingMode, setIsBreathingMode] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'holdIn' | 'exhale' | 'holdOut'>('inhale');
  const [breathingCountdown, setBreathingCountdown] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [tab, setTab] = useState<'sessions' | 'breathing' | 'stats'>('sessions');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetSeconds = selectedDuration * 60;
  const progress = targetSeconds > 0 ? elapsed / targetSeconds : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(progress, 1));

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathRef.current) clearInterval(breathRef.current);
    };
  }, []);

  const startSession = () => {
    setElapsed(0);
    setIsActive(true);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= targetSeconds) {
          clearInterval(timerRef.current!);
          addSession({
            type: selectedType,
            durationMinutes: selectedDuration,
            completedAt: new Date().toISOString(),
            completed: true,
          });
          setIsActive(false);
          return targetSeconds;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const minutes = Math.max(1, Math.round(elapsed / 60));
    addSession({
      type: selectedType,
      durationMinutes: minutes,
      completedAt: new Date().toISOString(),
      completed: elapsed > 30,
    });
    setIsActive(false);
    setElapsed(0);
  };

  const startBreathing = () => {
    setIsBreathingMode(true);
    const pattern = breathingPatterns[selectedPattern];
    setBreathingPhase('inhale');
    setBreathingCountdown(pattern.inhaleSeconds);

    breathRef.current = setInterval(() => {
      setBreathingCountdown((prev) => {
        if (prev <= 1) {
          const p = breathingPatterns[getPatternIndex()];
          switch (breathingPhase) {
            case 'inhale':
              if (p.holdInSeconds > 0) {
                setBreathingPhase('holdIn');
                return p.holdInSeconds;
              }
              setBreathingPhase('exhale');
              return p.exhaleSeconds;
            case 'holdIn':
              setBreathingPhase('exhale');
              return p.exhaleSeconds;
            case 'exhale':
              if (p.holdOutSeconds > 0) {
                setBreathingPhase('holdOut');
                return p.holdOutSeconds;
              }
              setBreathingPhase('inhale');
              return p.inhaleSeconds;
            case 'holdOut':
              setBreathingPhase('inhale');
              return p.inhaleSeconds;
          }
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getPatternIndex = () => {
    return selectedPattern;
  };

  const stopBreathing = () => {
    if (breathRef.current) clearInterval(breathRef.current);
    setIsBreathingMode(false);
    addSession({
      type: 'breathing',
      durationMinutes: Math.max(1, Math.round(elapsed / 60)),
      completedAt: new Date().toISOString(),
      completed: true,
    });
  };

  const totalSessions = sessions.length;
  const weeklyMinutes = getWeeklyMinutes();

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="items-center pt-8 pb-4">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Mindfulness
        </Text>
        <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>Meditation & breathing exercises</Text>
      </View>

      <View className="flex-row mx-4 mb-4 rounded-xl p-1" style={{ backgroundColor: colors.bgInput }}>
        {(['sessions', 'breathing', 'stats'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg items-center ${tab === t ? 'shadow-sm' : ''}`}
            style={{ backgroundColor: tab === t ? colors.bg : undefined }}
          >
            <Text
              className={`text-sm font-semibold capitalize ${tab === t ? 'text-green-600' : ''}`}
              style={tab === t ? undefined : { color: colors.textSecondary }}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'sessions' && (
        <View className="px-4">
          {!isActive && (
            <View className="items-center mb-6">
              <View
                className="w-[200px] h-[200px] items-center justify-center"
              >
                <Svg width={RING_SIZE} height={RING_SIZE}>
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    stroke={colors.bgInput}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                  />
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    stroke="#06B6D4"
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  />
                </Svg>
                <View className="absolute items-center">
                  <Text className="text-3xl font-bold" style={{ color: colors.text }}>{selectedDuration}</Text>
                  <Text className="text-sm" style={{ color: colors.textSecondary }}>minutes</Text>
                </View>
              </View>

              <View className="flex-row flex-wrap justify-center gap-2 mt-4">
                {SESSION_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <TouchableOpacity
                      key={t.value}
                      onPress={() => setSelectedType(t.value)}
                      className={`px-3 py-2 rounded-xl items-center ${selectedType === t.value ? 'border-2' : ''}`}
                      style={{
                        borderColor: selectedType === t.value ? t.color : 'transparent',
                        backgroundColor: selectedType === t.value ? t.color + '10' : colors.bgInput,
                      }}
                    >
                      <Icon size={20} color={selectedType === t.value ? t.color : colors.textMuted} weight="fill" />
                      <Text
                        className="text-xs font-semibold mt-1"
                        style={{ color: selectedType === t.value ? t.color : colors.textSecondary }}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="flex-row flex-wrap justify-center gap-2 mt-4">
                {DURATIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setSelectedDuration(d)}
                    className={`w-14 h-14 rounded-full items-center justify-center ${selectedDuration === d ? 'bg-cyan-500' : ''}`}
                    style={{ backgroundColor: selectedDuration === d ? undefined : colors.bgInput }}
                  >
                    <Text
                      className={`text-base font-bold ${selectedDuration === d ? 'text-white' : ''}`}
                      style={{ color: selectedDuration === d ? undefined : colors.textSecondary }}
                    >
                      {d}
                    </Text>
                    <Text
                      className={`text-[10px] ${selectedDuration === d ? 'text-white' : ''}`}
                      style={{ color: selectedDuration === d ? undefined : colors.textMuted }}
                    >
                      min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={startSession}
                className="mt-6 bg-cyan-500 px-12 py-4 rounded-2xl flex-row items-center"
              >
                <Play size={20} color="#FFF" weight="fill" />
                <Text className="text-white font-bold ml-2 text-lg">Start Session</Text>
              </TouchableOpacity>
            </View>
          )}

          {isActive && (
            <View className="items-center mb-8">
              <View className="w-[200px] h-[200px] items-center justify-center mb-6">
                <Svg width={RING_SIZE} height={RING_SIZE}>
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    stroke={colors.bgInput}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                  />
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RADIUS}
                    stroke="#06B6D4"
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                  />
                </Svg>
                <View className="absolute items-center">
                  <Text className="text-4xl font-bold" style={{ color: colors.text }}>{formatTime(elapsed)}</Text>
                  <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>of {selectedDuration} min</Text>
                </View>
              </View>

              <Text className="text-lg font-semibold mb-1 capitalize" style={{ color: colors.textSecondary }}>
                {selectedType.replace('_', ' ')}
              </Text>
              <Text className="text-sm mb-6" style={{ color: colors.textMuted }}>
                {SESSION_TYPES.find((t) => t.value === selectedType)?.description}
              </Text>

              <TouchableOpacity
                onPress={stopSession}
                className="bg-red-500 px-8 py-3 rounded-xl flex-row items-center"
              >
                <Stop size={18} color="#FFF" weight="fill" />
                <Text className="text-white font-bold ml-2">End Session</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {tab === 'breathing' && (
        <View className="px-4">
          {!isBreathingMode ? (
            <View className="items-center">
              <View className="flex-row flex-wrap justify-center gap-2 mb-6">
                {breathingPatterns.map((p, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setSelectedPattern(i)}
                    className={`px-4 py-3 rounded-xl ${selectedPattern === i ? 'bg-cyan-500' : ''}`}
                    style={{ backgroundColor: selectedPattern === i ? undefined : colors.bgInput }}
                  >
                    <Text
                      className={`font-semibold ${selectedPattern === i ? 'text-white' : ''}`}
                      style={{ color: selectedPattern === i ? undefined : colors.textSecondary }}
                    >
                      {p.name}
                    </Text>
                    <Text
                      className={`text-xs mt-1 ${selectedPattern === i ? 'text-cyan-100' : ''}`}
                      style={{ color: selectedPattern === i ? undefined : colors.textMuted }}
                    >
                      {p.inhaleSeconds}-{p.holdInSeconds || '0'}-{p.exhaleSeconds}
                      {p.holdOutSeconds ? `-${p.holdOutSeconds}` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="rounded-xl p-4 w-full mb-6" style={{ backgroundColor: colors.bgInput }}>
                <Text className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>
                  {breathingPatterns[selectedPattern].name}
                </Text>
                <Text className="text-sm" style={{ color: colors.textSecondary }}>
                  {breathingPatterns[selectedPattern].description}
                </Text>
              </View>

              <TouchableOpacity
                onPress={startBreathing}
                className="bg-cyan-500 px-12 py-4 rounded-2xl flex-row items-center"
              >
                <Wind size={20} color="#FFF" weight="fill" />
                <Text className="text-white font-bold ml-2 text-lg">Start Breathing</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center">
              <View
                className="w-[200px] h-[200px] rounded-full items-center justify-center mb-8"
                style={{
                  backgroundColor: breathingPhase === 'inhale' ? '#06B6D4' :
                                   breathingPhase === 'holdIn' ? '#6366F1' :
                                   breathingPhase === 'holdOut' ? '#8B5CF6' : '#10B981',
                  transform: [{ scale: breathingPhase === 'inhale' ? 1.1 : breathingPhase === 'exhale' ? 0.9 : 1 }],
                }}
              >
                <View className="items-center">
                  <Text className="text-4xl font-bold text-white">{breathingCountdown}</Text>
                  <Text className="text-lg text-white/80 mt-2 capitalize font-semibold">
                    {breathingPhase === 'holdIn' ? 'Hold' :
                     breathingPhase === 'holdOut' ? 'Hold' :
                     breathingPhase}
                  </Text>
                </View>
              </View>

              <Text className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                {breathingPatterns[selectedPattern].name}
              </Text>

              <TouchableOpacity
                onPress={stopBreathing}
                className="bg-red-500 px-8 py-3 rounded-xl flex-row items-center"
              >
                <Stop size={18} color="#FFF" weight="fill" />
                <Text className="text-white font-bold ml-2">Stop</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {tab === 'stats' && (
        <View className="px-4 mb-8">
          <View className="flex-row flex-wrap gap-3 mb-6">
            <View className="flex-1 min-w-[100px] bg-cyan-50 rounded-xl p-4 items-center">
              <Brain size={24} color="#06B6D4" weight="fill" />
              <Text className="text-2xl font-bold text-cyan-700 mt-2">{totalSessions}</Text>
              <Text className="text-xs text-cyan-600">Total Sessions</Text>
            </View>
            <View className="flex-1 min-w-[100px] bg-purple-50 rounded-xl p-4 items-center">
              <Clock size={24} color="#8B5CF6" weight="fill" />
              <Text className="text-2xl font-bold text-purple-700 mt-2">{sessions.reduce((s, session) => s + session.durationMinutes, 0)}</Text>
              <Text className="text-xs text-purple-600">Minutes Total</Text>
            </View>
            <View className="flex-1 min-w-[100px] bg-amber-50 rounded-xl p-4 items-center">
              <Sparkle size={24} color="#F59E0B" weight="fill" />
              <Text className="text-2xl font-bold text-amber-700 mt-2">{streak}</Text>
              <Text className="text-xs text-amber-600">Day Streak</Text>
            </View>
            <View className="flex-1 min-w-[100px] bg-emerald-50 rounded-xl p-4 items-center">
              <CalendarBlank size={24} color="#10B981" weight="fill" />
              <Text className="text-2xl font-bold text-emerald-700 mt-2">{weeklyMinutes}</Text>
              <Text className="text-xs text-emerald-600">Min This Week</Text>
            </View>
          </View>

          {sessions.length > 0 && (
            <View>
              <Text className="text-sm font-semibold mb-3" style={{ color: colors.textSecondary }}>Recent Sessions</Text>
              {[...sessions]
                .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                .slice(0, 10)
                .map((session) => {
                  const type = SESSION_TYPES.find((t) => t.value === session.type);
                  const Icon = type?.icon || Brain;
                  return (
                    <View key={session.id} className="flex-row items-center rounded-xl px-4 py-3 mb-2" style={{ backgroundColor: colors.bgInput }}>
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: (type?.color || '#06B6D4') + '20' }}
                      >
                        <Icon size={18} color={type?.color || '#06B6D4'} weight="fill" />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-semibold" style={{ color: colors.text }}>{type?.label || session.type}</Text>
                        <Text className="text-xs" style={{ color: colors.textMuted }}>{session.completedAt.slice(0, 10)}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm font-bold" style={{ color: colors.textSecondary }}>{session.durationMinutes} min</Text>
                        <Text className="text-xs" style={{ color: session.completed ? '#22C55E' : '#F59E0B' }}>
                          {session.completed ? 'Completed' : 'Partial'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
