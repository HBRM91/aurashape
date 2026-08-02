# Task 2: Remove the Static Spinner Deadlock

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `src/stores/auth.ts`
- Modify: `src/lib/supabase.ts`
- Modify: `src/lib/constants.ts`
- Test: `src/lib/__tests__/authRouting.test.ts`

**Requirements:**
- Root layout must always render a route stack during static rendering.
- Public routes must not be blocked by the auth loading spinner.
- Client effects initialize auth and navigate only after initialization.
- Catch `getSession()` failures, set `initialized: true`, retain a visible auth error, and never leave initialization false.
- Profile lookup must not block public routes. Missing schema or a failed profile query must lead to onboarding/retry after authentication.
- Use `detectSessionInUrl: Platform.OS === 'web'` while preserving native behavior.
- Centralize web/native redirect URL values.
- Static export must produce `dist/auth/login.html` containing `Aurashape`, `Email`, and `Password`, and not only `role="progressbar"`.
- Run `npm run check`.

**Important existing context:**
- `src/lib/authRouting.ts` exports `getAuthDestination` and its input/output types.
- Existing stores use Zustand and Supabase.
- Do not rewrite public screen UI in this task; this task only makes the existing route content render reliably.
