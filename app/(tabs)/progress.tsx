import { useEffect, useState } from 'react';
import { trackScreen } from '@/src/lib/analytics';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
} from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/src/constants/theme';
import { useBodyStore, type ProgressPhoto } from '@/src/stores/body';
import { useInsightsStore } from '@/src/stores/insights';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useThemeColors } from '@/src/stores/theme';
import type { ThemeColors } from '@/src/stores/theme';
import { calculateBMI, estimateBodyFatPct } from '@/src/lib/calculator';
import { Trash, ArrowUp, Camera, Trophy, Star, ChartBar, Barbell } from 'phosphor-react-native';
import { WebProgress } from '@/src/web/screens/WebProgress';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 180;
const PADDING = 40;

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ProgressScreen() {
  if (Platform.OS === 'web') return <WebProgress />;
  useEffect(() => { trackScreen('progress'); }, []);
  const [tab, setTab] = useState<'weight' | 'measurements' | 'photos' | 'insights'>('weight');
  const colors = useThemeColors();

  return (
    <View className="flex-1 bg-gray-50" style={{ backgroundColor: colors.bgSecondary }}>
      <View
        className="bg-white px-4 pt-6 pb-4 border-b border-gray-100"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      >
        <Text className="text-2xl font-bold text-gray-800" style={{ color: colors.text }}>Progress</Text>
        <Text className="text-sm text-gray-400 mt-1" style={{ color: colors.textMuted }}>Track your transformation</Text>
      </View>

      <View
        className="flex-row mx-4 mt-4 bg-white rounded-2xl p-1 border border-gray-100"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      >
        {(['weight', 'measurements', 'photos', 'insights'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl items-center"
            style={{ backgroundColor: tab === t ? COLORS.primary : 'transparent' }}
          >
            <Text
              className={`text-xs font-semibold capitalize ${
                tab === t ? 'text-white' : 'text-gray-400'
              }`}
              style={tab !== t ? { color: colors.textMuted } : undefined}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {tab === 'weight' && <WeightTab colors={colors} />}
        {tab === 'measurements' && <MeasurementsTab colors={colors} />}
        {tab === 'photos' && <PhotosTab colors={colors} />}
        {tab === 'insights' && <InsightsTab colors={colors} />}
      </ScrollView>
    </View>
  );
}

function WeightTab({ colors }: { colors: ThemeColors }) {
  const { weightEntries, addWeight, removeWeight } = useBodyStore();
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const onboarding = useOnboardingStore();

  const handleAdd = () => {
    const w = parseFloat(weight);
    if (!w || w < 20 || w > 300) {
      Alert.alert('Invalid', 'Enter a valid weight (20-300 kg)');
      return;
    }
    addWeight({
      date: todayStr(),
      weightKg: w,
      bodyFatPct: bodyFat ? parseFloat(bodyFat) : undefined,
    });
    setWeight('');
    setBodyFat('');
  };

  const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const trend = latest && first ? latest.weightKg - first.weightKg : 0;

  const heightCm = onboarding.heightCm || 170;
  const bmi = latest ? calculateBMI(latest.weightKg, heightCm) : null;
  const estimatedBf = latest && (onboarding.sex === 'male' || onboarding.sex === 'female')
    ? estimateBodyFatPct(onboarding.sex, bmi?.bmi || 22, 30)
    : null;

  return (
    <View>
      <View className="flex-row gap-3 mb-4">
        <View
          className="flex-1 bg-white rounded-2xl border border-gray-100 p-4"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <Text className="text-xs text-gray-400" style={{ color: colors.textMuted }}>Current</Text>
          <Text className="text-2xl font-bold text-gray-800 mt-1" style={{ color: colors.text }}>
            {latest ? `${latest.weightKg} kg` : '--'}
          </Text>
        </View>
        <View
          className="flex-1 bg-white rounded-2xl border border-gray-100 p-4"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <Text className="text-xs text-gray-400" style={{ color: colors.textMuted }}>Change</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <ArrowUp
              size={16}
              color={trend < 0 ? COLORS.success : COLORS.error}
              style={{ transform: [{ rotate: trend < 0 ? '180deg' : '0deg' }] }}
              weight="fill"
            />
            <Text
              className="text-2xl font-bold"
              style={{ color: trend < 0 ? COLORS.success : trend > 0 ? COLORS.error : colors.textSecondary }}
            >
              {trend !== 0 ? `${Math.abs(trend).toFixed(1)}` : '--'}
            </Text>
          </View>
        </View>
      </View>

      {bmi && (
        <View
          className="bg-white rounded-2xl border border-gray-100 p-4 mb-4"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <Text className="text-sm font-bold text-gray-700 mb-3" style={{ color: colors.textSecondary }}>Body Composition</Text>
          <View className="flex-row gap-3">
            <View
              className="flex-1 items-center bg-gray-50 rounded-xl p-3"
              style={{ backgroundColor: colors.bgInput }}
            >
              <Text className="text-2xl font-bold" style={{ color: bmi.color }}>{bmi.bmi}</Text>
              <Text className="text-[10px] text-gray-400 mt-0.5" style={{ color: colors.textMuted }}>BMI</Text>
              <Text className="text-xs font-semibold mt-1" style={{ color: bmi.color }}>{bmi.category}</Text>
            </View>
            <View
              className="flex-1 items-center bg-gray-50 rounded-xl p-3"
              style={{ backgroundColor: colors.bgInput }}
            >
              <Text className="text-2xl font-bold text-gray-700" style={{ color: colors.textSecondary }}>
                {bmi.healthyMin}–{bmi.healthyMax}
              </Text>
              <Text className="text-[10px] text-gray-400 mt-0.5" style={{ color: colors.textMuted }}>Healthy Range</Text>
              <Text className="text-xs font-semibold text-green-600 mt-1">kg for {heightCm}cm</Text>
            </View>
            {estimatedBf !== null && (
              <View
                className="flex-1 items-center bg-gray-50 rounded-xl p-3"
                style={{ backgroundColor: colors.bgInput }}
              >
                <Text className="text-2xl font-bold text-purple-600">{estimatedBf}%</Text>
                <Text className="text-[10px] text-gray-400 mt-0.5" style={{ color: colors.textMuted }}>Est. Body Fat</Text>
                <Text className="text-xs font-semibold text-purple-500 mt-1">via US Navy</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {sorted.length >= 2 ? (
        <WeightChart data={sorted} colors={colors} />
      ) : (
        <View
          className="bg-white rounded-2xl border border-gray-100 p-8 items-center mb-4"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <Text className="text-gray-300 text-sm" style={{ color: colors.textMuted }}>Add at least 2 entries to see the chart</Text>
        </View>
      )}

      <View
        className="bg-white rounded-2xl border border-gray-100 p-4 mb-3"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      >
        <Text className="text-sm font-bold text-gray-500 mb-3" style={{ color: colors.textSecondary }}>Log Weight</Text>
        <View className="flex-row gap-3 mb-3">
          <View className="flex-1">
            <Text className="text-xs text-gray-400 mb-1" style={{ color: colors.textMuted }}>Weight (kg)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: colors.bgInput }}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter weight"
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-gray-400 mb-1" style={{ color: colors.textMuted }}>Body Fat %</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: colors.bgInput }}
              value={bodyFat}
              onChangeText={setBodyFat}
              placeholder="Optional"
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={handleAdd}
          className="py-3 rounded-xl items-center"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-white text-sm font-bold">Add Entry</Text>
        </TouchableOpacity>
      </View>

      {sorted.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-bold text-gray-500 mb-2 ml-1" style={{ color: colors.textSecondary }}>History</Text>
          {sorted.reverse().slice(0, 14).map((entry) => (
            <View
              key={entry.id}
              className="flex-row items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 mb-1.5"
              style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
            >
              <View>
                <Text className="text-sm font-semibold text-gray-700" style={{ color: colors.textSecondary }}>{entry.weightKg} kg</Text>
                <Text className="text-xs text-gray-400" style={{ color: colors.textMuted }}>{entry.date}</Text>
              </View>
              <TouchableOpacity onPress={() => removeWeight(entry.id)}>
                <Trash size={16} color="#D1D5DB" weight="fill" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function WeightChart({ data, colors }: { data: Array<{ date: string; weightKg: number }>; colors: ThemeColors }) {
  if (data.length < 2) return null;

  const weights = data.map((d) => d.weightKg);
  const minW = Math.floor(Math.min(...weights) - 1);
  const maxW = Math.ceil(Math.max(...weights) + 1);
  const range = maxW - minW || 1;

  const points = data.map((d, i) => ({
    x: PADDING + (i / (data.length - 1)) * (CHART_WIDTH - PADDING * 2),
    y: CHART_HEIGHT - PADDING - ((d.weightKg - minW) / range) * (CHART_HEIGHT - PADDING * 2),
  }));

  return (
    <View
      className="bg-white rounded-2xl border border-gray-100 p-4 mb-4"
      style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
    >
      <Text className="text-sm font-bold text-gray-500 mb-3" style={{ color: colors.textSecondary }}>Weight Trend</Text>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Line x1={PADDING} y1={CHART_HEIGHT - PADDING} x2={CHART_WIDTH - PADDING} y2={CHART_HEIGHT - PADDING} stroke="#E5E7EB" strokeWidth={1} />
        <Line x1={PADDING} y1={PADDING} x2={PADDING} y2={CHART_HEIGHT - PADDING} stroke="#E5E7EB" strokeWidth={1} />
        <Polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={COLORS.primary} />
        ))}
      </Svg>
      <View className="flex-row justify-between mt-1">
        <Text className="text-xs text-gray-400" style={{ color: colors.textMuted }}>{data[0].date.slice(5)}</Text>
        <Text className="text-xs text-gray-400" style={{ color: colors.textMuted }}>{data[data.length - 1].date.slice(5)}</Text>
      </View>
    </View>
  );
}

const MEASURE_LABELS: Array<{ key: string; label: string }> = [
  { key: 'neckCm', label: 'Neck' },
  { key: 'shouldersCm', label: 'Shoulders' },
  { key: 'chestCm', label: 'Chest' },
  { key: 'waistCm', label: 'Waist' },
  { key: 'hipsCm', label: 'Hips' },
  { key: 'leftArmCm', label: 'Left Arm' },
  { key: 'rightArmCm', label: 'Right Arm' },
  { key: 'leftThighCm', label: 'Left Thigh' },
  { key: 'rightThighCm', label: 'Right Thigh' },
  { key: 'leftCalfCm', label: 'Left Calf' },
  { key: 'rightCalfCm', label: 'Right Calf' },
];

function MeasurementsTab({ colors }: { colors: ThemeColors }) {
  const { measurements, addMeasurements, removeMeasurements } = useBodyStore();
  const [values, setValues] = useState<Record<string, string>>({});

  const handleAdd = () => {
    const entry: Record<string, number | undefined> = {};
    let hasValue = false;
    Object.entries(values).forEach(([k, v]) => {
      if (v) {
        entry[k] = parseFloat(v);
        hasValue = true;
      }
    });
    if (!hasValue) {
      Alert.alert('Empty', 'Enter at least one measurement');
      return;
    }
    addMeasurements({ date: todayStr(), ...entry } as any);
    setValues({});
  };

  return (
    <View>
      <View
        className="bg-white rounded-2xl border border-gray-100 p-4 mb-4"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      >
        <Text className="text-sm font-bold text-gray-500 mb-3" style={{ color: colors.textSecondary }}>Log Measurements</Text>
        {MEASURE_LABELS.map((m) => (
          <View
            key={m.key}
            className="flex-row items-center justify-between py-2 border-b border-gray-50"
            style={{ borderColor: colors.borderLight }}
          >
            <Text className="text-sm text-gray-600" style={{ color: colors.textSecondary }}>{m.label}</Text>
            <TextInput
              className="bg-gray-50 rounded-lg px-3 py-1.5 text-sm text-right w-24"
              style={{ backgroundColor: colors.bgInput }}
              value={values[m.key] || ''}
              onChangeText={(v) => setValues((s) => ({ ...s, [m.key]: v }))}
              placeholder="cm"
              placeholderTextColor="#D1D5DB"
              keyboardType="numeric"
            />
          </View>
        ))}
        <TouchableOpacity
          onPress={handleAdd}
          className="mt-4 py-3 rounded-xl items-center"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-white text-sm font-bold">Save Measurements</Text>
        </TouchableOpacity>
      </View>

      {measurements.length > 0 && (
        <View className="mb-4">
          <Text className="text-sm font-bold text-gray-500 mb-2 ml-1" style={{ color: colors.textSecondary }}>History</Text>
          {measurements.slice(0, 10).map((entry) => (
            <View
              key={entry.id}
              className="bg-white rounded-xl border border-gray-100 p-4 mb-2"
              style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
            >
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-700" style={{ color: colors.textSecondary }}>{entry.date}</Text>
                <TouchableOpacity onPress={() => removeMeasurements(entry.id)}>
                  <Trash size={14} color="#D1D5DB" weight="fill" />
                </TouchableOpacity>
              </View>
              <View className="flex-row flex-wrap gap-x-4 gap-y-1">
                {MEASURE_LABELS.map((m) => {
                  const val = (entry as any)[m.key];
                  if (!val) return null;
                  return (
                    <Text key={m.key} className="text-xs text-gray-500" style={{ color: colors.textSecondary }}>
                      {m.label}: <Text className="font-semibold text-gray-700" style={{ color: colors.textSecondary }}>{val}cm</Text>
                    </Text>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function PhotosTab({ colors }: { colors: ThemeColors }) {
  const { photos, addPhoto, removePhoto } = useBodyStore();
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take progress photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPendingUri(result.assets[0].uri);
      setShowTypePicker(true);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPendingUri(result.assets[0].uri);
      setShowTypePicker(true);
    }
  };

  const savePhoto = (type: ProgressPhoto['type']) => {
    if (!pendingUri) return;
    const { weightEntries } = useBodyStore.getState();
    const latestWeight = weightEntries.length > 0 ? weightEntries[0].weightKg : undefined;
    addPhoto({
      uri: pendingUri,
      date: todayStr(),
      type,
      weightKg: latestWeight,
    });
    setPendingUri(null);
    setShowTypePicker(false);
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Photo', 'Remove this progress photo?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removePhoto(id) },
    ]);
  };

  const groupedPhotos = photos.reduce<Record<string, ProgressPhoto[]>>((acc, photo) => {
    if (!acc[photo.date]) acc[photo.date] = [];
    acc[photo.date].push(photo);
    return acc;
  }, {});

  return (
    <View>
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity
          onPress={takePhoto}
          className="flex-1 bg-green-500 py-4 rounded-2xl items-center flex-row justify-center"
        >
          <Camera size={20} color="#FFF" weight="fill" />
          <Text className="text-white font-bold ml-2">Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={pickFromGallery}
          className="flex-1 bg-white border-2 border-green-500 py-4 rounded-2xl items-center"
          style={{ backgroundColor: colors.bgCard }}
        >
          <Text className="text-green-600 font-bold">From Gallery</Text>
        </TouchableOpacity>
      </View>

      {photos.length === 0 ? (
        <View
          className="bg-white rounded-2xl border border-gray-100 p-8 items-center"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <Camera size={40} color="#D1D5DB" />
          <Text className="text-base font-semibold text-gray-500 mt-4" style={{ color: colors.textSecondary }}>No Photos Yet</Text>
          <Text className="text-sm text-gray-300 mt-1 text-center" style={{ color: colors.textMuted }}>
            Take front, side, and back photos{'\n'}to track your visual progress
          </Text>
        </View>
      ) : (
        Object.entries(groupedPhotos)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, datePhotos]) => (
            <View key={date} className="mb-6">
              <Text className="text-sm font-bold text-gray-500 mb-3 ml-1" style={{ color: colors.textSecondary }}>{date}</Text>
              <View className="flex-row flex-wrap gap-2">
                {datePhotos.map((photo) => (
                  <View key={photo.id} className="relative">
                    <Image
                      source={{ uri: photo.uri }}
                      className="w-[100px] h-[140px] rounded-xl"
                      style={{ backgroundColor: '#F3F4F6' }}
                    />
                    <View className="absolute top-1 left-1 bg-black/50 px-2 py-0.5 rounded-full">
                      <Text className="text-white text-[10px] font-semibold capitalize">{photo.type}</Text>
                    </View>
                    {photo.weightKg && (
                      <View className="absolute bottom-1 left-1 bg-black/50 px-2 py-0.5 rounded-full">
                        <Text className="text-white text-[10px]">{photo.weightKg}kg</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => confirmDelete(photo.id)}
                      className="absolute top-1 right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                    >
                      <Trash size={10} color="#FFF" weight="fill" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))
      )}

      <Modal visible={showTypePicker} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ backgroundColor: colors.bgCard }}>
            <Text className="text-lg font-bold text-gray-800 text-center mb-4" style={{ color: colors.text }}>
              What type of photo?
            </Text>
            <View className="flex-row gap-3 mb-4">
              {(['front', 'side', 'back'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => savePhoto(type)}
                  className="flex-1 bg-green-50 py-4 rounded-xl items-center"
                >
                  <Text className="text-green-700 font-bold capitalize">{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => { setShowTypePicker(false); setPendingUri(null); }}
              className="py-3 items-center"
            >
              <Text className="text-gray-500 font-semibold" style={{ color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InsightsTab({ colors }: { colors: ThemeColors }) {
  const onboarding = useOnboardingStore();
  const today = todayStr();
  const calorieTarget = onboarding.calorieTarget || 2000;
  const proteinTarget = onboarding.proteinTargetG || 100;
  const carbsTarget = onboarding.carbsTargetG || 250;
  const fatTarget = onboarding.fatTargetG || 55;

  const insights = useInsightsStore.getState().getWeeklyInsights(
    today, calorieTarget, proteinTarget, carbsTarget, fatTarget
  );

  const daySummary = useInsightsStore.getState().getDaySummary(
    today, calorieTarget, proteinTarget, carbsTarget, fatTarget
  );

  const goalCompletionPct = calorieTarget > 0
    ? Math.min(100, Math.round((daySummary.calories / calorieTarget) * 100))
    : 0;

  return (
    <View>
      <View
        className="bg-white rounded-2xl border border-gray-100 p-5 mb-4"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      >
        <View className="flex-row items-center mb-4">
          <ChartBar size={20} color={COLORS.primary} weight="fill" />
          <Text className="text-base font-bold text-gray-800 ml-2" style={{ color: colors.text }}>Nutrition Insights</Text>
        </View>

        <View className="flex-row flex-wrap gap-3 mb-4">
          <View className="flex-1 min-w-[45%] bg-green-50 rounded-xl p-4">
            <Text className="text-xs text-green-600 font-semibold mb-1">Avg Daily Calories</Text>
            <Text className="text-2xl font-bold text-green-700">{insights.avgCalories}</Text>
            <Text className="text-xs text-green-500 mt-1">target: {calorieTarget}</Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-blue-50 rounded-xl p-4">
            <Text className="text-xs text-blue-600 font-semibold mb-1">Avg Protein</Text>
            <Text className="text-2xl font-bold text-blue-700">{insights.avgProtein}g</Text>
            <Text className="text-xs text-blue-500 mt-1">target: {proteinTarget}g</Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-amber-50 rounded-xl p-4">
            <Text className="text-xs text-amber-600 font-semibold mb-1">Avg Carbs</Text>
            <Text className="text-2xl font-bold text-amber-700">{insights.avgCarbs}g</Text>
            <Text className="text-xs text-amber-500 mt-1">target: {carbsTarget}g</Text>
          </View>
          <View className="flex-1 min-w-[45%] bg-pink-50 rounded-xl p-4">
            <Text className="text-xs text-pink-600 font-semibold mb-1">Avg Fat</Text>
            <Text className="text-2xl font-bold text-pink-700">{insights.avgFat}g</Text>
            <Text className="text-xs text-pink-500 mt-1">target: {fatTarget}g</Text>
          </View>
        </View>
      </View>

      <View
        className="bg-white rounded-2xl border border-gray-100 p-5 mb-4"
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
      >
        <Text className="text-sm font-bold text-gray-700 mb-3" style={{ color: colors.textSecondary }}>Goal Completion</Text>
        <View className="flex-row gap-3 mb-4">
          <View
            className="flex-1 items-center bg-gray-50 rounded-xl p-3"
            style={{ backgroundColor: colors.bgInput }}
          >
            <Trophy size={20} color="#F59E0B" weight="fill" />
            <Text className="text-xl font-bold text-gray-800 mt-1" style={{ color: colors.text }}>{insights.calorieTargetMet}</Text>
            <Text className="text-[10px] text-gray-400" style={{ color: colors.textMuted }}>Cal Target Met</Text>
          </View>
          <View
            className="flex-1 items-center bg-gray-50 rounded-xl p-3"
            style={{ backgroundColor: colors.bgInput }}
          >
            <Barbell size={20} color="#3B82F6" weight="fill" />
            <Text className="text-xl font-bold text-gray-800 mt-1" style={{ color: colors.text }}>{insights.proteinTargetMet}</Text>
            <Text className="text-[10px] text-gray-400" style={{ color: colors.textMuted }}>Protein Target Met</Text>
          </View>
          <View
            className="flex-1 items-center bg-gray-50 rounded-xl p-3"
            style={{ backgroundColor: colors.bgInput }}
          >
            <Star size={20} color={COLORS.primary} weight="fill" />
            <Text className="text-xl font-bold text-gray-800 mt-1" style={{ color: colors.text }}>{insights.streak}</Text>
            <Text className="text-[10px] text-gray-400" style={{ color: colors.textMuted }}>Day Streak</Text>
          </View>
        </View>

        <View
          className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2"
          style={{ backgroundColor: colors.bgInput }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${goalCompletionPct}%`,
              backgroundColor: goalCompletionPct <= 100 ? COLORS.primary : COLORS.error,
            }}
          />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-400" style={{ color: colors.textMuted }}>
            Today: {daySummary.calories} / {calorieTarget} kcal
          </Text>
          <Text className="text-xs font-semibold" style={{ color: COLORS.primary }}>
            {goalCompletionPct}%
          </Text>
        </View>
      </View>

      {insights.bestDay && (
        <View
          className="bg-white rounded-2xl border border-gray-100 p-5 mb-4"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <Text className="text-sm font-bold text-gray-700 mb-3" style={{ color: colors.textSecondary }}>Highlights</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-green-50 rounded-xl p-3">
              <Text className="text-xs text-green-600 font-semibold mb-1">Best Day</Text>
              <Text className="text-lg font-bold text-green-700">{insights.bestDay}</Text>
            </View>
            {insights.worstDay && (
              <View className="flex-1 bg-red-50 rounded-xl p-3">
                <Text className="text-xs text-red-500 font-semibold mb-1">Needs Work</Text>
                <Text className="text-lg font-bold text-red-600">{insights.worstDay}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {insights.topFoods.length > 0 && (
        <View
          className="bg-white rounded-2xl border border-gray-100 p-5 mb-4"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
        >
          <Text className="text-sm font-bold text-gray-700 mb-3" style={{ color: colors.textSecondary }}>Most Eaten Foods</Text>
          {insights.topFoods.map((food, i) => (
            <View
              key={i}
              className="flex-row items-center justify-between py-2 border-b border-gray-50"
              style={{ borderColor: colors.borderLight }}
            >
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center mr-3">
                  <Text className="text-xs font-bold text-green-600">{i + 1}</Text>
                </View>
                <Text className="text-sm text-gray-700" style={{ color: colors.textSecondary }}>{food.name}</Text>
              </View>
              <Text className="text-sm font-semibold text-gray-500" style={{ color: colors.textSecondary }}>{food.count}x</Text>
            </View>
          ))}
        </View>
      )}

      <View className="h-8" />
    </View>
  );
}
