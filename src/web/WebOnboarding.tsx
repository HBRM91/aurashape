import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, useWindowDimensions } from 'react-native';
import { useOnboardingStore } from '@/src/stores/onboarding';
import type { Goal, ActivityLevel, DietaryPreference, FastingPlan } from '@/src/types';
import { WebButton } from '@/src/web/WebButton';
import { WEB_TOKENS } from '@/src/web/tokens';
import { calculateTDEE, calculateMacros } from '@/src/lib/calculator';

const GOALS: { value: Goal; label: string; emoji: string }[] = [
  { value: 'lose_weight', label: 'Lose Weight', emoji: '⚖️' },
  { value: 'build_muscle', label: 'Build Muscle', emoji: '💪' },
  { value: 'maintain', label: 'Maintain', emoji: '🎯' },
  { value: 'improve_health', label: 'Improve Health', emoji: '❤️' },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'lightly_active', label: 'Lightly Active', desc: 'Desk job, little exercise' },
  { value: 'moderately_active', label: 'Moderately Active', desc: 'Exercise 3-5x/week' },
  { value: 'active', label: 'Active', desc: 'Daily exercise, physical job' },
  { value: 'very_active', label: 'Very Active', desc: 'Athlete, intense daily training' },
];

const DIETS: { value: DietaryPreference; label: string }[] = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'keto', label: 'Keto' },
  { value: 'high_protein', label: 'High Protein' },
];

const FASTING_PLANS: { value: FastingPlan; label: string; desc: string }[] = [
  { value: '16:8', label: '16:8', desc: 'Recommended' },
  { value: '14:10', label: '14:10', desc: 'Beginner' },
  { value: '18:6', label: '18:6', desc: 'Intermediate' },
  { value: '20:4', label: '20:4', desc: 'Advanced' },
  { value: '5:2', label: '5:2', desc: '5 eat, 2 fast' },
  { value: 'custom', label: 'Custom', desc: 'Set your own hours' },
];

