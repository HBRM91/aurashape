# Aurashape Complete Competitive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Aurashape into a top-tier health app that competes directly with MyFitnessPal (food logging depth), YAZIO (meal planning and fasting), and Freeletics (workout intelligence) — on both native and web.

**Architecture:** Keep Expo Router, Zustand, Supabase, and native screens. Web uses `Platform.OS === 'web'` branching with explicit `StyleSheet` tokens. AI runs server-side via Supabase Edge Functions calling OpenAI GPT-4o-mini. PWA enables offline food logging with background sync.

**Tech Stack:** Expo SDK 57, React Native Web 0.21, Expo Router, React 19.2.3, Zustand 5, Supabase (Auth/Postgres/Edge Functions/Storage), NativeWind 4.2.6, Tailwind CSS 3.4.17, OpenAI GPT-4o-mini, TypeScript strict mode, Jest 29, Playwright, Cloudflare Pages.

## Global Constraints

- Expo SDK 57 targets React Native 0.86, React 19.2.3, and React Native Web 0.21.0.
- Do not expose Supabase service keys, OpenAI keys, or provider credentials in the client bundle.
- Preserve existing native routes and native behavior while adding web-specific presentation.
- Public web routes must render visible HTML during static export; they must never depend on a client effect to show the first screen.
- Keep local Zustand persistence as the web MVP source of truth; Supabase sync remains asynchronous and recoverable.
- Use local committed images/SVGs for core UI; no external image API is required for the first render.
- Every task ends with a focused test and the project-wide `npm run check` before handoff.
- Rotate the Supabase secret that was shared outside the project before production deployment.
- Web Lighthouse performance score target: ≥85 on desktop, ≥70 on mobile.
- Every AI response must include confidence, assumptions/limitations, and a health disclaimer.
- Never auto-log low-confidence nutrition estimates; always require explicit user confirmation.
- Every user-facing async state needs loading, empty, error, retry, and success behavior.

---

## Completed Tasks (1-7) — Do Not Re-implement

Tasks 1-6 are complete and review-clean. Task 7 is implemented with one remaining fix (7A below).

| Task | Status | What It Built |
|------|--------|---------------|
| 1 | ✅ | Pure route-guard decisions (`src/lib/authRouting.ts`) |
| 2 | ✅ | Static spinner deadlock removed; auth initialization bounded |
| 3 | ✅ | Deterministic web styling (NativeWind 4.2.6 + Tailwind 3.4.17) |
| 4 | ✅ | Design tokens and web primitives (`src/web/tokens.ts`, WebButton, WebCard, WebField, WebLogo, WebSection) |
| 5 | ✅ | Public landing page with local SVG artwork |
| 6 | ✅ | Responsive auth pages with SSR artwork, OAuth, validation, error states |
| 7 | ✅ | Responsive web shell with sidebar, top bar, mobile nav, Slot integration |

---

## Phase 1: Close The Shell Gap

### Task 7A: Fix Learn Route Shell Integration

**Files:**
- Modify: `app/articles.tsx`
- Modify: `src/web/WebMobileNav.tsx` or `src/web/navItems.ts`
- Modify: `scripts/build-web.ps1`
- Modify: `src/web/__tests__/webNavigation.test.tsx`
- Update: `.superpowers/sdd/2026-08-02-aurashape-web-foundation-and-ai-roadmap/task-7-report.md`

**Actions:**

1. Read `app/articles.tsx` and identify the native and web branches.
2. In the web branch only, wrap `WebLearn` in `<WebAppShell title="Learn">`. Keep the native branch unchanged.
3. When the active route is only in the mobile More menu, mark More as selected with `aria-expanded`; do not mark unrelated visible items selected.
4. Add tests for `getActiveNavItem('/articles')` and hidden-route More selection.
5. Extend `scripts/build-web.ps1` to assert shell navigation labels appear in `/articles`, `/diary`, `/fasting`, `/profile` HTML.
6. Export and confirm each route HTML contains both screen heading and shell navigation marker.

