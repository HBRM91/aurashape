const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignUp = jest.fn();
let authStateCallback: ((event: string, session: unknown) => void) | undefined;

jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signUp: mockSignUp,
    },
  },
  AUTH_REDIRECT_URL: 'aurashape://auth/callback',
}));

import { useAuthStore } from '@/src/stores/auth';

describe('auth initialization', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_DATA_MODE = 'cloud';
    mockGetSession.mockReset();
    mockOnAuthStateChange.mockReset();
    mockSignUp.mockReset();
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
});
