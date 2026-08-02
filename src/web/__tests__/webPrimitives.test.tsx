import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { WebButton } from '../WebButton';
import { WebCard } from '../WebCard';
import { WebField } from '../WebField';
import { WebLogo } from '../WebLogo';
import { WebSection } from '../WebSection';
import { WEB_TOKENS } from '../tokens';

function resolvePressableStyle(style: unknown, state = { pressed: false }) {
  return StyleSheet.flatten(typeof style === 'function' ? style(state) : style);
}

describe('web primitives', () => {
  it.each([
    ['primary', WEB_TOKENS.colors.primary],
    ['secondary', WEB_TOKENS.colors.secondary],
    ['ghost', 'transparent'],
  ] as const)('renders the %s button variant', async (variant, backgroundColor) => {
    const { getByRole } = await render(<WebButton label="Continue" onPress={jest.fn()} variant={variant} />);

    expect(resolvePressableStyle(getByRole('button').props.style)).toEqual(
      expect.objectContaining({ backgroundColor, borderWidth: 2 }),
    );
  });

  it('exposes disabled state and does not press when disabled', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<WebButton label="Continue" onPress={onPress} disabled />);
    const button = getByRole('button');

    await fireEvent.press(button);

    expect(button.props.accessibilityState).toEqual({ disabled: true });
    expect(onPress).not.toHaveBeenCalled();
  });

  it('responds to press and focus state changes', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<WebButton label="Continue" onPress={onPress} />);
    const button = getByRole('button');

    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);

    await fireEvent(button, 'focus');
    expect(resolvePressableStyle(button.props.style, { pressed: false })).toEqual(
      expect.objectContaining({ borderColor: WEB_TOKENS.colors.focus, borderWidth: 2 }),
    );

    await fireEvent(button, 'blur');
    expect(resolvePressableStyle(button.props.style, { pressed: false })).not.toEqual(
      expect.objectContaining({ borderColor: WEB_TOKENS.colors.focus }),
    );
  });

  it('renders a labeled field and marks errors with aria-invalid', async () => {
    const { getByLabelText, getByText } = await render(
      <WebField label="Email" error="Enter a valid email" placeholder="you@example.com" />,
    );
    const field = getByLabelText('Email');

    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Enter a valid email')).toBeTruthy();
    expect(field.props['aria-invalid']).toBe(true);
    expect(field.props['aria-describedby']).toBe('web-field-email-error');
    expect(field.props.accessibilityLabel).toBe('Email');
    expect(field.props.placeholder).toBe('you@example.com');
    expect(StyleSheet.flatten(field.props.style)).toEqual(expect.objectContaining({ borderWidth: 2 }));
    expect(getByText('Enter a valid email').props.accessibilityLiveRegion).toBe('polite');
    expect(getByText('Enter a valid email').props.nativeID).toBe('web-field-email-error');
  });

  it('keeps a valid field marked as not invalid', async () => {
    const { getByLabelText } = await render(<WebField label="Email" />);

    expect(getByLabelText('Email').props['aria-invalid']).toBe(false);
  });

  it('renders WebCard content and accessible labeling', async () => {
    const { getByRole, getByText } = await render(
      <WebCard accessibilityLabel="Profile card">
        <Text>Profile details</Text>
      </WebCard>,
    );

    expect(getByRole('summary', { name: 'Profile card' })).toBeTruthy();
    expect(getByText('Profile details')).toBeTruthy();
  });

  it('renders WebSection title, description, and children', async () => {
    const { getByRole, getByText } = await render(
      <WebSection title="Your goals" description="Small steps add up.">
        <Text>Goal content</Text>
      </WebSection>,
    );

    expect(getByRole('header', { name: 'Your goals' })).toBeTruthy();
    expect(getByText('Small steps add up.')).toBeTruthy();
    expect(getByText('Goal content')).toBeTruthy();
  });

  it('renders WebLogo as an accessible image', async () => {
    const { getByRole } = await render(<WebLogo />);

    expect(getByRole('image', { name: 'Aurashape' }).props.accessible).toBe(true);
  });
});