**Verification:**
```powershell
npm test -- --runInBand src/web/__tests__/webNavigation.test.tsx
npm run build:web
npm run check
```

**Acceptance:** Shell persists on all routes including `/articles`. Export assertions pass. No open review findings.

---

## Phase 2: Polish Existing Web Screens

The web screens already exist (400-800 lines each) and are functional. These tasks fill the specific UX gaps that prevent them from competing with MyFitnessPal/YAZIO/Freeletics.

### Task 8: Add Web Food Search, Barcode, and Quick-Add to Diary

**Files:**
- Modify: `src/web/screens/WebDiary.tsx`
- Create: `src/web/FoodSearchSheet.tsx`
- Create: `src/web/BarcodeLookupSheet.tsx`
- Create: `src/web/RecentFoodsList.tsx`
- Modify: `src/stores/diary.ts` (add favorites/recent tracking if missing)
- Test: `src/web/__tests__/foodSearch.test.tsx`

**Why:** MyFitnessPal's #1 advantage is frictionless food logging. The current web diary shows "Add Food" but has no search flow, barcode lookup, recent foods, or favorites. Users can't actually log food on web.

**Actions:**

1. Read `src/web/screens/WebDiary.tsx` and `app/barcode.tsx` to understand the existing add-food flow and barcode scanner.
2. Build `FoodSearchSheet`: text input with debounced search against Open Food Facts API (`src/lib/foodApi.ts`), results list with food name/brand/macros per serving, tap to select.
3. Build `BarcodeLookupSheet`: manual barcode number input for web (camera barcode is native-only), lookup via existing `lookupBarcode()` from `foodApi.ts`, show result with meal slot picker.
4. Build `RecentFoodsList`: show the user's 20 most recently logged foods from diary store, one-tap re-add with same meal slot.
5. Add a "Favorites" toggle on each food result; show favorites section at top of search sheet.
6. Wire the add-food flow: meal slot selection → serving size → confirm → `addEntry()`.
7. Test: search returns results, barcode lookup works, recent foods appear, favorites persist, entries are added correctly.
8. Verify the diary web screen at 390px and 1440px widths.

**Acceptance:** A web user can search for food, look up barcodes, access recent foods, favorite items, and log entries without leaving the diary page. Tests pass. `npm run check` passes.

### Task 9: Add Web Onboarding Flow

**Files:**
- Modify: `app/onboarding/index.tsx` (add web branch)
- Create: `src/web/WebOnboarding.tsx`
- Create: `src/web/onboarding/GoalStep.tsx`
- Create: `src/web/onboarding/BodyStep.tsx`
- Create: `src/web/onboarding/ActivityStep.tsx`
- Create: `src/web/onboarding/FastingStep.tsx`
- Create: `src/web/onboarding/SummaryStep.tsx`
- Test: `src/web/__tests__/webOnboarding.test.tsx`

**Why:** A web user who signs up currently has no way to set goals, enter body info, or calculate macros. The native 6-step wizard exists but has no web branch.

**Actions:**

1. Read `app/onboarding/index.tsx` and `src/stores/onboarding.ts` to understand the existing wizard steps, fields, and `saveProfile()` action.
2. Add `Platform.OS === 'web'` branch in `app/onboarding/index.tsx` that renders `WebOnboarding`.
3. Build responsive step wizard: desktop side-by-side layout (form left, illustration/progress right), mobile stacked.
4. Implement each step reusing existing onboarding store fields: Goal → Body Info → Activity + Diet → Fasting Plan → Summary (auto-calculated TDEE/macros).
5. Use `WebButton`, `WebField`, `WebCard` primitives. Add step progress indicator.
6. On completion, call existing `saveProfile()` and redirect to the app shell.
7. Test: step navigation, field validation, TDEE calculation, save profile, redirect.
8. Ensure native onboarding remains unchanged.

