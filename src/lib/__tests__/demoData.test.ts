import { seedDemoData } from '@/src/lib/demoData';
import { usePrivacyStore } from '@/src/stores/privacy';
import { useOnboardingStore } from '@/src/stores/onboarding';
import { useDiaryStore } from '@/src/stores/diary';
import { useWorkoutStore } from '@/src/stores/workout';
import { useBodyStore } from '@/src/stores/body';
import { useWaterStore } from '@/src/stores/water';
import { useMeditationStore } from '@/src/stores/meditation';

describe('seedDemoData', () => {
  beforeEach(() => {
    usePrivacyStore.setState({ consentAccepted: false, termsAccepted: false, policyVersion: null, acceptedAt: null, newsletterOptIn: false, analyticsOptIn: false, aiOptIn: false });
    useOnboardingStore.setState({ step: 0, completed: false, goal: null, sex: null, dateOfBirth: null, heightCm: null, weightKg: null, activityLevel: null, dietaryPreference: null, dietaryPreferences: [], allergies: [], excludedIngredients: [], unitSystem: 'metric', fastingEnabled: false, fastingPlan: '16:8', targetWeightKg: null, weeklyChangeKg: null, newsletterOptIn: false, calorieTarget: 2000, proteinTargetG: 100, carbsTargetG: 200, fatTargetG: 55 });
    useDiaryStore.setState({ entries: [], recentFoods: [] });
    useWorkoutStore.setState({ activeWorkout: null, history: [], personalRecords: {} });
    useBodyStore.setState({ weightEntries: [], measurements: [] });
    useWaterStore.setState({ waterMl: {} });
    useMeditationStore.setState({ sessions: [], totalMinutes: 0, streak: 0, lastSessionDate: null });
  });

  it('accepts consent so the privacy gate is skipped', () => {
    seedDemoData();
    expect(usePrivacyStore.getState().consentAccepted).toBe(true);
    // Optional choices stay off by default even in the demo, consistent with
    // the app's local-first, opt-in-later design.
    expect(usePrivacyStore.getState().analyticsOptIn).toBe(false);
  });

  it('completes onboarding with an internally-consistent profile', () => {
    seedDemoData();
    const state = useOnboardingStore.getState();
    expect(state.completed).toBe(true);
    expect(state.goal).toBe('lose_weight');
    expect(state.calorieTarget).toBeGreaterThan(0);
    expect(state.proteinTargetG).toBeGreaterThan(0);
  });

  it('logs a full day of meals', () => {
    seedDemoData();
    const entries = useDiaryStore.getState().entries;
    expect(entries).toHaveLength(4);
    expect(new Set(entries.map((e) => e.meal_slot))).toEqual(new Set(['breakfast', 'lunch', 'dinner', 'snack']));
  });

  it('seeds water, weight trend, a completed workout, and a meditation session', () => {
    seedDemoData();
    expect(Object.values(useWaterStore.getState().waterMl).some((ml) => ml > 0)).toBe(true);
    expect(useBodyStore.getState().weightEntries.length).toBeGreaterThanOrEqual(3);
    expect(useWorkoutStore.getState().history).toHaveLength(1);
    expect(useWorkoutStore.getState().history[0].completed).toBe(true);
    expect(useMeditationStore.getState().sessions).toHaveLength(1);
  });

  it('is idempotent enough to call twice without crashing', () => {
    expect(() => {
      seedDemoData();
      seedDemoData();
    }).not.toThrow();
  });
});
