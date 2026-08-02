# Task 1: Add Pure Route-Guard Decisions

**Files:**
- Create: `src/lib/authRouting.ts`
- Test: `src/lib/__tests__/authRouting.test.ts`

**Interfaces:**
- Produce `getAuthDestination(input: AuthRoutingInput): AuthDestination`.
- `AuthRoutingInput` is `{ pathname: string; initialized: boolean; userId: string | null; consentAccepted: boolean; onboardingCompleted: boolean; profileOnboarded: boolean | null }`.
- `AuthDestination` is `{ kind: 'public' | 'consent' | 'onboarding' | 'app'; href?: string }`.

**Requirements:**
- Cover unauthenticated public paths, unauthenticated protected paths, authenticated users without consent, authenticated users without onboarding, and authenticated onboarded users.
- Public paths are `/`, `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/privacy`, and `/terms`.
- The helper must have no React or Supabase imports.
- Add focused tests before implementation and run `npx jest src/lib/__tests__/authRouting.test.ts --runInBand`, then `npm run check`.