**Acceptance:** Web users can complete onboarding end-to-end. TDEE/macros match the native calculator. Profile is saved to Supabase. Tests pass.

### Task 10: Upgrade Dashboard With Trends, Coach, and Plan Integration

**Files:**
- Modify: `src/web/HomeDashboard.tsx`
- Create: `src/web/TrendSparkline.tsx`
- Create: `src/web/CoachCard.tsx`
- Modify: `src/web/QuickActionGrid.tsx` (if needed)
- Test: `src/web/__tests__/homeDashboard.test.tsx`

**Why:** The dashboard exists but lacks the intelligence layer that makes users return daily. Competitors show weight trends, coaching nudges, and "what to do next" prominently.

**Actions:**

1. Read `src/web/HomeDashboard.tsx`, `src/stores/coach.ts`, `src/stores/plan.ts`, `src/stores/insights.ts`, and `src/stores/body.ts`.
2. Add a weight trend sparkline (last 14 days) using SVG polyline with min/max/current labels. Use existing `bodyStore.weightEntries`.
3. Add a "Today's Plan" card showing the current day's plan items from `planStore.getToday()` with checkbox completion.
4. Add a "Coach Insight" card showing the most recent recommendation from `coachStore` with apply/dismiss actions.
5. Add a weekly calorie adherence bar chart (7 days of consumed vs target) using simple SVG bars.
6. Improve the quick actions grid: add "Scan Barcode" (links to `/barcode`), "View Recipes" (links to `/recipes`).
7. Test: empty state (no data), populated state (data exists), trend calculation, plan items, coach insight.

**Acceptance:** Dashboard shows actionable intelligence, not just data. Trends, plans, and coaching are visible on first load. Tests pass. `npm run check` passes.

---

## Phase 3: Real AI Implementation

### Task 11: Wire OpenAI Into Food Analysis Edge Function

**Files:**
- Modify: `supabase/functions/ai-coach/food.ts`
- Modify: `supabase/functions/ai-coach/index.ts`
- Create: `supabase/functions/ai-coach/openai.ts` (shared OpenAI client)
- Modify: `src/lib/aiTypes.ts` (finalize types)
- Modify: `src/web/FoodCapture.tsx` (remove hardcoded analysis)
- Test: `src/lib/__tests__/aiSafety.test.ts` (update for real response validation)

**Why:** The current food analysis returns hardcoded guesses ("chicken" → 280cal). This is the #1 AI differentiator vs all three competitors. Without real AI, the "moat" doesn't exist.

**Actions:**

1. Read all existing edge functions, `src/lib/aiTypes.ts`, `src/web/FoodCapture.tsx`, and safety tests.
2. Create `supabase/functions/ai-coach/openai.ts`: export a function that calls `https://api.openai.com/v1/chat/completions` with `gpt-4o-mini`, reads `OPENAI_API_KEY` from environment, and returns parsed JSON.
3. Rewrite `supabase/functions/ai-coach/food.ts`:
   - Accept `{ description?: string, imageBase64?: string }`.
   - For text: send prompt asking for structured `{ items: [...], estimatedCalories, macros, confidence, assumptions, warnings }`.
   - For images: send to GPT-4o-mini vision endpoint with same structured output prompt.
   - Parse response, validate against `FoodAnalysisResult` schema.
   - Apply safety filter: reject if response contains medical claims.
   - Return `{ data, error }` shape.
4. Update `src/web/FoodCapture.tsx`: remove hardcoded `analyzeFood()`, call the edge function via `supabase.functions.invoke('ai-coach', { body: { action: 'analyze_food', description } })`.
5. Add retry logic and timeout handling in the edge function.
6. Update safety tests to validate real response schemas.
7. Test with mocked OpenAI responses (never call live API from Jest).

**Acceptance:** Food analysis returns real GPT-4o-mini estimates with confidence scores, assumptions, and warnings. Low-confidence results require manual correction. No hardcoded responses remain. Safety tests pass.

