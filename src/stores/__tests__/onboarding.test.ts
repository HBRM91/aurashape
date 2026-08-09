import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingStore } from '@/src/stores/onboarding';

describe('onboarding persistence', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_DATA_MODE = 'local';
    useOnboardingStore.setState({
      step: 0,
      completed: false,
      goal: null,
      sex: null,
      dateOfBirth: null,
      heightCm: null,
      weightKg: null,
      activityLevel: null,
      dietaryPreference: null,
      dietaryPreferences: ['omnivore'],
      allergies: [],
      excludedIngredients: [],
      unitSystem: 'metric',
      fastingEnabled: false,
      fastingPlan: '16:8',
      targetWeightKg: null,
      weeklyChangeKg: null,
      newsletterOptIn: false,
      calorieTarget: 2000,
      proteinTargetG: 100,
      carbsTargetG: 200,
      fatTargetG: 55,
    });
    (AsyncStorage.setItem as jest.Mock).mockClear();
  });

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_DATA_MODE;
  });

  it('persists local completion after saving a profile', async () => {
    await useOnboardingStore.getState().saveProfile('local-user');

    expect(useOnboardingStore.getState().completed).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'onboarding-storage',
      expect.stringContaining('"completed":true'),
    );
  });

  it('supports optional fasting and richer dietary preferences', () => {
    useOnboardingStore.getState().setField('fastingEnabled', false);
    useOnboardingStore.getState().setField('fastingPlan', 'none');
    useOnboardingStore.getState().setField('dietaryPreferences', ['vegan', 'high_protein']);
    useOnboardingStore.getState().setField('allergies', ['peanuts', 'sesame']);

    expect(useOnboardingStore.getState()).toEqual(expect.objectContaining({
      fastingEnabled: false,
      fastingPlan: 'none',
      dietaryPreferences: ['vegan', 'high_protein'],
      allergies: ['peanuts', 'sesame'],
    }));
  });
});
