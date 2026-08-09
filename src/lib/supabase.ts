import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  NATIVE_AUTH_REDIRECT_URL,
  WEB_AUTH_REDIRECT_URL,
} from './constants';

export const AUTH_REDIRECT_URL = Platform.OS === 'web'
  ? WEB_AUTH_REDIRECT_URL
  : NATIVE_AUTH_REDIRECT_URL;

// Local mode still imports shared stores during tests and native startup; use a
// non-routable placeholder client until cloud mode is explicitly configured.
export const supabase = createClient(
  SUPABASE_URL || 'http://127.0.0.1:54321',
  SUPABASE_ANON_KEY || 'local-only-anon-key',
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
  },
);