### Task 12: Wire OpenAI Into Reading Mode and Coaching Edge Functions

**Files:**
- Modify: `supabase/functions/ai-coach/read.ts`
- Modify: `supabase/functions/ai-coach/index.ts`
- Modify: `src/web/ReadingMode.tsx`
- Modify: `src/stores/coach.ts` (verify real data flow)
- Create: `src/web/CoachInsightPanel.tsx`
- Test: `src/web/__tests__/readingMode.test.tsx`

**Why:** Reading mode returns placeholder evidence grades. The AI coach returns template recommendations. These need real LLM analysis to be the science-cited differentiator.

**Actions:**

1. Rewrite `supabase/functions/ai-coach/read.ts`:
   - Accept `{ articleId, text, question }`.
   - Send to GPT-4o-mini with prompt: "Analyze this health claim. Return structured JSON with summary, claims (each with evidenceGrade A-D and citations), practicalActions, limitations, and disclaimer."
   - Validate: every claim must have evidenceGrade and at least one citation URL.
   - Safety filter: reject diagnosis, medication, eating-disorder content.
   - Return `ReadingSummary` shape.
2. Update `src/web/ReadingMode.tsx`: call the real edge function, show loading/retry states, display real evidence grades and citations.
3. Update `coachStore.generateWeeklyPlan()` to call the edge function for real recommendations based on the user's actual diary/workout/fasting data.
4. Build `CoachInsightPanel`: a web component showing coaching recommendations with apply/dismiss, reason explanation, and "Why this?" expandable.
5. Add rate limiting: max 20 AI calls per user per day in the edge function.
6. Test with mocked responses.

**Acceptance:** Reading mode shows real evidence grades with citations. Coaching generates data-driven recommendations. Rate limiting works. No placeholder responses remain.

---

## Phase 4: Competitive Feature Gaps

### Task 13: Build Meal Planning Workflow

**Files:**
- Modify: `src/web/screens/WebDiary.tsx` (add meal plan tab)
- Create: `src/web/MealPlanner.tsx`
- Create: `src/web/GroceryList.tsx`
- Modify: `src/stores/recipes.ts` (add plan generation if missing)
- Test: `src/web/__tests__/mealPlanner.test.tsx`

**Why:** YAZIO's #1 feature is "here's your week of meals with a grocery list." The recipe and meal plan stores exist but there's no drag-to-calendar UI or grocery list generation.

**Actions:**

1. Read `src/stores/recipes.ts` (has `setMealPlan`/`getMealPlan`), `src/lib/recipes.ts` (20 curated recipes), and `src/web/screens/WebDiary.tsx`.
2. Build `MealPlanner`: 7-day calendar grid (desktop) or day-by-day swipe (mobile). Each day shows breakfast/lunch/dinner slots. User can browse recipes and assign to slots.
3. Add "Auto-fill week" button: use `getSuggestions()` to fill empty slots with macro-aware recipe suggestions based on remaining daily targets.
4. Build `GroceryList`: aggregate ingredients from all planned meals, group by category (produce, protein, dairy, pantry), show quantities. Checkbox to mark items bought.
5. Add "Log planned meal" action: convert a planned meal into diary entries for today.
6. Test: add meal to plan, auto-fill, grocery list aggregation, log planned meal.
7. Verify at desktop and mobile widths.

**Acceptance:** Users can plan a week of meals, see a generated grocery list, and log planned meals to their diary. The workflow matches YAZIO's core offering.

### Task 14: Add Workout Intelligence

**Files:**
- Modify: `src/web/screens/WebWorkout.tsx`
- Create: `src/web/RestTimer.tsx`
- Create: `src/web/WorkoutProgressChart.tsx`
- Modify: `src/stores/workout.ts` (add progression tracking if missing)
- Modify: `src/stores/workoutPlan.ts` (add adaptation logic)
- Test: `src/web/__tests__/workoutIntelligence.test.tsx`

