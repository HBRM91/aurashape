const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
let authStateCallback: ((event: string, session: unknown) => void) | undefined;

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  },
  AUTH_REDIRECT_URL: 'aurashape://auth/callback',
}));

import { useAuthStore } from '@/src/stores/auth';
import { useSyncStore } from '@/src/stores/sync';

describe('auth initialization', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_DATA_MODE = 'cloud';
    mockGetSession.mockReset();
    mockOnAuthStateChange.mockReset();
    mockSignUp.mockReset();
    mockSignOut.mockReset().mockResolvedValue({ error: null });
    authStateCallback = undefined;
    useAuthStore.setState({
      session: null,
      user: null,
      loading: true,
      initialized: false,
      authError: null,
    });
  });

  afterAll(() => {
    delete process.env.EXPO_PUBLIC_DATA_MODE;
  });

  it('settles initialized state and retains a visible error when session loading fails', async () => {
    mockGetSession.mockRejectedValueOnce(new Error('Auth service unavailable'));
    mockOnAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
    });

    await expect(useAuthStore.getState().initialize()).resolves.toBeUndefined();

    authStateCallback?.('SIGNED_OUT', null);

    expect(useAuthStore.getState()).toEqual(expect.objectContaining({
      session: null,
      user: null,
      loading: false,
      initialized: true,
      authError: 'Auth service unavailable',
    }));
  });

  it('clears an initialization error when an authenticated session event arrives', async () => {
    mockGetSession.mockRejectedValueOnce(new Error('Auth service unavailable'));
    mockOnAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
    });

    await useAuthStore.getState().initialize();
    authStateCallback?.('SIGNED_IN', { user: { id: 'user-1' } });

    expect(useAuthStore.getState()).toEqual(expect.objectContaining({
      user: { id: 'user-1' },
      authError: null,
    }));
  });

  it('reports when signup requires email confirmation', async () => {
    mockSignUp.mockResolvedValueOnce({ data: { user: { id: 'user-1' }, session: null }, error: null });

    const result = await useAuthStore.getState().signUp('person@example.com', 'Password1');

    expect(result).toEqual({ needsEmailConfirmation: true });
  });

  it('resets sync state on sign out, so a second account on the same device never inherits a stale queue', async () => {
    // sync.ts state is a process-lifetime singleton, not tied to any one
    // account — without an explicit reset, an item queued while signed in
    // as user A would still be in memory (and eligible to sync) after
    // switching to user B on the same device.
    useSyncStore.setState({
      queue: [{ id: 'x', table: 'diary_entries', action: 'insert', payload: {}, timestamp: 0, attempts: 0, nextRetryAt: 0 }],
      quarantined: [{ id: 'y', table: 'diary_entries', action: 'insert', payload: {}, timestamp: 0, attempts: 5, nextRetryAt: 0 }],
      lastSync: 12345,
    });

    await useAuthStore.getState().signOut();

    expect(useSyncStore.getState().queue).toHaveLength(0);
    expect(useSyncStore.getState().quarantined).toHaveLength(0);
  });
});
