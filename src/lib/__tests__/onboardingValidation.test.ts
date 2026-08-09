import { validateOnboardingForm, validateOnboardingStep } from '@/src/lib/onboardingValidation';

describe('validateOnboardingForm', () => {
  it('rejects incomplete body and preference data', () => {
    expect(validateOnboardingForm({
      goal: null,
      sex: null,
      dob: '',
      height: '',
      weight: '',
      activityLevel: null,
      diet: null,
    })).toEqual({
      goal: 'Choose a goal',
      sex: 'Choose an option',
       dob: 'Choose a real date',
       height: 'Enter a height between 100 and 250 cm',
       weight: 'Enter a weight between 30 and 300 kg',
      activityLevel: 'Choose an activity level',
      diet: 'Choose a dietary preference',
    });
  });

  it('accepts a complete onboarding form', () => {
    expect(validateOnboardingForm({
      goal: 'maintain',
      sex: 'female',
      dob: '1990-01-01',
      height: '170',
      weight: '70',
      activityLevel: 'active',
      diet: 'omnivore',
    })).toEqual({});
  });

  it('validates only the fields required by the current step', () => {
    expect(validateOnboardingStep({
      goal: 'maintain',
      sex: null,
      dob: '',
      height: '',
      weight: '',
      activityLevel: null,
      diet: null,
    }, 0)).toEqual({});
  });

  it('rejects impossible dates and unsafe weekly changes', () => {
    expect(validateOnboardingForm({
      goal: 'lose_weight', sex: 'female', dob: '2026-02-30', height: '170', weight: '70',
      activityLevel: 'active', diet: 'omnivore',
    })).toEqual({ dob: 'Choose a real date' });
    expect(validateOnboardingForm({
      goal: 'lose_weight', sex: 'female', dob: '1990-01-01', height: '170', weight: '70',
      activityLevel: 'active', diet: 'omnivore', targetWeight: '60', weeklyChange: '2',
    })).toEqual({ weeklyChange: 'Choose a weekly change up to 1.5 kg' });
  });
});