**Why:** Freeletics' moat is adaptive training. The workout store has 5 static templates and no rest timer, no progression tracking, and no adaptation.

**Actions:**

1. Read `src/stores/workout.ts`, `src/stores/workoutPlan.ts`, `src/web/screens/WebWorkout.tsx`, and `src/lib/exercises.ts`.
2. Build `RestTimer`: configurable countdown (30/60/90/120s) with audio beep at completion, auto-starts after logging a set.
3. Build `WorkoutProgressChart`: SVG chart showing volume progression over the last 12 sessions for the current exercise, with trend line.
4. Add workout difficulty adaptation to `workoutPlanStore`: if user consistently completes all sets with reps to spare, suggest weight increase; if failing sets, suggest decrease.
5. Add "Personal Best" badge on exercises where the user has a PR from `workoutStore`.
6. Add exercise instructions/tips display during active workout (from `exercises.ts` data).
7. Test: rest timer countdown, volume chart data, PR display, adaptation suggestions.

**Acceptance:** Workouts feel intelligent: rest timer auto-starts, progression is visible, PRs are celebrated, and templates adapt to performance. Matches Freeletics' coaching feel.

### Task 15: Add Progress Intelligence and Insights

**Files:**
- Modify: `src/web/screens/WebProgress.tsx`
- Create: `src/web/ProgressInsights.tsx`
- Create: `src/web/BodyCompositionChart.tsx`
- Modify: `src/stores/insights.ts` (add cross-domain analysis)
- Test: `src/web/__tests__/progressInsights.test.tsx`

**Why:** All three competitors show trends, predictions, and correlations. The progress screen shows raw data but not intelligence.

**Actions:**

1. Read `src/web/screens/WebProgress.tsx`, `src/stores/body.ts`, `src/stores/insights.ts`, `src/stores/diary.ts`, `src/stores/workout.ts`, `src/stores/fasting.ts`.
2. Build `BodyCompositionChart`: SVG multi-line chart showing weight, waist, and body fat % on the same timeline with legend and toggleable series.
3. Build `ProgressInsights`:
   - Weight trend: 7-day moving average with direction arrow (↑↓→).
   - Predicted goal date: extrapolate from current rate of change to reach target weight.
   - Workout volume trend: weekly volume over 8 weeks.
   - Fasting consistency: % of planned fasts completed in last 30 days.
   - Cross-domain insight: "On days you fast 16+ hours, your average calorie intake is X% lower" (computed from local data).
4. Add "Share progress" button generating a summary card.
5. Test: trend calculations, prediction accuracy, cross-domain insights with mocked data.

**Acceptance:** Progress screen shows actionable intelligence: trend direction, goal predictions, and cross-domain correlations. Matches YAZIO/MyFitnessPal's progress depth.

---

## Phase 5: PWA, Performance, and QA

### Task 16: Add Basic PWA Support

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `app/+html.tsx` (add manifest link)
- Modify: `scripts/build-web.ps1` (copy PWA files to dist)
- Test: `e2e/pwa.spec.ts`

**Why:** Health apps need offline capability. Users log food at restaurants, track workouts at gyms — both often have poor connectivity.

**Actions:**

1. Create `public/manifest.json` with app name, icons, theme color, display: standalone, start URL.
2. Create `public/sw.js`: cache static assets (CSS, JS, images) on install. Cache API responses with stale-while-revalidate strategy.
3. Add offline food logging: when offline, diary entries are queued in localStorage. On reconnect, sync to Supabase via existing `syncStore`.
4. Register service worker in `app/+html.tsx` with update prompt.
5. Add "Install app" prompt on web using `beforeinstallprompt` event.
6. Test: manifest loads, service worker registers, offline diary entry queues, online sync triggers.
7. Verify PWA installability in Chrome DevTools.

**Acceptance:** App is installable as PWA. Static assets are cached. Food logging works offline with background sync. No data loss on connectivity loss.

