# Task 2 Report: Remove the Static Spinner Deadlock

## Scope

Implemented the Task 2 auth/static-rendering foundation without changing the existing public screen UI. The root layout now keeps Expo Router mounted during static rendering, while auth initialization, profile lookup, and navigation remain client-side effects.

## Implementation

- `app/_layout.tsx`
  - Always renders a root `Stack` inside a full-screen container.
  - Removed the unconditional `ActivityIndicator` return that prevented public route HTML from rendering.
  - Uses `usePathname`, `useRouter`, and Task 1's `getAuthDestination` for redirects after auth initialization.
  - Keeps auth-route HTML public during static rendering and redirects authenticated users after initialization.
  - Loads the profile asynchronously only after an authenticated session exists.
  - Treats profile query failures, including missing-schema responses, as not onboarded so the authenticated user reaches onboarding and can retry profile saving.
  - Displays a visible session initialization error without blocking the route stack.

- `src/stores/auth.ts`
  - Catches rejected `getSession()` calls and Supabase session errors.
  - Always sets `loading: false` and `initialized: true` on failure.
  - Retains the failure in `authError` until an auth state event succeeds.
  - Keeps the auth state listener active after an initialization failure.
  - Uses the centralized platform-specific OAuth redirect value.

- `src/lib/supabase.ts`
  - Uses `detectSessionInUrl: Platform.OS === 'web'`.
  - Selects the native or web OAuth redirect URL from the centralized constants.

- `src/lib/constants.ts`
  - Added `NATIVE_AUTH_REDIRECT_URL` and configurable `WEB_AUTH_REDIRECT_URL` values.

- `src/stores/__tests__/auth.test.ts`
  - Added a focused regression test proving a failed session lookup resolves initialization and preserves a visible error.

## TDD Evidence

1. Added the auth initialization failure test before changing production code.
2. Ran `npx jest src/stores/__tests__/auth.test.ts --runInBand`; it failed because the existing `initialize()` rejected the session error and left initialization incomplete.
3. Implemented the bounded initialization path.
4. Re-ran the focused test; it passed.

## Verification

Ran `npm run check`:

- TypeScript: passed with no errors.
- Jest: 22 suites passed, 240 tests passed.

Ran `npx expo export --platform web`:

- Export completed successfully and generated `dist`.
- `dist/auth/login.html` contains visible `Aurashape`, `Email`, and `Password` content.
- `dist/auth/login.html` contains no `role="progressbar"` match.

## Files Changed

- `app/_layout.tsx`
- `src/stores/auth.ts`
- `src/lib/supabase.ts`
- `src/lib/constants.ts`
- `src/stores/__tests__/auth.test.ts`
- `.superpowers/sdd/2026-08-02-aurashape-web-foundation-and-ai-roadmap/task-2-report.md`

## Concerns

- The web OAuth callback defaults to `https://aurashape.app/auth/callback`; set `EXPO_PUBLIC_WEB_AUTH_REDIRECT_URL` to the deployed callback origin/path if the production Supabase redirect allow-list uses a different URL.
- Expo export still reports the existing web push-notification listener warning; it does not prevent static export or affect the login HTML assertion.
- The repository's working tree already contains Task 1 and OpenCode loop changes; they were left untouched. No commit was created.

## Review Fixes

### Web OAuth Callback Route

- Added `app/auth/callback.tsx` as the real Expo Router target for `https://aurashape.app/auth/callback`.
- The route renders a transient `Completing sign-in...` state while the existing Supabase client processes the session URL.
- It sends a completed initialization with no authenticated user to `/auth/login`.
- Authenticated callback sessions are left to the existing root-layout auth effect, which uses `getAuthDestination` to route to consent, onboarding, or the app without duplicating profile lookup logic.
- Added `/auth/callback` to the public route decisions so the callback can complete before post-auth routing runs.

### Auth Error Preservation

- Updated `src/stores/auth.ts` so a null-session auth event updates `session` and `user` but preserves `authError`.
- A non-null authenticated session event clears `authError`.
- A successful `getSession()` continues to clear `authError` as before.

## Review Fix Verification

Focused tests:

- `npx jest src/stores/__tests__/auth.test.ts --runInBand`: 1 suite passed, 2 tests passed.
- `npx jest src/lib/__tests__/authRouting.test.ts --runInBand`: 1 suite passed, 6 tests passed.
- TDD red verification confirmed the callback path was not public before the routing change and that the null-session event cleared the error before the auth-store fix. Both focused suites passed after the fixes.

Full checks:

- `npm run check`: TypeScript passed; 22 suites passed, 241 tests passed.
- `npx expo export --platform web`: completed successfully with 31 static routes, including `/auth/callback`.
- `dist/auth/callback.html` exists and contains the visible `Completing sign-in...` state.
- Expo reported the existing web push-notification listener warning; export completed successfully.
