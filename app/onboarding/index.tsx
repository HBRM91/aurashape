import { COLORS } from '@/src/constants/theme';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useAuthStore } from '@/src/stores/auth';
import { calculateTDEE, calculateMacros } from '@/src/lib/calculator';
import { router } from 'expo-router';
import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import type { Goal, ActivityLevel, DietaryPreference, FastingPlan } from '@/src/types';

const GOAL_OPTIONS: { value: Goal; label: string; emoji: string }[] = [
  { value: 'lose_weight', label: 'Lose Weight', emoji: '⚖️' },
  { value: 'build_muscle', label: 'Build Muscle', emoji: '💪' },
  { value: 'maintain', label: 'Maintain', emoji: '🎯' },
  { value: 'improve_health', label: 'Improve Health', emoji: '🧬' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; hint: string }[] = [
  { value: 'lightly_active', label: 'Lightly Active', hint: 'Desk job, little exercise' },
  { value: 'moderately_active', label: 'Moderately Active', hint: 'Exercise 3-5×/week' },
  { value: 'active', label: 'Active', hint: 'Daily exercise or physical job' },
  { value: 'very_active', label: 'Very Active', hint: 'Intense daily training' },
];

const DIET_OPTIONS: { value: DietaryPreference; label: string }[] = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'high_protein', label: 'High Protein' },
];

const FASTING_OPTIONS: { value: FastingPlan; label: string }[] = [
  { value: '14:10', label: '14:10 (Beginner)' },
  { value: '16:8', label: '16:8 (Recommended)' },
  { value: '18:6', label: '18:6 (Intermediate)' },
  { value: '20:4', label: '20:4 (Advanced)' },
  { value: '5:2', label: '5:2 (2 days restricted)' },
  { value: '6:1', label: '6:1 (1 day restricted)' },
  { value: 'custom', label: 'Custom' },
];

const SEX_OPTIONS = ['male', 'female'] as const;

function OnboardingProgress({ step }: { step: number }) {
  return (
    <View className="mb-8 flex-row gap-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <View
          key={i}
          className="h-1 flex-1 rounded-full"
          style={{ backgroundColor: i <= step ? COLORS.primary : '#E5E7EB' }}
        />
      ))}
    </View>
  );
}

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
}