### Task 17: Optimize Web Performance

**Files:**
- Modify: `src/web/screens/*.tsx` (lazy loading)
- Modify: `src/web/WebAppShell.tsx` (code splitting)
- Modify: `app/+html.tsx` (preload hints)
- Modify: `metro.config.js` (if needed)
- Test: Manual Lighthouse audit

**Why:** Competitors load in <2s. No performance budget exists. Heavy screens (Workout 797 lines, Community 571 lines) load eagerly.

**Actions:**

1. Add `React.lazy()` and `Suspense` for all tab screens inside the web shell. Only load the active tab's code.
2. Add `<link rel="preload">` hints for critical CSS and the main JS bundle in `app/+html.tsx`.
3. Optimize images: convert PNGs to WebP where possible, add `loading="lazy"` for below-fold images.
4. Add bundle analysis: run `npx expo export --platform web --dump-sourcemap` and check for oversized chunks.
5. Run Lighthouse on desktop (1440px) and mobile (390px) against the local static server.
6. Target: Performance ≥85 desktop, ≥70 mobile. Fix any render-blocking resources.
7. Add performance regression check to `scripts/build-web.ps1` (warn if dist size exceeds threshold).

**Acceptance:** Lighthouse scores meet targets. Initial page load <3s on 3G. Tab switching is instant with lazy loading.

### Task 18: Add Playwright Browser Tests

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `e2e/web.spec.ts`
- Create: `e2e/auth.spec.ts`
- Create: `e2e/diary.spec.ts`
- Create: `scripts/assert-web-export.ps1`

**Actions:**

1. Add Playwright with Chromium against the local static server.
2. `e2e/web.spec.ts`: landing page loads, CTA buttons visible, auth pages render forms, responsive layouts at 1440px/390px.
3. `e2e/auth.spec.ts`: login form validation, signup form validation, forgot-password flow, OAuth button presence.
4. `e2e/diary.spec.ts`: food search appears, meal slots visible, add food flow (with mocked API).
5. Assert CSS, JS, SVG, PNG, and route requests return 200.
6. Test at desktop and mobile viewports for overflow and visible primary actions.
7. Add browser suite to run after `npm run build:web`.

**Acceptance:** Browser tests pass against fresh export. Tests fail if a route regresses to spinner-only or an asset 404s.

### Task 19: Deploy and Verify Cloudflare Pages

**Files:**
- Modify: `.github/workflows/deploy-docs.yml` or create dedicated workflow
- Modify: `docs/ROADMAP.md`
- Modify: `docs/SUBMISSION_CHECKLIST.md`

**Actions:**

1. Rotate the previously exposed Supabase secret key before production deployment.
2. Confirm only public Supabase URL and anon/publishable key are in the client bundle.
3. Set `OPENAI_API_KEY` in Supabase Edge Function secrets.
4. Run `npm run build:web` and the complete browser suite.
5. Deploy `dist/` to Cloudflare Pages preview.
6. Run browser smoke tests against the preview URL.
7. Verify: landing, auth, onboarding, shell, diary food search, barcode lookup, meal planner, workout timer, progress charts, all routes serve 200.
8. Run Lighthouse on preview URL.
9. Promote only after no console errors, no asset 404s, Lighthouse targets met, and all acceptance checks pass.

**Acceptance:** Production Cloudflare Pages deployment passes all browser tests, Lighthouse targets, and manual verification.

---

## Execution Order

```
Phase 1 (Close gaps):     7A
Phase 2 (Polish):         8, 9, 10
Phase 3 (Real AI):        11, 12
Phase 4 (Compete):        13, 14, 15
Phase 5 (Ship):           16, 17, 18, 19
```

Phases 2 and 3 can be parallelized (different files, no dependencies). Phase 4 depends on Phase 3 for coaching integration. Phase 5 depends on all previous phases.

## Competitive Feature Matrix

