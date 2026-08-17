import { create } from 'zustand';
import { supabase, AUTH_REDIRECT_URL } from '@/src/lib/supabase';
import { sendWelcomeEmail } from '@/src/lib/email';
import type { Session, User } from '@supabase/supabase-js';
import { isLocalOnly } from '@/src/lib/privacyMode';
import { clearLocalUserData } from '@/src/lib/localData';
import { useSyncStore } from './sync';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  authError: string | null;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithApple: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  initialized: false,
  authError: null,

  initialize: async () => {
    if (isLocalOnly()) {
      set({ session: null, user: null, loading: false, initialized: true, authError: null });
      return;
    }
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      set({
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
        authError: null,
      });
    } catch (error) {
      set({
        session: null,
        user: null,
        loading: false,
        initialized: true,
        authError: error instanceof Error ? error.message : 'Unable to load your session',
      });
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        ...(session ? { authError: null } : {}),
      });
    });
  },

  signUp: async (email, password) => {
    if (isLocalOnly()) return { error: 'Accounts are disabled in local-only mode.' };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user && !data.session) return { needsEmailConfirmation: true };
    if (data.session?.access_token) {
      void sendWelcomeEmail(email.split('@')[0], data.session.access_token);
    }
    return {};
  },

  signIn: async (email, password) => {
    if (isLocalOnly()) return { error: 'Accounts are disabled in local-only mode.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  },

  signInWithGoogle: async () => {
    if (isLocalOnly()) return { error: 'Accounts are disabled in local-only mode.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: AUTH_REDIRECT_URL },
    });
    if (error) return { error: error.message };
    return {};
  },

  signInWithApple: async () => {
    if (isLocalOnly()) return { error: 'Accounts are disabled in local-only mode.' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: AUTH_REDIRECT_URL },
    });
    if (error) return { error: error.message };
    return {};
  },

  signOut: async () => {
    if (!isLocalOnly()) await supabase.auth.signOut();
    await clearLocalUserData();
    useSyncStore.getState().resetSync();
    set({ session: null, user: null });
  },

  resetPassword: async (email) => {
    if (isLocalOnly()) return { error: 'Accounts are disabled in local-only mode.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return {};
  },
}));
