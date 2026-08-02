const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
let authStateCallback: ((event: string, session: unknown) => void) | undefined;

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
  AUTH_REDIRECT_URL: 'aurashape://auth/callback',
}));

import { useAuthStore } from '@/src/stores/auth';

describe('auth initialization', () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockOnAuthStateChange.mockReset();
    authStateCallback = undefined;
    useAuthStore.setState({
      session: null,
      user: null,
      loading: true,
      initialized: false,
      authError: null,
    });
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
});
