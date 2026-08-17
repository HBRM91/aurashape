import { PostHog } from 'posthog-react-native';
import { POSTHOG_KEY } from './constants';
import { isLocalOnly } from './privacyMode';
import { captureError } from './sentry';

let client: PostHog | null = null;

// PostHogEventProperties isn't part of posthog-react-native's public export
// surface (it's only re-exported internally from @posthog/core, a
// transitive dependency this app doesn't declare directly) — deriving it
// structurally from capture()'s own parameter type stays correct even if
// that changes, without depending on an undeclared package's type names.
type CaptureProperties = Parameters<PostHog['capture']>[1];

export async function initAnalytics() {
  if (isLocalOnly()) return;
  if (!POSTHOG_KEY || POSTHOG_KEY === 'your-posthog-key') return;
  try {
    client = new PostHog(POSTHOG_KEY, {
      host: 'https://eu.i.posthog.com',
      captureAppLifecycleEvents: true,
    });
  } catch (err) {
    client = null;
    if (__DEV__) console.warn('[analytics] init failed, events will not be captured', err);
    captureError(err as Error, { context: 'initAnalytics' });
  }
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (isLocalOnly() || !client) return;
  try {
    // Callers only ever pass plain JSON-safe values (strings/numbers/booleans);
    // narrowing Record<string, unknown> to the SDK's stricter property type
    // here keeps the public track() signature simple for the ~10 call sites
    // across the stores instead of threading that type through all of them.
    client.capture(event, properties as CaptureProperties);
  } catch (err) {
    if (__DEV__) console.warn('[analytics] capture failed', event, err);
  }
}

export function identifyUser(userId: string, email: string) {
  if (isLocalOnly() || !client) return;
  try {
    client.identify(userId, { email });
  } catch (err) {
    if (__DEV__) console.warn('[analytics] identify failed', err);
  }
}

export function trackScreen(screenName: string) {
  track('screen_viewed', { screen: screenName });
}
