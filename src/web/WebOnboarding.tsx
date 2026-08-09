import { createElement, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { useOnboardingStore } from '@/src/stores/onboarding';
import type { Goal, ActivityLevel, DietaryPreference, FastingSelection, UnitSystem } from '@/src/types';
import { WebButton } from '@/src/web/WebButton';
import { WEB_TOKENS } from '@/src/web/tokens';
import { calculateTDEE, calculateMacros } from '@/src/lib/calculator';
import { validateOnboardingForm, validateOnboardingStep } from '@/src/lib/onboardingValidation';
import { ALLERGY_OPTIONS, DIETARY_OPTIONS } from '@/src/lib/dietaryProfile';
import { FASTING_PLANS } from '@/src/lib/fastingPlans';
import { buildWeightProjection } from '@/src/lib/goalProjection';
import { cmToIn, inToCm, kgToLb, lbToKg } from '@/src/lib/unitConversion';

const GOALS: { value: Goal; label: string; emoji: string }[] = [
  { value: 'lose_weight', label: 'Lose Weight', emoji: '⚖️' },
  { value: 'build_muscle', label: 'Build Muscle', emoji: '💪' },
  { value: 'maintain', label: 'Maintain', emoji: '🎯' },
  { value: 'improve_health', label: 'Improve Health', emoji: '❤️' },
];

function formatOption(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'lightly_active', label: 'Lightly Active', desc: 'Desk job, little exercise' },
  { value: 'moderately_active', label: 'Moderately Active', desc: 'Exercise 3-5x/week' },
  { value: 'active', label: 'Active', desc: 'Daily exercise, physical job' },
  { value: 'very_active', label: 'Very Active', desc: 'Athlete, intense daily training' },
];

