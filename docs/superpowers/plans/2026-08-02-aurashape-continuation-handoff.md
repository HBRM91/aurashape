# Aurashape Continuation Development Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to execute this plan task-by-task. Do not skip the review gate between tasks.

**Goal:** Continue Aurashape from the completed public web foundation to a polished authenticated web product, then add safe AI reading, food capture, adaptive coaching, browser QA, and Cloudflare Pages release verification.

**Architecture:** Keep Expo Router, native screens, Zustand stores, Supabase, and the existing native navigation unchanged. Add web-specific presentation behind `Platform.OS === 'web'`, use `Slot` for the authenticated web shell, use explicit React Native `StyleSheet` tokens for web-critical UI, and keep all AI provider credentials inside Supabase Edge Functions.

**Tech Stack:** Expo SDK 57, Expo Router v4, React Native Web, React 19.2.3, Zustand 5, NativeWind 4.2.6, Tailwind CSS 3.4.17, Supabase, TypeScript strict mode, Jest 29, Playwright, Cloudflare Pages.

## Current State

- Tasks 1-6 are complete and review-clean in the dirty worktree.
- Task 7 web shell is implemented but is not acceptance-ready until the Learn route is shell-wrapped and export assertions prove shell navigation.
- The answer to the pending implementation question is: keep `/articles` as the existing top-level route, wrap only its web branch in `WebAppShell`, and preserve the native branch unchanged.
- Latest reported verification after Task 7 implementation: `npm run check` passed with 28 suites and 331 tests; `npm run build:web` passed with 33 static routes.
- The Task 7 review found that `/articles` loses the shell after navigation, exported route HTML does not consistently prove shell navigation, and More lacks an active state when its hidden route is selected.
- Do not revert unrelated dirty-worktree changes. Inspect before editing.
- Do not commit unless the user explicitly requests commits.

## Non-Negotiable Constraints

- Read the exact Expo SDK `57.0.0` documentation before writing Expo code: `https://docs.expo.dev/versions/v57.0.0/`.
- Run `npm run check` before claiming any task is complete.
- Run `npm run build:web` for every web-facing task.
- Preserve native behavior and native route forms.
- Public static routes must contain visible HTML without waiting for a client effect.
- Never put Supabase service-role keys, model keys, Resend keys, or provider credentials in client code or committed environment files.
- Use local committed assets for first-render imagery.
- Use `useThemeColors()` for existing theme-aware native/shared behavior.
- Keep the web layout usable at 1440px desktop and 390px mobile widths.
- Every user-facing async state needs loading, empty, error, retry, and success behavior where applicable.
- Rotate the Supabase secret key that was previously exposed outside the project before production deployment.

## Files And Responsibilities

- `app/_layout.tsx`: auth initialization and route gating; never reintroduce a public spinner-only render.
- `src/stores/auth.ts`: bounded session initialization and visible auth errors.
- `src/lib/authRouting.ts`: pure route destination decisions.
- `src/lib/supabase.ts`: client setup and web OAuth URL-session detection.
- `src/web/tokens.ts`: web colors, spacing, typography, radii, shadows, and content widths.
- `src/web/WebAppShell.tsx`: responsive authenticated shell container.
- `src/web/WebSidebar.tsx`: desktop navigation.
- `src/web/WebTopBar.tsx`: page title and profile/context actions.
- `src/web/WebMobileNav.tsx`: compact mobile navigation and More menu.
- `src/web/navItems.ts`: route metadata and active-state matching.
- `scripts/build-web.ps1`: deterministic export and static HTML/asset assertions.
- `.superpowers/sdd/2026-08-02-aurashape-web-foundation-and-ai-roadmap/`: task reports and ledger.

## Task 7A: Close The Web Shell Review

**Files:**
- Modify: `app/articles.tsx`
- Modify: `src/web/WebMobileNav.tsx` or `src/web/navItems.ts`
- Modify: `scripts/build-web.ps1`
- Modify: `src/web/__tests__/webNavigation.test.tsx`
- Update: `.superpowers/sdd/2026-08-02-aurashape-web-foundation-and-ai-roadmap/task-7-report.md`
- Update: `.superpowers/sdd/2026-08-02-aurashape-web-foundation-and-ai-roadmap/progress.md`