| Feature | MyFitnessPal | YAZIO | Freeletics | Aurashape (After Plan) |
|---------|-------------|-------|------------|----------------------|
| Food database | 14M+ | Good | N/A | Open Food Facts + AI |
| Barcode scan | ✅ | ✅ | N/A | ✅ (native + web lookup) |
| AI food photo | Premium | ✅ | N/A | ✅ GPT-4o-mini |
| Calorie tracking | ✅ | ✅ | N/A | ✅ |
| Macro tracking | ✅ | ✅ | N/A | ✅ |
| Meal planning | Premium | ✅ | N/A | ✅ + grocery list |
| Recipe library | ✅ | ✅ | N/A | ✅ (20 curated + community) |
| Fasting timer | N/A | ✅ | N/A | ✅ (7 plans + calendar) |
| Workout tracking | ✅ | N/A | ✅ | ✅ (100 exercises) |
| Adaptive training | N/A | N/A | ✅ | ✅ (template adaptation) |
| Rest timer | N/A | N/A | ✅ | ✅ |
| Body measurements | ✅ | ✅ | N/A | ✅ (11 sites) |
| Progress photos | Premium | ✅ | N/A | ✅ |
| Weight trends | ✅ | ✅ | N/A | ✅ + predictions |
| AI coaching | N/A | Premium | ✅ | ✅ GPT-4o-mini |
| Science reading | N/A | N/A | N/A | ✅ (unique moat) |
| Community | ✅ | N/A | ✅ | ✅ (forum + challenges) |
| Cycle tracking | N/A | N/A | N/A | ✅ |
| Mindfulness | N/A | N/A | N/A | ✅ (7 types + breathing) |
| Achievements | ✅ | N/A | ✅ | ✅ (18 achievements) |
| Offline support | ✅ | ✅ | ✅ | ✅ (PWA) |
| Privacy-first | ❌ | ❌ | ❌ | ✅ (local-first) |
| Evidence-cited AI | ❌ | ❌ | ❌ | ✅ (unique moat) |

## Required Per-Task Handoff Format

For each task, the implementing model must:

1. Read the task section and all referenced files before editing.
2. Add or update focused tests before production changes when behavior is new.
3. Run focused tests first, then `npm run build:web`, then `npm run check`.
4. Run `git diff --check` and inspect `git status --short`.
5. Append a report under `.superpowers/sdd/2026-08-02-aurashape-web-foundation-and-ai-roadmap/` containing files changed, tests run, results, known concerns, and whether the task is acceptance-ready.
6. Ask for review only after evidence exists; do not claim completion from intent.

## Final Release Gate

The project is not release-ready until ALL of the following are true:

- [ ] `npm run check` passes (TypeScript + all tests).
- [ ] `npm run build:web` passes from a clean export.
- [ ] Playwright smoke tests pass at desktop (1440px) and mobile (390px).
- [ ] Public HTML contains visible content without hydration.
- [ ] Authenticated shell navigation works on every route, including `/articles`.
- [ ] Web food search, barcode lookup, and recent foods work end-to-end.
- [ ] Web onboarding flow completes and saves profile.
- [ ] AI food analysis returns real GPT-4o-mini estimates (not hardcoded).
- [ ] AI reading mode returns real evidence grades with citations.
- [ ] AI coaching generates data-driven recommendations.
- [ ] Meal planner with grocery list is functional.
- [ ] Workout rest timer and progression tracking work.
- [ ] Progress screen shows trends, predictions, and cross-domain insights.
- [ ] PWA is installable and offline food logging works.
- [ ] Lighthouse: ≥85 desktop, ≥70 mobile.
- [ ] Native route behavior remains intact.
- [ ] No client bundle contains secret credentials (Supabase service key, OpenAI key).
- [ ] AI responses include confidence, limitations, citations, and disclaimers.
- [ ] Low-confidence nutrition estimates require manual confirmation.
- [ ] Supabase secret rotation is complete.
- [ ] Cloudflare Pages preview has no console errors or asset 404s.