export function WebOnboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const onboarding = useOnboardingStore();
  const [form, setForm] = useState({
    goal: onboarding.goal,
    sex: onboarding.sex,
    dob: onboarding.dateOfBirth || '',
    height: onboarding.heightCm?.toString() || '',
    weight: onboarding.weightKg?.toString() || '',
    targetWeight: onboarding.targetWeightKg?.toString() || '',
    activityLevel: onboarding.activityLevel,
    diet: onboarding.dietaryPreference,
    dietaryPreferences: onboarding.dietaryPreferences.length ? onboarding.dietaryPreferences : onboarding.dietaryPreference ? [onboarding.dietaryPreference] : [],
    allergies: onboarding.allergies,
    unitSystem: onboarding.unitSystem,
    fastingEnabled: onboarding.fastingEnabled,
    fastingPlan: onboarding.fastingPlan || 'none',
    weeklyChange: onboarding.weeklyChangeKg?.toString() || '',
    email: '',
  });
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const update = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const totalSteps = 6;

  const toggleListValue = (key: 'dietaryPreferences' | 'allergies', value: string) => {
    setForm((current) => {
      const values = current[key] as string[];
      const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
      return { ...current, [key]: next, ...(key === 'dietaryPreferences' ? { diet: (next[0] as DietaryPreference | undefined) || null } : {}) };
    });
  };

  const toggleUnits = () => {
    setForm((current) => {
      const nextUnit: UnitSystem = current.unitSystem === 'metric' ? 'imperial' : 'metric';
      const height = Number(current.height);
      const weight = Number(current.weight);
      const target = Number(current.targetWeight);
      return {
        ...current,
        unitSystem: nextUnit,
        height: height > 0 ? String(nextUnit === 'imperial' ? cmToIn(height) : inToCm(height)) : current.height,
        weight: weight > 0 ? String(nextUnit === 'imperial' ? kgToLb(weight) : lbToKg(weight)) : current.weight,
        targetWeight: target > 0 ? String(nextUnit === 'imperial' ? kgToLb(target) : lbToKg(target)) : current.targetWeight,
      };
    });
  };

  const canonicalMetrics = () => ({
    heightCm: form.unitSystem === 'imperial' ? inToCm(Number(form.height)) : Number(form.height),
    weightKg: form.unitSystem === 'imperial' ? lbToKg(Number(form.weight)) : Number(form.weight),
    targetWeightKg: form.targetWeight ? (form.unitSystem === 'imperial' ? lbToKg(Number(form.targetWeight)) : Number(form.targetWeight)) : null,
  });

  const validationForm = () => {
    const metrics = canonicalMetrics();
    return {
      goal: form.goal,
      sex: form.sex,
      dob: form.dob,
      height: String(metrics.heightCm || ''),
      weight: String(metrics.weightKg || ''),
      activityLevel: form.activityLevel,
      diet: form.diet,
      targetWeight: form.goal === 'lose_weight' || form.goal === 'build_muscle' ? (metrics.targetWeightKg ? String(metrics.targetWeightKg) : '') : undefined,
      weeklyChange: form.goal === 'lose_weight' ? (form.weeklyChange ? String(form.unitSystem === 'imperial' ? lbToKg(Number(form.weeklyChange)) : Number(form.weeklyChange)) : '') : undefined,
    };
  };

  const computeSummary = () => {
    const metrics = canonicalMetrics();
    const h = metrics.heightCm || 170;
    const w = metrics.weightKg || 70;
    const age = form.dob ? new Date().getFullYear() - new Date(form.dob).getFullYear() : 30;
    const tdee = calculateTDEE({
      weightKg: w,
      heightCm: h,
      age,
      sex: (form.sex as 'male' | 'female') || 'male',
    }, form.activityLevel || 'moderately_active');
    const goal = form.goal || 'maintain';
    const targetCalories = goal === 'lose_weight' ? tdee - 500 : goal === 'build_muscle' ? tdee + 300 : tdee;
    const macros = calculateMacros(targetCalories, goal, w);
    return {
      tdee: `${tdee} kcal`,
      calories: macros.calorieTarget,
      protein: macros.proteinG,
      carbs: macros.carbsG,
      fat: macros.fatG,
    };
  };

  const handleFinish = () => {
    const errors = validateOnboardingForm(validationForm());
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    onboarding.setField('goal', form.goal);
    onboarding.setField('sex', form.sex);
    onboarding.setField('dateOfBirth', form.dob || null);
    const metrics = canonicalMetrics();
    onboarding.setField('heightCm', metrics.heightCm || null);
    onboarding.setField('weightKg', metrics.weightKg || null);
    onboarding.setField('activityLevel', form.activityLevel);
    onboarding.setField('dietaryPreference', form.diet);
    onboarding.setField('dietaryPreferences', form.dietaryPreferences as DietaryPreference[]);
    onboarding.setField('allergies', form.allergies);
    onboarding.setField('unitSystem', form.unitSystem);
    onboarding.setField('fastingEnabled', form.fastingPlan !== 'none');
    onboarding.setField('fastingPlan', form.fastingEnabled ? form.fastingPlan as FastingSelection : 'none');
    onboarding.setField('targetWeightKg', metrics.targetWeightKg);
    onboarding.setField('weeklyChangeKg', form.weeklyChange ? (form.unitSystem === 'imperial' ? lbToKg(Number(form.weeklyChange)) : Number(form.weeklyChange)) : null);
    onboarding.setField('newsletterOptIn', !!form.email);
    const summary = computeSummary();
    onboarding.setTargets({ calorieTarget: summary.calories, proteinTargetG: summary.protein, carbsTargetG: summary.carbs, fatTargetG: summary.fat });
    const uid = require('@/src/stores/auth').useAuthStore.getState().user?.id || '';
    onboarding.saveProfile(uid).then(() => onComplete());
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: WEB_TOKENS.colors.page }} contentContainerStyle={{ maxWidth: WEB_TOKENS.contentWidths.desktop, alignSelf: 'center', width: '100%', padding: WEB_TOKENS.spacing.lg }}>
      {Object.keys(validationErrors).length > 0 && (
        <View style={{ padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.errorSurface, borderWidth: 1, borderColor: WEB_TOKENS.colors.errorBorder, marginBottom: 16 }}>
          <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.error }}>Complete the highlighted onboarding details before continuing.</Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: WEB_TOKENS.spacing.xl }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View key={i} style={{ width: 32, height: 6, borderRadius: 3, backgroundColor: i <= step ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.border }} />
        ))}
      </View>

      {step === 0 && (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ ...WEB_TOKENS.typography.heading, color: WEB_TOKENS.colors.text, marginBottom: 8 }}>What's your goal?</Text>
          <Text style={{ ...WEB_TOKENS.typography.body, color: WEB_TOKENS.colors.textMuted, marginBottom: 24 }}>This helps us calculate your nutrition targets.</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: isDesktop ? 600 : '100%' }}>
            {GOALS.map((g) => (
              <TouchableOpacity key={g.value} onPress={() => update('goal', g.value)} style={{ width: isDesktop ? 140 : '45%', padding: 20, borderRadius: WEB_TOKENS.radii.md, backgroundColor: form.goal === g.value ? WEB_TOKENS.colors.secondary : WEB_TOKENS.colors.surface, borderWidth: 2, borderColor: form.goal === g.value ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.border, alignItems: 'center' }}>
                <Text style={{ fontSize: 32 }}>{g.emoji}</Text>
                <Text style={{ ...WEB_TOKENS.typography.label, color: form.goal === g.value ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.text, marginTop: 8, textAlign: 'center' }}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {step === 1 && (
        <View style={{ maxWidth: 400, alignSelf: 'center', width: '100%' }}>
          <Text style={{ ...WEB_TOKENS.typography.heading, color: WEB_TOKENS.colors.text, marginBottom: 8, textAlign: 'center' }}>About you</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => update('sex', 'male')} style={{ flex: 1, padding: 12, borderRadius: WEB_TOKENS.radii.md, backgroundColor: form.sex === 'male' ? WEB_TOKENS.colors.secondary : WEB_TOKENS.colors.surface, borderWidth: 2, borderColor: form.sex === 'male' ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.border, alignItems: 'center' }}>
              <Text style={{ ...WEB_TOKENS.typography.label, color: form.sex === 'male' ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.text }}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => update('sex', 'female')} style={{ flex: 1, padding: 12, borderRadius: WEB_TOKENS.radii.md, backgroundColor: form.sex === 'female' ? WEB_TOKENS.colors.secondary : WEB_TOKENS.colors.surface, borderWidth: 2, borderColor: form.sex === 'female' ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.border, alignItems: 'center' }}>
              <Text style={{ ...WEB_TOKENS.typography.label, color: form.sex === 'female' ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.text }}>Female</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 4 }}>Date of birth</Text>
          {Platform.OS === 'web' ? createElement('input', { type: 'date', value: form.dob, onChange: (event: { target: { value: string } }) => update('dob', event.target.value), 'aria-label': 'Date of birth', style: { padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.surface, border: `1px solid ${WEB_TOKENS.colors.border}`, color: WEB_TOKENS.colors.text, marginBottom: 12, fontSize: 16, width: '100%' } }) : <TextInput style={{ padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border, color: WEB_TOKENS.colors.text, marginBottom: 12 }} value={form.dob} onChangeText={(v) => update('dob', v)} placeholder="YYYY-MM-DD" placeholderTextColor={WEB_TOKENS.colors.textMuted} />}
          <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted }}>Units</Text>
            <TouchableOpacity accessibilityRole="switch" accessibilityLabel="Toggle metric and imperial units" accessibilityState={{ checked: form.unitSystem === 'imperial' }} onPress={toggleUnits} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: WEB_TOKENS.radii.pill, backgroundColor: WEB_TOKENS.colors.secondary }}>
              <Text style={{ ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.primary }}>{form.unitSystem === 'metric' ? 'Metric (kg / cm)' : 'Imperial (lb / in)'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 4 }}>Height ({form.unitSystem === 'metric' ? 'cm' : 'in'})</Text>
          <TextInput style={{ padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border, color: WEB_TOKENS.colors.text, marginBottom: 12 }} value={form.height} onChangeText={(v) => update('height', v)} placeholder="170" placeholderTextColor={WEB_TOKENS.colors.textMuted} keyboardType="numeric" />
          <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 4 }}>Current weight ({form.unitSystem === 'metric' ? 'kg' : 'lb'})</Text>
          <TextInput style={{ padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border, color: WEB_TOKENS.colors.text, marginBottom: 12 }} value={form.weight} onChangeText={(v) => update('weight', v)} placeholder="70" placeholderTextColor={WEB_TOKENS.colors.textMuted} keyboardType="numeric" />
          {(form.goal === 'lose_weight' || form.goal === 'build_muscle') && (
            <>
              <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 4 }}>Target weight ({form.unitSystem === 'metric' ? 'kg' : 'lb'})</Text>
              <TextInput style={{ padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border, color: WEB_TOKENS.colors.text }} value={form.targetWeight} onChangeText={(v) => update('targetWeight', v)} placeholder={form.weight} placeholderTextColor={WEB_TOKENS.colors.textMuted} keyboardType="numeric" />
            </>
          )}
        </View>
      )}

      {step === 2 && (
        <View style={{ maxWidth: 500, alignSelf: 'center', width: '100%' }}>
          <Text style={{ ...WEB_TOKENS.typography.heading, color: WEB_TOKENS.colors.text, marginBottom: 16, textAlign: 'center' }}>Activity & Diet</Text>
          <Text style={{ ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.textMuted, marginBottom: 8 }}>Activity Level</Text>
          <View style={{ gap: 8, marginBottom: 24 }}>
            {ACTIVITY_LEVELS.map((a) => (
              <TouchableOpacity key={a.value} onPress={() => update('activityLevel', a.value)} style={{ padding: 12, borderRadius: WEB_TOKENS.radii.md, backgroundColor: form.activityLevel === a.value ? WEB_TOKENS.colors.secondary : WEB_TOKENS.colors.surface, borderWidth: 2, borderColor: form.activityLevel === a.value ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.border }}>
                <Text style={{ ...WEB_TOKENS.typography.label, color: form.activityLevel === a.value ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.text }}>{a.label}</Text>
                <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted }}>{a.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.textMuted, marginBottom: 8 }}>Dietary preferences (choose all that fit)</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {DIETARY_OPTIONS.map((diet) => (
              <TouchableOpacity key={diet} accessibilityRole="checkbox" accessibilityState={{ checked: form.dietaryPreferences.includes(diet) }} onPress={() => toggleListValue('dietaryPreferences', diet)} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: WEB_TOKENS.radii.pill, backgroundColor: form.dietaryPreferences.includes(diet) ? WEB_TOKENS.colors.secondary : WEB_TOKENS.colors.surface, borderWidth: 2, borderColor: form.dietaryPreferences.includes(diet) ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.border }}>
                <Text style={{ ...WEB_TOKENS.typography.label, color: form.dietaryPreferences.includes(diet) ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.text }}>{formatOption(diet)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.textMuted, marginBottom: 8, marginTop: 20 }}>Allergies and exclusions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ALLERGY_OPTIONS.map((allergy) => (
              <TouchableOpacity key={allergy} accessibilityRole="checkbox" accessibilityState={{ checked: form.allergies.includes(allergy) }} onPress={() => toggleListValue('allergies', allergy)} style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: WEB_TOKENS.radii.pill, backgroundColor: form.allergies.includes(allergy) ? WEB_TOKENS.colors.errorSurface : WEB_TOKENS.colors.surface, borderWidth: 2, borderColor: form.allergies.includes(allergy) ? WEB_TOKENS.colors.error : WEB_TOKENS.colors.border }}>
                <Text style={{ ...WEB_TOKENS.typography.caption, color: form.allergies.includes(allergy) ? WEB_TOKENS.colors.error : WEB_TOKENS.colors.text }}>{formatOption(allergy)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ ...WEB_TOKENS.typography.heading, color: WEB_TOKENS.colors.text, marginBottom: 8 }}>Intermittent Fasting</Text>
          <Text style={{ ...WEB_TOKENS.typography.body, color: WEB_TOKENS.colors.textMuted, marginBottom: 24, maxWidth: 580, textAlign: 'center' }}>Optional — select a schedule only if it fits your life. Aurashape does not provide medical clearance for fasting.</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: isDesktop ? 640 : '100%' }}>
            {(Object.entries(FASTING_PLANS) as Array<[FastingSelection, typeof FASTING_PLANS[keyof typeof FASTING_PLANS]]>).map(([value, plan]) => (
              <TouchableOpacity key={value} accessibilityRole="radio" accessibilityState={{ selected: form.fastingPlan === value }} onPress={() => update('fastingPlan', value)} style={{ width: isDesktop ? 180 : '44%', padding: 16, borderRadius: WEB_TOKENS.radii.md, backgroundColor: form.fastingPlan === value ? WEB_TOKENS.colors.secondary : WEB_TOKENS.colors.surface, borderWidth: 2, borderColor: form.fastingPlan === value ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.border, alignItems: 'center' }}>
                <Text style={{ ...WEB_TOKENS.typography.subheading, color: form.fastingPlan === value ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.text }}>{plan.label}</Text>
                <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, textAlign: 'center' }}>{plan.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {form.fastingPlan !== 'none' ? <View style={{ maxWidth: 600, marginTop: 18, padding: 14, borderRadius: WEB_TOKENS.radii.md, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border }}><Text style={{ ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.text }}>Tradeoffs</Text><Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginTop: 4 }}>{FASTING_PLANS[form.fastingPlan as keyof typeof FASTING_PLANS].tradeoffs}</Text><Text style={{ ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.text, marginTop: 10 }}>Safety</Text><Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginTop: 4 }}>{FASTING_PLANS[form.fastingPlan as keyof typeof FASTING_PLANS].safety}</Text></View> : null}
        </View>
      )}

      {step === 4 && (
        <View style={{ maxWidth: 400, alignSelf: 'center', width: '100%', alignItems: 'center' }}>
          <Text style={{ ...WEB_TOKENS.typography.heading, color: WEB_TOKENS.colors.text, marginBottom: 8 }}>Set your timeline</Text>
          <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 24, textAlign: 'center' }}>A steady trend is easier to maintain. You can change this later.</Text>
          {form.goal !== 'maintain' ? <>
            <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 4, alignSelf: 'stretch' }}>Target weight ({form.unitSystem === 'metric' ? 'kg' : 'lb'})</Text>
            <TextInput accessibilityLabel="Target weight" style={{ width: '100%', padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border, color: WEB_TOKENS.colors.text, marginBottom: 14 }} value={form.targetWeight} onChangeText={(v) => update('targetWeight', v)} placeholder={form.weight} placeholderTextColor={WEB_TOKENS.colors.textMuted} keyboardType="numeric" />
          </> : null}
          {form.goal === 'lose_weight' ? <>
            <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 4, alignSelf: 'stretch' }}>Desired weekly loss ({form.unitSystem === 'metric' ? 'kg' : 'lb'})</Text>
            <TextInput accessibilityLabel="Desired weekly loss" style={{ width: '100%', padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border, color: WEB_TOKENS.colors.text, marginBottom: 14 }} value={form.weeklyChange} onChangeText={(v) => update('weeklyChange', v)} placeholder={form.unitSystem === 'metric' ? '0.5' : '1.1'} placeholderTextColor={WEB_TOKENS.colors.textMuted} keyboardType="numeric" />
            <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 16, textAlign: 'center' }}>A conservative starting range is about 0.25–1% of body weight per week.</Text>
          </> : null}
          {(() => {
            try {
              const metrics = canonicalMetrics();
              const s = computeSummary();
              const weeklyKg = form.weeklyChange ? (form.unitSystem === 'imperial' ? lbToKg(Number(form.weeklyChange)) : Number(form.weeklyChange)) : 0;
              const projection = metrics.targetWeightKg && weeklyKg ? buildWeightProjection({ currentKg: metrics.weightKg, targetKg: metrics.targetWeightKg, weeklyChangeKg: form.goal === 'lose_weight' ? -weeklyKg : weeklyKg, startDate: new Date().toISOString().slice(0, 10) }) : [];
              return (
                <View style={{ width: '100%', gap: 12 }}>
                  <View style={{ padding: 16, borderRadius: WEB_TOKENS.radii.md, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border }}>
                    <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted }}>Daily Calories</Text>
                    <Text style={{ ...WEB_TOKENS.typography.display, color: WEB_TOKENS.colors.primary }}>{s.calories}</Text>
                    <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted }}>kcal · TDEE: {s.tdee}</Text>
                  </View>
                  {projection.length > 1 ? <View style={{ padding: 14, borderRadius: WEB_TOKENS.radii.md, backgroundColor: WEB_TOKENS.colors.secondary }}><Text style={{ ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.primary }}>Estimated target date</Text><Text style={{ ...WEB_TOKENS.typography.subheading, color: WEB_TOKENS.colors.text, marginTop: 4 }}>{projection.at(-1)?.date}</Text><Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginTop: 4 }}>{projection.length - 1} weeks at your selected rate. This is a projection, not a promise.</Text></View> : null}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1, padding: 12, borderRadius: WEB_TOKENS.radii.md, backgroundColor: '#EFF6FF', alignItems: 'center' }}>
                      <Text style={{ ...WEB_TOKENS.typography.subheading, color: '#3B82F6' }}>{s.protein}g</Text>
                      <Text style={{ ...WEB_TOKENS.typography.caption, color: '#3B82F6' }}>Protein</Text>
                    </View>
                    <View style={{ flex: 1, padding: 12, borderRadius: WEB_TOKENS.radii.md, backgroundColor: '#FFFBEB', alignItems: 'center' }}>
                      <Text style={{ ...WEB_TOKENS.typography.subheading, color: '#D97706' }}>{s.carbs}g</Text>
                      <Text style={{ ...WEB_TOKENS.typography.caption, color: '#D97706' }}>Carbs</Text>
                    </View>
                    <View style={{ flex: 1, padding: 12, borderRadius: WEB_TOKENS.radii.md, backgroundColor: '#FDF2F8', alignItems: 'center' }}>
                      <Text style={{ ...WEB_TOKENS.typography.subheading, color: '#DB2777' }}>{s.fat}g</Text>
                      <Text style={{ ...WEB_TOKENS.typography.caption, color: '#DB2777' }}>Fat</Text>
                    </View>
                  </View>
                  {form.fastingPlan && form.fastingPlan !== 'custom' && (
                    <View style={{ padding: 12, borderRadius: WEB_TOKENS.radii.md, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border, alignItems: 'center' }}>
                      <Text style={{ ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.textMuted }}>Fasting: {form.fastingPlan}</Text>
                    </View>
                  )}
                </View>
              );
            } catch {
              return <Text style={{ ...WEB_TOKENS.typography.body, color: WEB_TOKENS.colors.textMuted }}>Complete previous steps to see your plan.</Text>;
            }
          })()}
        </View>
      )}

      {step === 5 && (
        <View style={{ maxWidth: 400, alignSelf: 'center', width: '100%', alignItems: 'center' }}>
          <Text style={{ ...WEB_TOKENS.typography.heading, color: WEB_TOKENS.colors.text, marginBottom: 8 }}>Weekly Science Tips</Text>
          <Text style={{ ...WEB_TOKENS.typography.body, color: WEB_TOKENS.colors.textMuted, marginBottom: 24, textAlign: 'center' }}>Get evidence-based health tips every Friday. One-click unsubscribe anytime.</Text>
          <TextInput style={{ width: '100%', padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border, color: WEB_TOKENS.colors.text, marginBottom: 16 }} value={form.email} onChangeText={(v) => update('email', v)} placeholder="your@email.com (optional)" placeholderTextColor={WEB_TOKENS.colors.textMuted} keyboardType="email-address" />
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 }}>
        {step > 0 && <WebButton label="Back" variant="ghost" onPress={() => setStep(step - 1)} />}
        {step < totalSteps - 1 ? (
          <WebButton label="Next" variant="primary" onPress={() => {
            const errors = validateOnboardingStep(validationForm(), step);
            setValidationErrors(errors);
            if (Object.keys(errors).length === 0) setStep(step + 1);
          }} />
        ) : (
          <WebButton label="Finish" variant="primary" onPress={handleFinish} />
        )}
      </View>
    </ScrollView>
  );
}