**Actions:**

1. Read `app/articles.tsx`, identify the existing native and web render branches, and import `WebAppShell` only as needed.
2. Keep `/articles` top-level. In the web branch, render `WebLearn` as the child of `<WebAppShell title="Learn">`. Leave the native branch structurally unchanged.
3. Ensure the web `/articles` output contains the same sidebar/top-bar/mobile navigation labels as tab routes.
4. When the active route is represented only inside the mobile More menu, mark the More control as selected and retain `aria-expanded`; do not mark unrelated visible items selected.
5. Add tests for `getActiveNavItem('/articles')`, hidden-route More selection, and the web Learn shell wrapper. Do not test implementation details that are not observable.
6. Extend `scripts/build-web.ps1` to require shell navigation text or accessible labels in `/articles`, `/diary`, `/fasting`, and `/profile`. Keep assertions deterministic and route-specific.
7. Export and inspect the generated HTML. Confirm each asserted route contains both its screen heading and shell navigation marker.

**Verification:**

```powershell
npm test -- --runInBand src/web/__tests__/webNavigation.test.tsx
npm run build:web
npm run check
```

**Acceptance:** Task 7 is complete only when the focused tests pass, every shell assertion passes, `npm run check` passes, and the review finds no open high or medium findings.

## Task 8: Build The Home Dashboard Vertical Slice

**Files:**
- Inspect first: `app/(tabs)/index.tsx`, relevant diary/water/achievement/tip stores, existing home tests.
- Modify: `app/(tabs)/index.tsx`
- Create: `src/web/HomeDashboard.tsx`
- Create: `src/web/MetricCard.tsx`
- Create: `src/web/ScienceTipCard.tsx`
- Create: `src/web/QuickActionGrid.tsx`
- Test: `src/web/__tests__/homeDashboard.test.tsx`

**Actions:**

1. Map the existing store selectors and action signatures before writing components. Do not invent duplicate state or bypass store actions.
2. Preserve the existing native home component behind the native branch.
3. Build a web dashboard with greeting, date/context, calorie and macro summary, hydration progress, streak, recent activity, science tip, and quick actions.
4. Add working CTAs for Log food, Start fast, Start workout, and Read science using existing Expo Router destinations.
5. Use a responsive desktop grid and one-column mobile layout. Cards must shrink or stack instead of causing horizontal overflow.
6. Render safe empty states when no diary, hydration, streak, or tip data exists.
7. Test empty day, populated day, water progress, streak value, science tip, and CTA destinations with mocked store state.

**Acceptance:** Native home remains unchanged, web home renders useful static content, tests cover empty and populated states, `npm run build:web` passes, and `npm run check` passes.

## Task 9: Upgrade The Remaining Web Screens

**Files:**
- Modify: `app/(tabs)/diary.tsx`
- Modify: `app/(tabs)/fasting.tsx`
- Modify: `app/(tabs)/workout.tsx`
- Modify: `app/(tabs)/progress.tsx`
- Modify: `app/(tabs)/community.tsx`
- Modify: `app/articles.tsx`
- Modify: `app/(tabs)/profile.tsx`
- Create: `src/web/screens/WebDiary.tsx`
- Create: `src/web/screens/WebFasting.tsx`
- Create: `src/web/screens/WebWorkout.tsx`
- Create: `src/web/screens/WebProgress.tsx`
- Create: `src/web/screens/WebCommunity.tsx`
- Create: `src/web/screens/WebLearn.tsx`
- Create: `src/web/screens/WebProfile.tsx`
- Test: `src/web/screens/__tests__/*.test.tsx`

**Actions:**

