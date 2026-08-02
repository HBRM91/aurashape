export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
export const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY || '';
export const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';
export const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || '';
export const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2';

export const NATIVE_AUTH_REDIRECT_URL = 'aurashape://auth/callback';
export const WEB_AUTH_REDIRECT_URL = process.env.EXPO_PUBLIC_WEB_AUTH_REDIRECT_URL || 'https://aurashape.app/auth/callback';
