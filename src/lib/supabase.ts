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

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