1. Work one route at a time: Diary, Fasting, Workout, Progress, Community, Learn, Profile.
2. For each route, identify existing store reads/actions and preserve them; do not create fake duplicate persistence.
3. Keep each native route branch unchanged and render the new web screen only on web.
4. Give every screen a clear heading, primary action, responsive content container, empty state, and error/retry state for remote data.
5. Use desktop grids/tables/cards where the information density requires it, and stack content at mobile width.
6. Use local illustrations for science guides, recipes, progress empty states, and community empty states only where they improve comprehension.
7. Add route-level tests for heading, primary action, empty state, and key store action.
8. Export all routes and inspect both desktop-sized and mobile-sized browser output before moving on.

**Acceptance:** All seven routes retain the authenticated shell, all native routes still typecheck and test, no route has horizontal overflow at 390px, and all checks pass.

## Task 10: Define Safe AI Contracts And Server Boundary

**Files:**
- Create: `supabase/functions/ai-coach/index.ts`
- Create: `src/lib/aiTypes.ts`
- Create: `src/lib/aiSafety.ts`
- Test: `src/lib/__tests__/aiSafety.test.ts`

**Required Types:**

```ts
type FoodAnalysisResult = {
  items: Array<{ name: string; quantity?: string; calories?: number; protein?: number; carbs?: number; fat?: number; confidence: number }>;
  estimatedCalories?: number;
  macros?: { protein?: number; carbs?: number; fat?: number };
  confidence: number;
  assumptions: string[];
  warnings: string[];
};

type ReadingSummary = {
  title: string;
  summary: string;
  claims: Array<{ text: string; evidenceGrade: 'A' | 'B' | 'C' | 'D' | 'unknown'; citations: string[] }>;
  practicalActions: string[];
  disclaimer: string;
};
```

**Actions:**

1. Write tests rejecting diagnosis, medication changes, eating-disorder encouragement, unsupported certainty, and uncited medical claims.
2. Implement runtime validation and safety filtering before returning data to the client.
3. Require an authenticated Supabase user in the Edge Function.
4. Read provider credentials only from Edge Function environment variables. Never import them into React Native code.
5. Return deterministic mock data in Jest; never call a live model from tests.
6. Add explicit unavailable/error responses when provider configuration is absent.

**Acceptance:** Safety tests pass, invalid model output is rejected or downgraded, every reading result has uncertainty/citations/disclaimer, and client bundles contain no provider secret names or values.

## Task 11: Add AI Reading Mode

**Files:**
- Create: `src/web/ReadingMode.tsx`
- Create: `src/stores/reading.ts`
- Create: `src/lib/readingSources.ts`
- Modify: `app/articles.tsx`
- Create: `supabase/functions/ai-coach/read.ts`
- Test: `src/web/__tests__/readingMode.test.tsx`

**Actions:**

1. Define a local article/source model with stable IDs, title, summary, source URL, and evidence metadata.
2. Add Explain this and Read deeper actions to Learn content.
3. Show concise summary, claim-level evidence grade, citations, limitations, practical actions, and a health disclaimer.
4. Persist saved articles and recent explanations in a Zustand store with local persistence.
5. Add loading, unavailable, retry, and offline fallback states.
6. Add tests for claim highlighting, evidence display, citations, saving, and offline fallback.
7. Add rate limiting at the Edge Function boundary and reject unauthenticated requests.

**Acceptance:** Reading mode is useful without AI configured, all claims display source/certainty context, and no medical diagnosis or treatment advice is generated.

## Task 12: Add Food Capture And Adaptive Coaching

**Files:**
- Create: `supabase/functions/ai-coach/food.ts`
- Create: `src/web/FoodCapture.tsx`
- Create: `src/stores/coach.ts`
- Modify: `app/(tabs)/diary.tsx`
- Modify: `app/(tabs)/index.tsx`
- Test: `src/web/__tests__/foodCapture.test.tsx`

**Actions:**

