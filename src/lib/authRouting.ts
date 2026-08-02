export interface AuthRoutingInput {
  pathname: string;
  initialized: boolean;
  userId: string | null;
  consentAccepted: boolean;
  onboardingCompleted: boolean;
  profileOnboarded: boolean | null;
}

export interface AuthDestination {
  kind: 'public' | 'consent' | 'onboarding' | 'app';
  href?: string;
}

const PUBLIC_PATHS = new Set([
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/callback',
  '/privacy',
  '/terms',
]);

export function getAuthDestination({
  pathname,
  initialized,
  userId,
  consentAccepted,
  onboardingCompleted,
  profileOnboarded,
}: AuthRoutingInput): AuthDestination {
  if (!initialized || PUBLIC_PATHS.has(pathname)) {
    return { kind: 'public' };
  }

  if (!userId) {
    return { kind: 'public', href: '/auth/login' };
  }

  if (!consentAccepted) {
    return { kind: 'consent', href: '/onboarding/privacy-consent' };
  }

  if (!onboardingCompleted && profileOnboarded !== true) {
    return { kind: 'onboarding', href: '/onboarding' };
  }

  return { kind: 'app' };
}
