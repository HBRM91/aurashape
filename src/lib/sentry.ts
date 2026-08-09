import { SENTRY_DSN } from './constants';
import { isLocalOnly } from './privacyMode';

export async function initSentry() {
  if (isLocalOnly()) return;
  if (!SENTRY_DSN || SENTRY_DSN === 'your-sentry-dsn') return;
  try {
    const Sentry = require('@sentry/react-native');
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 0.5,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      enableNative: true,
      enableNativeCrashHandling: true,
    });
  } catch {}
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (isLocalOnly()) return;
  try {
    const Sentry = require('@sentry/react-native');
    Sentry.captureException(error, { extra: context });
  } catch {}
}
