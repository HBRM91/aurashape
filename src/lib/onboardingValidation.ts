export interface OnboardingFormValues {
  goal: string | null;
  sex: 'male' | 'female' | null;
  dob: string;
  height: string;
  weight: string;
  activityLevel: string | null;
  diet: string | null;
  targetWeight?: string;
  weeklyChange?: string;
}

export type OnboardingField = 'goal' | 'sex' | 'dob' | 'height' | 'weight' | 'activityLevel' | 'diet' | 'targetWeight' | 'weeklyChange';

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateFields(form: OnboardingFormValues, fields: OnboardingField[]): Partial<Record<OnboardingField, string>> {
  const errors: Partial<Record<OnboardingField, string>> = {};
  if (fields.includes('goal') && !form.goal) errors.goal = 'Choose a goal';
  if (fields.includes('sex') && !form.sex) errors.sex = 'Choose an option';
  if (fields.includes('dob') && !isRealDate(form.dob)) errors.dob = 'Choose a real date';
  if (fields.includes('height') && !(Number(form.height) >= 100 && Number(form.height) <= 250)) errors.height = 'Enter a height between 100 and 250 cm';
  if (fields.includes('weight') && !(Number(form.weight) >= 30 && Number(form.weight) <= 300)) errors.weight = 'Enter a weight between 30 and 300 kg';
  if (fields.includes('activityLevel') && !form.activityLevel) errors.activityLevel = 'Choose an activity level';
  if (fields.includes('diet') && !form.diet) errors.diet = 'Choose a dietary preference';
  if (fields.includes('targetWeight') && !(Number(form.targetWeight) > 0)) errors.targetWeight = 'Enter a target weight';
  if (fields.includes('weeklyChange') && !(Number(form.weeklyChange) > 0 && Number(form.weeklyChange) <= 1.5)) errors.weeklyChange = 'Choose a weekly change up to 1.5 kg';
  return errors;
}

export function validateOnboardingForm(form: OnboardingFormValues): Partial<Record<OnboardingField, string>> {
  const fields: OnboardingField[] = ['goal', 'sex', 'dob', 'height', 'weight', 'activityLevel', 'diet'];
  if (form.targetWeight !== undefined) fields.push('targetWeight');
  if (form.weeklyChange !== undefined) fields.push('weeklyChange');
  return validateFields(form, fields);
}

export function validateOnboardingStep(form: OnboardingFormValues, step: number): Partial<Record<OnboardingField, string>> {
  if (step === 0) return validateFields(form, ['goal']);
  if (step === 1) return validateFields(form, ['sex', 'dob', 'height', 'weight']);
  if (step === 2) return validateFields(form, ['activityLevel', 'diet']);
  return {};
}
