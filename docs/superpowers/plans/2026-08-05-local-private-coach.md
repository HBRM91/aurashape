# Local Private Coach Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add daily and weekly personalized coaching that runs entirely on-device while making the app's no-tracking promise enforceable in local mode.

**Architecture:** Keep user health data in existing local Zustand persistence and add a pure local metrics/rules engine. Local mode is the default and gates analytics, Sentry, push-token upload, sync, email, and personalized AI calls. Public catalog lookups remain separate and carry no diary, identity, goal, photo, or health-history context.

**Tech Stack:** Expo SDK 57, React Native, Zustand 5, AsyncStorage for the current persistence layer, Jest 29, TypeScript strict mode.

## Global Constraints

- No user health data, identifiers, photos, goals, diary entries, or coaching context may leave the device in local mode.
- Daily coaching produces at most one primary recommendation and two optional actions.
- Weekly coaching uses a seven-day local window and stores its history locally.
- Recommendations must include a reason and confidence and must never diagnose, change medication, encourage eating disorders, or shame missed goals.
- Cloud AI is limited to generic public-content explanations and is disabled for personalized coaching in local mode.
- Run `npm run check` before claiming completion.
- Run `npm run build:web` and `npm run test:e2e` for web-facing changes.

---

### Task 1: Local Privacy Runtime Gate

**Files:**
- Create: `src/lib/privacyMode.ts`
- Modify: `src/lib/analytics.ts`
- Modify: `src/lib/sentry.ts`
- Modify: `src/lib/notifications.ts`
- Modify: `src/stores/sync.ts`
- Modify: `src/lib/aiClient.ts`
- Modify: `src/lib/email.ts`
- Test: `src/lib/__tests__/privacyMode.test.ts`

**Interface:**

```ts
export type DataMode = 'local' | 'cloud';
export const DATA_MODE: DataMode;
export function isLocalOnly(): boolean;
```

- [ ] Add a local-only default controlled by `EXPO_PUBLIC_DATA_MODE`, accepting only `local` or `cloud` and defaulting to `local`.
- [ ] Add failing tests proving unknown/missing values resolve to `local` and cloud mode is explicit.
- [ ] Guard analytics, Sentry, notification token upload, sync queue processing, email, and personalized AI calls when `isLocalOnly()` is true.
- [ ] Keep local scheduling and local notifications available; only remote token registration is disabled.
- [ ] Return a deterministic unavailable error from personalized AI calls in local mode instead of silently transmitting data.
- [ ] Run the focused privacy tests and TypeScript check.

### Task 2: Local Metrics Engine

**Files:**
- Create: `src/lib/localCoach.ts`
- Test: `src/lib/__tests__/localCoach.test.ts`

**Interfaces:**

```ts
export interface LocalCoachContext {
  date: string;
  calories: { consumed: number; target: number };
  waterMl: { consumed: number; target: number };
  diaryDaysLogged: number;
  workoutsCompleted: number;
  fastingSessionsCompleted: number;
  recentWorkoutEffort: 'comfortable' | 'mixed' | 'hard' | 'unknown';
}

export interface LocalRecommendation {
  id: string;
  category: 'nutrition' | 'hydration' | 'workout' | 'fasting' | 'recovery';
  title: string;
  action: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export function buildLocalCoachContext(date: string): LocalCoachContext;
export function getDailyRecommendations(context: LocalCoachContext): LocalRecommendation[];
export function getWeeklyRecommendation(contexts: LocalCoachContext[]): LocalRecommendation | null;
```

- [ ] Write tests for hydration gap, no-data fallback, comfortable workout progression, fasting consistency, and weekly wins.
- [ ] Read existing diary, water, workout, fasting, and onboarding stores through `getState()` without creating duplicate persistence.
- [ ] Use conservative thresholds and return no recommendation when data is sparse or conflicting.
- [ ] Keep all calculations pure and deterministic for the same store snapshot.
- [ ] Run the focused metrics tests.

### Task 3: Daily and Weekly Coach UI

**Files:**
- Create: `src/web/LocalCoachCard.tsx`
- Create: `src/web/LocalWeeklyReview.tsx`
- Modify: `src/web/HomeDashboard.tsx`
- Modify: `app/(tabs)/index.tsx`
- Test: `src/web/__tests__/localCoach.test.tsx`

- [ ] Add a daily card with one primary recommendation, optional actions, reason, confidence, dismiss, and snooze.
- [ ] Add a weekly review with wins, local trend summaries, one next-week experiment, and delete-history control.
- [ ] Show “Not enough local data yet” instead of guessing.
- [ ] Ensure all copy explicitly says “Computed on this device” where appropriate.
- [ ] Keep mobile layout single-column and desktop layout within existing web tokens.
- [ ] Test populated, empty, dismissed, snoozed, and weekly-review states.
- [ ] Run focused UI tests and web export.

### Task 4: Local Privacy Product Surface

**Files:**
- Modify: `app/onboarding/privacy-consent.tsx`
- Modify: `src/stores/privacy.ts`
- Modify: `src/web/WebProfile.tsx`
- Modify: `docs/legal/PRIVACY_POLICY.md`
- Modify: `docs/PRODUCTION_READINESS.md`

- [ ] Explain local-only storage and disabled tracking during onboarding.
- [ ] Add visible local-only status and controls for analytics, cloud sync, AI, and data export.
- [ ] Make export and deletion behavior clear for local data.
- [ ] Update legal copy to distinguish local mode from any future opt-in cloud mode.
- [ ] Add tests for consent and local-mode settings.

### Task 5: Privacy Verification Gate

**Files:**
- Create: `scripts/assert-local-privacy.js`
- Modify: `package.json`
- Modify: `e2e/web.spec.ts`
- Modify: `.github/workflows/deploy-web.yml`

- [ ] Add a static source/bundle assertion that rejects service-role keys, private provider keys, personalized AI payloads in local mode, analytics identify calls, and remote sync activation.
- [ ] Add a Jest/network-mock test that runs representative local flows and fails on unexpected `fetch` or Supabase invocation, allowing only explicitly public catalog URLs.
- [ ] Run the privacy assertion after web export.
- [ ] Add the assertion to the deployment workflow before Pages deployment.
- [ ] Run the full verification gate: `npm run check`, `npm run build:web`, `npm run test:e2e`, and `npm run assert:local-privacy`.
