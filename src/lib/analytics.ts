import { POSTHOG_KEY } from './constants';
import { isLocalOnly } from './privacyMode';

let enabled = false;

export async function initAnalytics() {
  if (isLocalOnly()) return;
  if (!POSTHOG_KEY || POSTHOG_KEY === 'your-posthog-key') return;
  try {
    const PostHogLib = require('posthog-react-native');
    await PostHogLib.PostHog.setup(POSTHOG_KEY, {
      host: 'https://eu.i.posthog.com',
      captureApplicationLifecycleEvents: true,
      captureDeepLinks: false,
    });
    enabled = true;
  } catch {
    enabled = false;
  }
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (isLocalOnly() || !enabled) return;
  try {
    const PostHogLib = require('posthog-react-native');
    PostHogLib.PostHog.capture(event, properties);
  } catch {}
}

export function identifyUser(userId: string, email: string) {
  if (isLocalOnly() || !enabled) return;
  try {
    const PostHogLib = require('posthog-react-native');
    PostHogLib.PostHog.identify(userId, { email });
  } catch {}
}

export function trackScreen(screenName: string) {
  track('screen_viewed', { screen: screenName });
}