1. Normalize text/photo input into an explicit request payload with user confirmation.
2. Show preview, loading, retry, manual edit, confidence, assumptions, and warning states.
3. Never auto-log low-confidence estimates. Require explicit Add to diary confirmation.
4. Insert only user-confirmed values through the existing diary store action.
5. Generate weekly coaching recommendations from local metrics and explain the reason for every recommendation.
6. Add controls to disable AI, delete AI history, and opt out of model processing.
7. Test text input, photo input normalization, low-confidence rejection, correction, confirmation, diary insertion, and opt-out behavior.

**Acceptance:** A user can correct every estimate before logging, low-confidence results cannot silently alter the diary, and the feature works with the AI backend unavailable.

## Task 13: Add Weekly Adaptive Plans

**Files:**
- Create: `src/stores/plan.ts`
- Create: `src/web/WeeklyPlan.tsx`
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/workout.tsx`
- Modify: `app/(tabs)/fasting.tsx`
- Test: `src/stores/__tests__/plan.test.ts`

**Actions:**

1. Derive a plan from the existing user goal/activity data and store it locally.
2. Combine meals, workouts, fasting, hydration, and recovery into daily actions.
3. Add Today’s next best action to Home.
4. Mark tasks complete and support missed-day recovery without punishment or streak shaming.
5. Test generation, completion, missed-day recovery, and persistence.

**Acceptance:** Plan generation is deterministic for the same inputs, recovery is gentle, and native/web screens use the same store without duplicated plan state.

## Task 14: Add Browser Smoke Tests

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `e2e/web.spec.ts`
- Create: `scripts/assert-web-export.ps1`

**Actions:**

1. Add Playwright and configure Chromium against the exported `dist/` directory through a local static server.
2. Test landing, login, signup, forgot-password, and protected-route behavior.
3. Test 1440px and 390px viewports for visible primary actions, shell navigation, no horizontal overflow, and no uncaught console errors.
4. Assert CSS, JavaScript, SVG, PNG, and route requests return successful responses.
5. Run browser tests after `npm run build:web`; add them to CI only after they are stable locally.

**Acceptance:** Browser tests pass against a fresh export and fail if a route silently regresses to a spinner-only page or an asset 404.

## Task 15: Deploy And Verify Cloudflare Pages

**Files:**
- Modify: `.github/workflows/deploy-docs.yml` or create a dedicated web deployment workflow.
- Modify: `docs/ROADMAP.md`
- Modify: `docs/SUBMISSION_CHECKLIST.md`

**Actions:**

1. Rotate the previously exposed Supabase secret key before production deployment.
2. Confirm public Supabase URL and anon/publishable key are the only client-side Supabase credentials.
3. Run `npm run build:web` and the complete browser suite.
4. Deploy `dist/` to a Cloudflare Pages preview using the existing project configuration.
5. Run browser smoke tests against the preview URL.
6. Verify landing, auth, shell, assets, and representative app routes manually and through HTTP requests.
7. Promote only after no console errors, no asset 404s, no horizontal overflow, and all acceptance checks pass.

## Required Per-Task Handoff Format

For each task, the implementing model must:

1. Read the task section and all referenced files before editing.
2. Add or update focused tests before production changes when behavior is new.
3. Run focused tests first, then `npm run build:web`, then `npm run check`.
4. Run `git diff --check` and inspect `git status --short`.
5. Append a report under `.superpowers/sdd/2026-08-02-aurashape-web-foundation-and-ai-roadmap/` containing files changed, tests run, results, known concerns, and whether the task is acceptance-ready.
6. Ask for review only after evidence exists; do not claim completion from intent.

## Final Release Gate

The project is not release-ready until all of the following are true:

- `npm run check` passes.
- `npm run build:web` passes from a clean export.
- Playwright smoke tests pass at desktop and mobile widths.
- Public HTML contains visible content without hydration.
- Authenticated shell navigation works on every listed route, including `/articles`.
- Native route behavior remains intact.
- No client bundle contains secret credentials.
- AI responses include confidence, limitations, citations where applicable, and disclaimers.
- Low-confidence nutrition estimates require manual confirmation.
- Supabase secret rotation is complete.
- Cloudflare Pages preview has no console errors or asset 404s.
