# Phase 0-1 Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stabilize onboarding, theme persistence, food search, and Summary so the deployed web app has reliable critical user journeys.

**Architecture:** Add small shared selectors/helpers at the state and data boundaries, then keep native and web presentations separate. Route context such as the Summary date is passed explicitly, while local persistence remains Zustand/AsyncStorage and remote profile persistence remains Supabase.

**Tech Stack:** Expo SDK 57, Expo Router, React Native Web, Zustand 5, AsyncStorage, Supabase, Jest 29, Playwright.

## Global Constraints

- Read the exact Expo SDK `57.0.0` documentation before writing Expo code.
- Preserve native behavior while adding web-specific presentation where needed.
- Do not add dependencies.
- Do not expose service keys or provider credentials.
- Use `useThemeColors()` and web tokens instead of fixed page/surface colors.
- Run `npm run check` before claiming completion.
- Run `npm run build:web` and `npm run test:e2e` for web-facing changes.
- Do not revert unrelated dirty-worktree changes or create commits without explicit request.

---

### Task 1: Shared Persistence, Theme, and Target Contracts

**Files:**
- Modify: `src/stores/onboarding.ts`
- Modify: `src/stores/theme.ts`
- Create: `src/lib/nutritionTargets.ts`
- Test: `src/stores/__tests__/onboarding.test.ts`
- Test: `src/stores/__tests__/theme.test.ts`
- Test: `src/lib/__tests__/nutritionTargets.test.ts`

**Interfaces:**
- Produces persisted onboarding completion/profile fields, persisted theme mode, and `getNutritionTargets(onboarding)` returning calorie/protein/carbs/fat targets with one default policy.

- [ ] Write failing tests for onboarding hydration/completion persistence, theme mode persistence/system mode, and target defaults.
- [ ] Run the focused tests and verify the new expectations fail.
- [ ] Add Zustand persistence using the existing AsyncStorage pattern without persisting action functions or transient loading state.
- [ ] Add theme hydration and system appearance synchronization while preserving explicit light/dark overrides.
- [ ] Add `getNutritionTargets` and replace duplicate Summary/Diary fallback constants with it.
- [ ] Run the three focused test files and verify they pass.

### Task 2: Privacy Consent and Onboarding Journey

**Files:**
- Modify: `app/onboarding/privacy-consent.tsx`
- Modify: `src/web/WebOnboarding.tsx`
- Modify: `app/onboarding/index.tsx`
- Modify: `src/stores/auth.ts`
- Modify: `app/auth/signup.tsx`
- Modify: `app/_layout.tsx`
- Test: `src/web/__tests__/onboarding.test.tsx`
- Test: `src/stores/__tests__/auth.test.ts`
- Modify: `e2e/web.spec.ts`

**Interfaces:**
- Consumes persisted onboarding/theme state from Task 1.
- Produces explicit consent completion, validation parity, email-confirmation UI state, and reliable local reload routing.

- [ ] Add failing component tests for required consent gating, independent legal links, and dark-theme surfaces.
- [ ] Add a failing auth test for `signUp` returning a user without a session.
- [ ] Add a failing E2E test that completes local consent, reaches onboarding, reloads, and does not return to consent.
- [ ] Split legal links from the card press target and use theme-aware styles for labels, borders, links, and CTA states.
- [ ] Share required-field validation between native and web onboarding; block advancing with a visible field-level error.
- [ ] Persist local completion and make the root route decision use the hydrated value.
- [ ] Return an explicit email-confirmation result from auth and render a check-your-email state.
- [ ] Run focused Jest tests and the consent E2E test.

### Task 3: Food Search Relevance and Nutrition Normalization

**Files:**
- Modify: `src/lib/foodApi.ts`
- Modify: `src/web/FoodSearchSheet.tsx`
- Modify: `src/components/AddFoodSheet.tsx`
- Test: `src/lib/__tests__/foodApi.test.ts`
- Modify: `src/web/__tests__/foodSearch.test.tsx`

**Interfaces:**
- Produces `searchFoods(query, signal?)` that returns relevant, normalized `Food` entries or a typed error; callers ignore stale requests.

- [ ] Add failing API tests for unrelated products, non-OK responses, missing names, serving-vs-100g nutrient consistency, and zero-valued nutrients.
- [ ] Add a failing UI test proving an older response cannot replace a newer query’s results.
- [ ] Implement response validation, token relevance scoring, low-quality filtering, and one nutrition basis.
- [ ] Add request sequencing or `AbortController` to web and native callers with loading/error/empty states.
- [ ] Run food API and food search focused tests.

### Task 4: Date-Aware Summary and Web Presentation

**Files:**
- Modify: `app/summary.tsx`
- Modify: `app/(tabs)/diary.tsx`
- Modify: `src/web/screens/WebDiary.tsx`
- Create: `src/web/screens/WebSummary.tsx`
- Modify: `app/_layout.tsx` only if route gating requires shared summary handling
- Test: `src/web/__tests__/summary.test.tsx`
- Test: `src/stores/__tests__/diary.test.ts`

**Interfaces:**
- Summary accepts `date?: string`, defaults safely to today, and uses the same date and targets for calories, macros, water, meals, meditation, and active-state display.

- [ ] Add failing tests for a historical date, empty date, target defaults, and web shell heading/CTA.
- [ ] Pass the selected Diary date when navigating to Summary.
- [ ] Centralize date parsing and use the same date in every Summary selector.
- [ ] Build responsive `WebSummary` with shared cards, empty states, and theme-aware status colors.
- [ ] Render Summary in the authenticated web shell without changing native navigation behavior.
- [ ] Run focused Summary tests and a desktop/mobile browser smoke check.

### Task 5: Phase 0-1 Regression and Deployment Gate

**Files:**
- Modify: `scripts/assert-web-export.js`
- Modify: `e2e/web.spec.ts`
- Modify: `docs/ROADMAP-PHASE-0-1.md`

- [ ] Add browser coverage for consent, Summary, theme controls, and no horizontal overflow on critical routes.
- [ ] Require exported consent, Summary, Diary, and auth routes to contain visible headings and controls.
- [ ] Run `npm run check`.
- [ ] Run `npm run build:web`.
- [ ] Run `npm run test:e2e` locally.
- [ ] Deploy the verified `dist/` to Cloudflare Pages and run `WEB_BASE_URL=<deployment-url> npm run test:e2e`.
- [ ] Record the deployment URL, test counts, known non-blocking warnings, and any remaining P1 items.
