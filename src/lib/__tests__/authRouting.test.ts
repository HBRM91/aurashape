import { getAuthDestination, type AuthRoutingInput } from '@/src/lib/authRouting';

const baseInput: AuthRoutingInput = {
  pathname: '/',
  initialized: true,
  userId: null,
  consentAccepted: false,
  onboardingCompleted: false,
  profileOnboarded: null,
};

describe('getAuthDestination', () => {
  it('allows unauthenticated users to access public paths', () => {
    const publicPaths = ['/', '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/callback', '/privacy', '/terms'];

    for (const pathname of publicPaths) {
      expect(getAuthDestination({ ...baseInput, pathname })).toEqual({ kind: 'public' });
    }
  });

  it('redirects unauthenticated users from protected paths to login', () => {
    expect(getAuthDestination({ ...baseInput, pathname: '/(tabs)' })).toEqual({
      kind: 'public',
      href: '/auth/login',
    });
  });

  it('keeps the current route public until auth is initialized', () => {
    expect(getAuthDestination({ ...baseInput, pathname: '/(tabs)', initialized: false })).toEqual({
      kind: 'public',
    });
  });

  it('redirects authenticated users without consent to the consent route', () => {
    expect(getAuthDestination({ ...baseInput, pathname: '/(tabs)', userId: 'user-1' })).toEqual({
      kind: 'consent',
      href: '/onboarding/privacy-consent',
    });
  });

  it('redirects authenticated users without onboarding to the onboarding route', () => {
    expect(getAuthDestination({
      ...baseInput,
      pathname: '/(tabs)',
      userId: 'user-1',
      consentAccepted: true,
      profileOnboarded: false,
    })).toEqual({
      kind: 'onboarding',
      href: '/onboarding',
    });
  });

  it('sends authenticated onboarded users to the app', () => {
    expect(getAuthDestination({
      ...baseInput,
      pathname: '/(tabs)',
      userId: 'user-1',
      consentAccepted: true,
      onboardingCompleted: true,
    })).toEqual({ kind: 'app' });

    expect(getAuthDestination({
      ...baseInput,
      pathname: '/(tabs)',
      userId: 'user-1',
      consentAccepted: true,
      profileOnboarded: true,
    })).toEqual({ kind: 'app' });
  });
});