function StepGoal({ onNext }: StepProps) {
  const { goal, setField } = useOnboardingStore();

  return (
    <View className="flex-1 px-6 pt-4">
      <Text className="mb-2 text-2xl font-bold" style={{ color: COLORS.primaryDark }}>
        What's your goal?
      </Text>
      <Text className="mb-6 text-gray-500">This helps us calculate your targets.</Text>
      {GOAL_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          className="mb-3 rounded-xl border p-4 flex-row items-center gap-4"
          style={{ borderColor: goal === opt.value ? COLORS.primary : '#E5E7EB' }}
          onPress={() => { setField('goal', opt.value); onNext(); }}
        >
          <Text className="text-2xl">{opt.emoji}</Text>
          <Text className="text-lg font-medium">{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StepBodyInfo({ onNext, onBack }: StepProps) {
  const { sex, dateOfBirth, heightCm, weightKg, setField } = useOnboardingStore();
  const [localSex, setLocalSex] = useState(sex);
  const [localDob, setLocalDob] = useState(dateOfBirth || '');
  const [localHeight, setLocalHeight] = useState(heightCm ? String(heightCm) : '');
  const [localWeight, setLocalWeight] = useState(weightKg ? String(weightKg) : '');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!localSex || !localDob || !localHeight || !localWeight) {
      setError('Please fill in all fields');
      return;
    }
    const dob = new Date(localDob);
    if (isNaN(dob.getTime())) {
      setError('Invalid date format (YYYY-MM-DD)');
      return;
    }
    setField('sex', localSex);
    setField('dateOfBirth', localDob);
    setField('heightCm', Number(localHeight));
    setField('weightKg', Number(localWeight));
    onNext();
  };

  return (
    <View className="flex-1 px-6 pt-4">
      <Text className="mb-2 text-2xl font-bold" style={{ color: COLORS.primaryDark }}>
        Tell us about yourself
      </Text>
      <Text className="mb-6 text-gray-500">This is used to calculate your calorie targets.</Text>

      {error ? (
        <View className="mb-4 rounded-lg bg-red-50 p-3">
          <Text className="text-center text-red-500">{error}</Text>
        </View>
      ) : null}

      <Text className="mb-2 text-sm font-medium text-gray-600">Biological sex</Text>
      <View className="mb-4 flex-row gap-3">
        {SEX_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            className="flex-1 rounded-xl border py-3"
            style={{
              borderColor: localSex === s ? COLORS.primary : '#E5E7EB',
              backgroundColor: localSex === s ? '#F0FDF4' : 'transparent',
            }}
            onPress={() => setLocalSex(s)}
          >
            <Text className="text-center font-medium capitalize">{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="mb-2 text-sm font-medium text-gray-600">Date of birth (YYYY-MM-DD)</Text>
      <TextInput
        className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base"
        placeholder="1990-01-15"
        value={localDob}
        onChangeText={setLocalDob}
        keyboardType="numbers-and-punctuation"
      />

      <Text className="mb-2 text-sm font-medium text-gray-600">Height (cm)</Text>
      <TextInput
        className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base"
        placeholder="175"
        value={localHeight}
        onChangeText={setLocalHeight}
        keyboardType="numeric"
      />

      <Text className="mb-2 text-sm font-medium text-gray-600">Weight (kg)</Text>
      <TextInput
        className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base"
        placeholder="70"
        value={localWeight}
        onChangeText={setLocalWeight}
        keyboardType="numeric"
      />

      <View className="mt-auto mb-12 flex-row gap-3">
        {onBack && (
          <TouchableOpacity
            className="flex-1 rounded-xl border border-gray-200 py-4"
            onPress={onBack}
          >
            <Text className="text-center text-base font-medium text-gray-600">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="flex-1 rounded-xl py-4"
          style={{ backgroundColor: COLORS.primary }}
          onPress={handleContinue}
        >
          <Text className="text-center text-base font-semibold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StepActivity({ onNext, onBack }: StepProps) {
  const { activityLevel, dietaryPreference, setField } = useOnboardingStore();

  return (
    <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="mb-2 text-2xl font-bold" style={{ color: COLORS.primaryDark }}>
        Your activity level
      </Text>
      <Text className="mb-6 text-gray-500">How active is your daily life?</Text>

      {ACTIVITY_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          className="mb-3 rounded-xl border p-4"
          style={{ borderColor: activityLevel === opt.value ? COLORS.primary : '#E5E7EB' }}
          onPress={() => setField('activityLevel', opt.value)}
        >
          <Text className="text-base font-medium">{opt.label}</Text>
          <Text className="text-sm text-gray-400">{opt.hint}</Text>
        </TouchableOpacity>
      ))}

      <Text className="mb-4 mt-6 text-2xl font-bold" style={{ color: COLORS.primaryDark }}>
        Dietary preference
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {DIET_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            className="rounded-xl border px-5 py-3"
            style={{
              borderColor: dietaryPreference === opt.value ? COLORS.primary : '#E5E7EB',
              backgroundColor: dietaryPreference === opt.value ? '#F0FDF4' : 'transparent',
            }}
            onPress={() => setField('dietaryPreference', opt.value)}
          >
            <Text className="text-base font-medium">{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="mt-8 flex-row gap-3">
        {onBack && (
          <TouchableOpacity
            className="flex-1 rounded-xl border border-gray-200 py-4"
            onPress={onBack}
          >
            <Text className="text-center text-base font-medium text-gray-600">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="flex-1 rounded-xl py-4"
          style={{
            backgroundColor: activityLevel && dietaryPreference ? COLORS.primary : '#D1D5DB',
          }}
          onPress={() => { if (activityLevel && dietaryPreference) onNext(); }}
          disabled={!activityLevel || !dietaryPreference}
        >
          <Text className="text-center text-base font-semibold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function StepFasting({ onNext, onBack }: StepProps) {
  const { fastingPlan, setField } = useOnboardingStore();

  return (
    <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="mb-2 text-2xl font-bold" style={{ color: COLORS.primaryDark }}>
        Intermittent fasting
      </Text>
      <Text className="mb-6 text-gray-500">
        Choose a fasting plan. You can change this anytime.
      </Text>

      {FASTING_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          className="mb-3 rounded-xl border p-4"
          style={{ borderColor: fastingPlan === opt.value ? COLORS.primary : '#E5E7EB' }}
          onPress={() => setField('fastingPlan', opt.value)}
        >
          <Text className="text-base font-medium">{opt.label}</Text>
        </TouchableOpacity>
      ))}

      <View className="mt-8 flex-row gap-3">
        {onBack && (
          <TouchableOpacity
            className="flex-1 rounded-xl border border-gray-200 py-4"
            onPress={onBack}
          >
            <Text className="text-center text-base font-medium text-gray-600">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="flex-1 rounded-xl py-4"
          style={{ backgroundColor: COLORS.primary }}
          onPress={onNext}
        >
          <Text className="text-center text-base font-semibold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function StepSummary({ onNext, onBack }: StepProps) {
  const state = useOnboardingStore();
  const { goal, sex, dateOfBirth, heightCm, weightKg, activityLevel, dietaryPreference, fastingPlan, setTargets } = state;

  if (!sex || !dateOfBirth || !heightCm || !weightKg || !activityLevel || !goal) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-gray-500">Please go back and complete all fields.</Text>
      </View>
    );
  }

  const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
  const tdee = calculateTDEE({ age, sex, weightKg, heightCm }, activityLevel);
  const macros = calculateMacros(tdee, goal, weightKg);

  const handleNext = () => {
    setTargets({
      calorieTarget: macros.calorieTarget,
      proteinTargetG: macros.proteinG,
      carbsTargetG: macros.carbsG,
      fatTargetG: macros.fatG,
    });
    onNext();
  };

  return (
    <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
      <Text className="mb-2 text-2xl font-bold" style={{ color: COLORS.primaryDark }}>
        Your plan summary
      </Text>
      <Text className="mb-6 text-gray-500">Here's what we calculated based on your inputs.</Text>

      <View className="mb-6 rounded-xl bg-gray-50 p-5">
        <View className="mb-3 flex-row justify-between">
          <Text className="text-gray-500">Daily Calories</Text>
          <Text className="text-xl font-bold" style={{ color: COLORS.primaryDark }}>
            {macros.calorieTarget} kcal
          </Text>
        </View>
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-500">Protein</Text>
          <Text className="font-semibold" style={{ color: '#3B82F6' }}>{macros.proteinG}g</Text>
        </View>
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-500">Carbs</Text>
          <Text className="font-semibold" style={{ color: '#EAB308' }}>{macros.carbsG}g</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-500">Fat</Text>
          <Text className="font-semibold" style={{ color: '#EC4899' }}>{macros.fatG}g</Text>
        </View>
      </View>

      <View className="mb-6 rounded-xl bg-gray-50 p-5">
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-500">Goal</Text>
          <Text className="font-medium capitalize">{goal.replace(/_/g, ' ')}</Text>
        </View>
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-500">Activity</Text>
          <Text className="font-medium capitalize">{activityLevel.replace(/_/g, ' ')}</Text>
        </View>
        <View className="mb-2 flex-row justify-between">
          <Text className="text-gray-500">Diet</Text>
          <Text className="font-medium capitalize">{dietaryPreference?.replace(/_/g, ' ')}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-500">Fasting</Text>
          <Text className="font-medium">{fastingPlan}</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        {onBack && (
          <TouchableOpacity
            className="flex-1 rounded-xl border border-gray-200 py-4"
            onPress={onBack}
          >
            <Text className="text-center text-base font-medium text-gray-600">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="flex-1 rounded-xl py-4"
          style={{ backgroundColor: COLORS.primary }}
          onPress={handleNext}
        >
          <Text className="text-center text-base font-semibold text-white">Looks good!</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function StepNewsletter({ onBack }: StepProps) {
  const { newsletterOptIn, setField } = useOnboardingStore();
  const { saveProfile } = useOnboardingStore();
  const user = useAuthStore((s) => s.user);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    const result = await saveProfile(user.id);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <View className="flex-1 px-6 pt-4">
      <Text className="mb-2 text-2xl font-bold" style={{ color: COLORS.primaryDark }}>
        Stay in the loop
      </Text>
      <Text className="mb-8 text-gray-500">
        Get monthly health tips based on real science. No spam. Unsubscribe anytime.
      </Text>

      {error ? (
        <View className="mb-4 rounded-lg bg-red-50 p-3">
          <Text className="text-center text-red-500">{error}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        className="mb-6 rounded-xl border p-4"
        style={{ borderColor: newsletterOptIn ? COLORS.primary : '#E5E7EB' }}
        onPress={() => setField('newsletterOptIn', !newsletterOptIn)}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-5 w-5 items-center justify-center rounded border"
            style={{
              borderColor: newsletterOptIn ? COLORS.primary : '#9CA3AF',
              backgroundColor: newsletterOptIn ? COLORS.primary : 'transparent',
            }}
          >
            {newsletterOptIn && <Text className="text-xs font-bold text-white">✓</Text>}
          </View>
          <Text className="text-base font-medium">Yes, send me health tips</Text>
        </View>
      </TouchableOpacity>

      <View className="mt-auto mb-12 flex-row gap-3">
        {onBack && (
          <TouchableOpacity
            className="flex-1 rounded-xl border border-gray-200 py-4"
            onPress={onBack}
          >
            <Text className="text-center text-base font-medium text-gray-600">Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className="flex-1 rounded-xl py-4"
          style={{ backgroundColor: COLORS.primary }}
          onPress={handleFinish}
          disabled={saving}
        >
          <Text className="text-center text-base font-semibold text-white">
            {saving ? 'Saving...' : 'Finish'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const { step, setStep } = useOnboardingStore();

  const steps = [
    { component: StepGoal },
    { component: StepBodyInfo },
    { component: StepActivity },
    { component: StepFasting },
    { component: StepSummary },
    { component: StepNewsletter },
  ];

  const CurrentStep = steps[step]?.component ?? StepGoal;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 pt-16">
        <OnboardingProgress step={step} />
        <CurrentStep
          onNext={() => setStep(Math.min(step + 1, steps.length - 1))}
          onBack={step > 0 ? () => setStep(step - 1) : undefined}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
