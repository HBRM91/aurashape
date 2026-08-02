import { fireEvent, render } from '@testing-library/react-native';
import { Platform, Text } from 'react-native';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; href?: string }) => (
    <Text {...props}>{children}</Text>
  ),
  Redirect: ({ href }: { href: string }) => <Text>{href}</Text>,
  useRouter: () => ({ push: mockPush }),
}));

import Index from '../../../app/index';

describe('public web landing route', () => {
  const nativePlatform = Platform.OS;

  beforeAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  });

  afterAll(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: nativePlatform });
  });

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the public product story and valid footer destinations', async () => {
    const { getByText, getAllByRole } = await render(<Index />);

    expect(getByText('Your health, shaped by science.')).toBeTruthy();
    expect(getByText('Food')).toBeTruthy();
    expect(getByText('Fasting')).toBeTruthy();
    expect(getByText('Workouts')).toBeTruthy();
    expect(getByText('Community')).toBeTruthy();
    expect(getByText('Privacy is part of the product.')).toBeTruthy();
    expect(getByText('Privacy Policy').props.href).toBe('https://aurashape.app/privacy');
    expect(getByText('Terms of Service').props.href).toBe('https://aurashape.app/terms');
    expect(getByText('Contact us').props.href).toBe('mailto:hello@aurashape.app');
    expect(getAllByRole('button', { name: 'Start free' })).toHaveLength(2);
    expect(getAllByRole('button', { name: 'Sign in' })).toHaveLength(1);
  });

  it('navigates the primary CTAs to the existing auth routes', async () => {
    const { getAllByRole } = await render(<Index />);
    const [startFree] = getAllByRole('button', { name: 'Start free' });
    const [signIn] = getAllByRole('button', { name: 'Sign in' });

    await fireEvent.press(startFree);
    await fireEvent.press(signIn);

    expect(mockPush).toHaveBeenNthCalledWith(1, '/auth/signup');
    expect(mockPush).toHaveBeenNthCalledWith(2, '/auth/login');
  });

  it('exposes desktop section links with destinations and accessible labels', async () => {
    jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({
      width: 1024,
      height: 768,
      scale: 1,
      fontScale: 1,
    });

    const { getByText } = await render(<Index />);
    const featuresLink = getByText("What's inside");
    const privacyLink = getByText('Privacy first');

    expect(featuresLink.props.href).toBe('/#features');
    expect(featuresLink.props.accessibilityLabel).toBe("Jump to what's inside");
    expect(privacyLink.props.href).toBe('/#privacy');
    expect(privacyLink.props.accessibilityLabel).toBe('Jump to privacy information');
  });
});
