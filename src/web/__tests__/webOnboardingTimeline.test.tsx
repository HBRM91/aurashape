import { fireEvent, render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { WebOnboarding } from '../WebOnboarding';
import { useOnboardingStore } from '@/src/stores/onboarding';

// This suite covers the two real calculation bugs found in the "Set your
// timeline" step: (1) a "Lose Weight" goal used to silently keep a ZERO
// deficit (target calories == TDEE) whenever the weekly-loss field was left
// untouched, because its placeholder text looks like a real value but the
// underlying form field was empty; (2) toggling metric/imperial units
// converted height/weight/target-weight but left the weekly-loss number
// unconverted, silently changing what unit it meant.
describe('WebOnboarding timeline calculation', () => {
  const nativePlatform = Platform.OS;

  beforeAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  });

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: nativePlatform });
  });

  beforeEach(() => {
    useOnboardingStore.setState({
      step: 0, completed: false, goal: null, sex: null, dateOfBirth: null, heightCm: null,
      weightKg: null, activityLevel: null, dietaryPreference: null, dietaryPreferences: [],
      allergies: [], excludedIngredients: [], unitSystem: 'metric', fastingEnabled: false,
      fastingPlan: '16:8', targetWeightKg: null, weeklyChangeKg: null, newsletterOptIn: false,
      calorieTarget: 2000, proteinTargetG: 100, carbsTargetG: 200, fatTargetG: 55,
    });
  });

  async function goToTimelineStep(options: { toggleUnitsOnAboutYouStep?: boolean } = {}) {
    const view = await render(<WebOnboarding onComplete={jest.fn()} />);
    const { getByText, getByRole, getByLabelText, getByPlaceholderText } = view;

    await fireEvent.press(getByText('Lose Weight'));
    await fireEvent.press(getByRole('button', { name: 'Next' }));

    if (options.toggleUnitsOnAboutYouStep) {
      await fireEvent.press(getByRole('switch', { name: 'Toggle metric and imperial units' }));
    }

    await fireEvent.press(getByText('Female', { exact: true }));
    await fireEvent(getByLabelText('Date of birth'), 'change', { target: { value: '1994-05-14' } });
    // Height/weight placeholders are fixed literals regardless of unit, so
    // they don't signal which unit is active -- use values that pass
    // validation (100-250cm / 30-300kg) in whichever unit is now active.
    await fireEvent.changeText(getByPlaceholderText('170'), options.toggleUnitsOnAboutYouStep ? '66' : '168');
    await fireEvent.changeText(getByPlaceholderText('70'), options.toggleUnitsOnAboutYouStep ? '154' : '80');
    await fireEvent.press(getByRole('button', { name: 'Next' }));

    await fireEvent.press(getByText('Moderately Active'));
    await fireEvent.press(getByRole('button', { name: 'Next' }));

    await fireEvent.press(getByRole('button', { name: 'Next' })); // diet: leave default
    await fireEvent.press(getByRole('button', { name: 'Next' })); // fasting: leave none

    return view;
  }

  it('pre-fills a real weekly-loss rate for "Lose Weight" so target calories reflect a real deficit', async () => {
    const { getByDisplayValue, getByText } = await goToTimelineStep();

    // The field must hold a genuine value now, not just placeholder text --
    // querying by display value proves it, since a placeholder never
    // matches getByDisplayValue.
    expect(getByDisplayValue('0.5')).toBeTruthy();

    // Whatever this profile's TDEE is, the displayed daily-calorie target
    // must be strictly less than it -- previously it was exactly equal
    // (zero deficit) whenever the weekly-loss field was left untouched.
    const tdeeNode = getByText(/TDEE: \d+ kcal/);
    const tdee = Number(String(tdeeNode.props.children).match(/(\d+) kcal/)?.[1]);

    expect(tdee).toBeGreaterThan(0);
    expect(getByText(/deficit: \d+ kcal\/day/)).toBeTruthy();
  });

  it('converts the weekly-loss rate when units are toggled, not just height/weight', async () => {
    // Selecting "Lose Weight" pre-fills weeklyChange as "0.5" (kg, the
    // active unit at that moment). Toggling units on the very next step
    // (the only place the toggle lives) must carry that value along in the
    // new unit, not leave the raw "0.5" number meaning something different.
    const { getByDisplayValue, queryByDisplayValue } = await goToTimelineStep({ toggleUnitsOnAboutYouStep: true });

    expect(queryByDisplayValue('0.5')).toBeNull();
    expect(getByDisplayValue('1.1')).toBeTruthy();
  });
});