export function WebOnboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const onboarding = useOnboardingStore();
  const [form, setForm] = useState({
    goal: onboarding.goal,
    sex: onboarding.sex,
    dob: onboarding.dateOfBirth || '',
    height: onboarding.heightCm?.toString() || '',
    weight: onboarding.weightKg?.toString() || '',
    targetWeight: '',
    activityLevel: onboarding.activityLevel,
    diet: onboarding.dietaryPreference,
    fastingPlan: onboarding.fastingPlan || '16:8',
    email: '',
  });
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const totalSteps = 6;

  const computeSummary = () => {
    const h = parseFloat(form.height) || 170;
    const w = parseFloat(form.weight) || 70;
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
    onboarding.setField('goal', form.goal);
    onboarding.setField('sex', form.sex);
    onboarding.setField('dateOfBirth', form.dob || null);
    onboarding.setField('heightCm', parseFloat(form.height) || null);
    onboarding.setField('weightKg', parseFloat(form.weight) || null);
    onboarding.setField('activityLevel', form.activityLevel);
    onboarding.setField('dietaryPreference', form.diet);
    onboarding.setField('fastingPlan', form.fastingPlan);
    onboarding.setField('newsletterOptIn', !!form.email);
    const summary = computeSummary();
    onboarding.setTargets({ calorieTarget: summary.calories, proteinTargetG: summary.protein, carbsTargetG: summary.carbs, fatTargetG: summary.fat });
    const uid = require('@/src/stores/auth').useAuthStore.getState().user?.id || '';
    onboarding.saveProfile(uid).then(() => onComplete());
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: WEB_TOKENS.colors.page }} contentContainerStyle={{ maxWidth: WEB_TOKENS.contentWidths.desktop, alignSelf: 'center', width: '100%', padding: WEB_TOKENS.spacing.lg }}>
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
          <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 4 }}>Date of Birth</Text>
          <TextInput style={{ padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border, color: WEB_TOKENS.colors.text, marginBottom: 12 }} value={form.dob} onChangeText={(v) => update('dob', v)} placeholder="YYYY-MM-DD" placeholderTextColor={WEB_TOKENS.colors.textMuted} />
          <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 4 }}>Height (cm)</Text>
          <TextInput style={{ padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border, color: WEB_TOKENS.colors.text, marginBottom: 12 }} value={form.height} onChangeText={(v) => update('height', v)} placeholder="170" placeholderTextColor={WEB_TOKENS.colors.textMuted} keyboardType="numeric" />
          <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 4 }}>Current Weight (kg)</Text>
          <TextInput style={{ padding: 12, borderRadius: WEB_TOKENS.radii.sm, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border, color: WEB_TOKENS.colors.text, marginBottom: 12 }} value={form.weight} onChangeText={(v) => update('weight', v)} placeholder="70" placeholderTextColor={WEB_TOKENS.colors.textMuted} keyboardType="numeric" />
          {form.goal && form.goal !== 'maintain' && (
            <>
              <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 4 }}>Target Weight (kg)</Text>
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
          <Text style={{ ...WEB_TOKENS.typography.label, color: WEB_TOKENS.colors.textMuted, marginBottom: 8 }}>Dietary Preference</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {DIETS.map((d) => (
              <TouchableOpacity key={d.value} onPress={() => update('diet', d.value)} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: WEB_TOKENS.radii.pill, backgroundColor: form.diet === d.value ? WEB_TOKENS.colors.secondary : WEB_TOKENS.colors.surface, borderWidth: 2, borderColor: form.diet === d.value ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.border }}>
                <Text style={{ ...WEB_TOKENS.typography.label, color: form.diet === d.value ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.text }}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ ...WEB_TOKENS.typography.heading, color: WEB_TOKENS.colors.text, marginBottom: 8 }}>Intermittent Fasting</Text>
          <Text style={{ ...WEB_TOKENS.typography.body, color: WEB_TOKENS.colors.textMuted, marginBottom: 24 }}>Optional — you can change this anytime.</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: isDesktop ? 500 : '100%' }}>
            {FASTING_PLANS.map((fp) => (
              <TouchableOpacity key={fp.value} onPress={() => update('fastingPlan', fp.value)} style={{ width: isDesktop ? 140 : '42%', padding: 16, borderRadius: WEB_TOKENS.radii.md, backgroundColor: form.fastingPlan === fp.value ? WEB_TOKENS.colors.secondary : WEB_TOKENS.colors.surface, borderWidth: 2, borderColor: form.fastingPlan === fp.value ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.border, alignItems: 'center' }}>
                <Text style={{ ...WEB_TOKENS.typography.subheading, color: form.fastingPlan === fp.value ? WEB_TOKENS.colors.primary : WEB_TOKENS.colors.text }}>{fp.label}</Text>
                <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted }}>{fp.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {step === 4 && (
        <View style={{ maxWidth: 400, alignSelf: 'center', width: '100%', alignItems: 'center' }}>
          <Text style={{ ...WEB_TOKENS.typography.heading, color: WEB_TOKENS.colors.text, marginBottom: 8 }}>Your Plan</Text>
          <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted, marginBottom: 24 }}>🧬 Science-based calculation (Mifflin-St Jeor equation)</Text>
          {(() => {
            try {
              const s = computeSummary();
              return (
                <View style={{ width: '100%', gap: 12 }}>
                  <View style={{ padding: 16, borderRadius: WEB_TOKENS.radii.md, backgroundColor: WEB_TOKENS.colors.surface, borderWidth: 1, borderColor: WEB_TOKENS.colors.border }}>
                    <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted }}>Daily Calories</Text>
                    <Text style={{ ...WEB_TOKENS.typography.display, color: WEB_TOKENS.colors.primary }}>{s.calories}</Text>
                    <Text style={{ ...WEB_TOKENS.typography.caption, color: WEB_TOKENS.colors.textMuted }}>kcal · TDEE: {s.tdee}</Text>
                  </View>
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
          <WebButton label="Next" variant="primary" onPress={() => setStep(step + 1)} />
        ) : (
          <WebButton label="Finish" variant="primary" onPress={handleFinish} />
        )}
      </View>
    </ScrollView>
  );
}
