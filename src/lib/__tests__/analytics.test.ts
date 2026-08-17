const mockCapture = jest.fn();
const mockIdentify = jest.fn();
let constructOptions: Record<string, unknown> | undefined;

jest.mock('posthog-react-native', () => ({
  PostHog: jest.fn().mockImplementation((_apiKey: string, options?: Record<string, unknown>) => {
    constructOptions = options;
    return { capture: mockCapture, identify: mockIdentify };
  }),
}));

jest.mock('../constants', () => ({ POSTHOG_KEY: 'test-posthog-key' }));

const mockCaptureError = jest.fn();
jest.mock('../sentry', () => ({ captureError: mockCaptureError }));

import { PostHog } from 'posthog-react-native';
import { initAnalytics, track, identifyUser, trackScreen } from '../analytics';

const MockedPostHog = PostHog as unknown as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  constructOptions = undefined;
  process.env.EXPO_PUBLIC_DATA_MODE = 'cloud';
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_DATA_MODE;
});

describe('analytics', () => {
  it('does not construct a client in local-only mode', async () => {
    delete process.env.EXPO_PUBLIC_DATA_MODE;
    await initAnalytics();
    expect(MockedPostHog).not.toHaveBeenCalled();
  });

  it('constructs a PostHog instance with the real v4 constructor API in cloud mode', async () => {
    await initAnalytics();
    expect(MockedPostHog).toHaveBeenCalledWith('test-posthog-key', expect.objectContaining({
      host: 'https://eu.i.posthog.com',
      captureAppLifecycleEvents: true,
    }));
    expect(constructOptions).not.toHaveProperty('captureDeepLinks');
  });

  it('reports init failure to Sentry instead of failing silently', async () => {
    MockedPostHog.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    await initAnalytics();
    expect(mockCaptureError).toHaveBeenCalledWith(expect.any(Error), { context: 'initAnalytics' });
  });

  it('calls the instance capture method after successful init', async () => {
    await initAnalytics();
    track('meal_logged', { calories: 400 });
    expect(mockCapture).toHaveBeenCalledWith('meal_logged', { calories: 400 });
  });

  it('does not track before init has produced a client', () => {
    // analytics.ts holds `client` as module-level state, so a fresh module
    // instance is required here — other tests in this file already init it.
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const freshAnalytics = require('../analytics');
    freshAnalytics.track('meal_logged');
    expect(mockCapture).not.toHaveBeenCalled();
  });

  it('calls the instance identify method with user id and email', async () => {
    await initAnalytics();
    identifyUser('user-1', 'a@b.com');
    expect(mockIdentify).toHaveBeenCalledWith('user-1', { email: 'a@b.com' });
  });

  it('trackScreen forwards to track as a screen_viewed event', async () => {
    await initAnalytics();
    trackScreen('Diary');
    expect(mockCapture).toHaveBeenCalledWith('screen_viewed', { screen: 'Diary' });
  });

  it('never throws when the underlying capture call fails', async () => {
    await initAnalytics();
    mockCapture.mockImplementationOnce(() => {
      throw new Error('network down');
    });
    expect(() => track('meal_logged')).not.toThrow();
  });
});
