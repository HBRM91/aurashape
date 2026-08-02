import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Platform, StyleSheet, Text } from 'react-native';

const mockSignIn = jest.fn();
const mockSignUp = jest.fn();
const mockResetPassword = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignInWithApple = jest.fn();

jest.mock('@/src/stores/auth', () => ({
  useAuthStore: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    resetPassword: mockResetPassword,
    signInWithGoogle: mockSignInWithGoogle,
    signInWithApple: mockSignInWithApple,
  }),
}));

jest.mock('expo-router', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; href?: string }) => (
    <Text {...props}>{children}</Text>
  ),
}));

import LoginScreen from '../../../app/auth/login';
import SignUpScreen from '../../../app/auth/signup';
import ForgotPasswordScreen from '../../../app/auth/forgot-password';

describe('web authentication routes', () => {
  const nativePlatform = Platform.OS;

  beforeAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  });

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: nativePlatform });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps browser-safe auth artwork available as a PNG asset', () => {
    const artwork = readFileSync(resolve(__dirname, '../../../assets/images/auth-health.png'));

    expect(artwork.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  });

  it('renders the login fields, actions, and legal links on web', async () => {
    const { getByLabelText, getByRole, getByText } = await render(<LoginScreen />);

    expect(getByLabelText('Email')).toBeTruthy();
    expect(getByLabelText('Password')).toBeTruthy();
    expect(getByRole('button', { name: 'Log In' })).toBeTruthy();
    expect(getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
    expect(getByRole('button', { name: 'Continue with Apple' })).toBeTruthy();
    expect(getByText('Privacy Policy').props.href).toBe('https://aurashape.app/privacy');
    expect(getByText('Terms of Service').props.href).toBe('https://aurashape.app/terms');
  });

  it('shows the existing login validation before submitting', async () => {
    const { getByLabelText, getByRole, getByText } = await render(<LoginScreen />);

    await fireEvent.press(getByRole('button', { name: 'Log In' }));

    expect(getByText('Please fill in all fields')).toBeTruthy();
    expect(getByLabelText('Email').props['aria-invalid']).toBe(true);
    expect(getByLabelText('Email').props['aria-describedby']).toBe('web-field-email-error');
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('shows login OAuth loading state and returned errors on web', async () => {
    let resolveGoogle: (result: { error?: string }) => void = () => undefined;
    mockSignInWithGoogle.mockReturnValueOnce(new Promise((resolve) => {
      resolveGoogle = resolve;
    }));
    const { getByRole, getByText } = await render(<LoginScreen />);

    fireEvent.press(getByRole('button', { name: 'Continue with Google' }));

    await waitFor(() => {
      expect(getByRole('button', { name: 'Connecting with Google...' }).props.accessibilityState).toEqual({ disabled: true });
      expect(getByRole('button', { name: 'Continue with Apple' }).props.accessibilityState).toEqual({ disabled: true });
    });

    resolveGoogle({ error: 'Google sign-in is unavailable' });

    await waitFor(() => expect(getByText('Google sign-in is unavailable')).toBeTruthy());
  });

  it('renders signup fields and preserves password confirmation validation', async () => {
    const { getByLabelText, getByRole, getByText } = await render(<SignUpScreen />);

    expect(getByLabelText('Email')).toBeTruthy();
    expect(getByLabelText('Password')).toBeTruthy();
    expect(getByLabelText('Confirm password')).toBeTruthy();

    await fireEvent.changeText(getByLabelText('Email'), 'person@example.com');
    await fireEvent.changeText(getByLabelText('Password'), 'password123');
    await fireEvent.changeText(getByLabelText('Confirm password'), 'different123');
    await fireEvent.press(getByRole('button', { name: 'Sign Up' }));

    expect(getByText('Passwords do not match')).toBeTruthy();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows signup OAuth errors returned by the store on web', async () => {
    mockSignInWithApple.mockResolvedValueOnce({ error: 'Apple sign-in is unavailable' });
    const { getByRole, getByText } = await render(<SignUpScreen />);

    await fireEvent.press(getByRole('button', { name: 'Continue with Apple' }));

    await waitFor(() => expect(getByText('Apple sign-in is unavailable')).toBeTruthy());
  });

  it('renders forgot-password controls and shows its validation', async () => {
    const { getByLabelText, getByRole, getByText } = await render(<ForgotPasswordScreen />);

    expect(getByLabelText('Email')).toBeTruthy();
    expect(getByRole('button', { name: 'Send Reset Link' })).toBeTruthy();
    expect(getByText('Privacy Policy').props.href).toBe('https://aurashape.app/privacy');
    expect(getByText('Terms of Service').props.href).toBe('https://aurashape.app/terms');

    await fireEvent.press(getByRole('button', { name: 'Send Reset Link' }));

    expect(getByText('Please enter your email')).toBeTruthy();
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('shows the reset success state after a successful request', async () => {
    mockResetPassword.mockResolvedValueOnce({});
    const { getByLabelText, getByRole, getByText } = await render(<ForgotPasswordScreen />);

    await fireEvent.changeText(getByLabelText('Email'), 'person@example.com');
    await fireEvent.press(getByRole('button', { name: 'Send Reset Link' }));

    await waitFor(() => expect(getByText('Check your email')).toBeTruthy());
    expect(getByText(/person@example.com/)).toBeTruthy();
  });

  it('keeps the auth aside in the static web fallback layout', async () => {
    const dimensions = jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({
      width: 0,
      height: 0,
      scale: 1,
      fontScale: 1,
    });

    const { getByLabelText } = await render(<LoginScreen />);

    expect(getByLabelText('Aurashape health illustration')).toBeTruthy();
    dimensions.mockRestore();
  });

  it('keeps the auth aside mounted but hides it below the desktop breakpoint', async () => {
    const dimensions = jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({
      width: 767,
      height: 900,
      scale: 1,
      fontScale: 1,
    });

    const { getByLabelText, getByTestId } = await render(<LoginScreen />);

    expect(getByLabelText('Aurashape health illustration', { includeHiddenElements: true })).toBeTruthy();
    expect(StyleSheet.flatten(getByTestId('auth-aside', { includeHiddenElements: true }).props.style)).toEqual(
      expect.objectContaining({ display: 'none' }),
    );
    dimensions.mockRestore();
  });
});
