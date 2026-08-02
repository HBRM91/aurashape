# Task 1 Report: Pure Auth Route Decisions

## Scope

Implemented the pure `getAuthDestination` route decision helper described in the Task 1 brief. The helper has no React or Supabase imports and only returns route intent; it does not perform navigation or access application state.

## Behavior

- Treats `/`, `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/privacy`, and `/terms` as public paths.
- Keeps the current route public while auth initialization is incomplete.
- Redirects unauthenticated users from protected paths to `/auth/login`.
- Redirects authenticated users without consent to `/onboarding/privacy-consent`.
- Redirects authenticated users without local or profile onboarding completion to `/onboarding`.
- Sends authenticated users with either onboarding completion signal to the `app` destination.

## TDD Evidence

1. Added `src/lib/__tests__/authRouting.test.ts` before the production helper.
2. Ran `npx jest src/lib/__tests__/authRouting.test.ts --runInBand` while the helper was absent. Jest failed during module resolution for `@/src/lib/authRouting`, confirming the test could not pass without the implementation.
3. Added the minimal implementation in `src/lib/authRouting.ts`.
4. Re-ran the focused test: 1 suite passed, 6 tests passed.

## Verification

Ran `npm run check`:

- TypeScript: passed with no errors.
- Jest: 21 suites passed, 239 tests passed.

## Files Changed

- `src/lib/authRouting.ts`
- `src/lib/__tests__/authRouting.test.ts`
- `.superpowers/sdd/2026-08-02-aurashape-web-foundation-and-ai-roadmap/task-1-report.md`

## Concerns

No known concerns for Task 1. Navigation integration and static-export behavior remain scoped to later tasks in the approved plan.
