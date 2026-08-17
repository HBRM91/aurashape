import { PostHog } from 'posthog-react-native';
import { POSTHOG_KEY } from './constants';
import { isLocalOnly } from './privacyMode';
import { captureError } from './sentry';

let client: PostHog | null = null;

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
    client.capture(event, properties);
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
