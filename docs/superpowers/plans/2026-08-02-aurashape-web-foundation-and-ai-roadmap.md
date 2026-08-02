# Aurashape Web Foundation and AI Roadmap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Expo app into a reliable, polished responsive web product first, then add the AI reading and adaptive coaching capabilities required to compete with Freeletics, YAZIO, and MyFitnessPal.

**Architecture:** Keep Expo Router, Supabase, Zustand, and the native screens. Fix the static-rendering/auth boundary at the root, add a web-specific presentation layer selected by platform, and use explicit design tokens/styles for web-critical UI instead of depending on a manually copied Tailwind artifact. Build AI as server-side Supabase Edge Functions with citations and structured outputs, never from the client with secret keys.

**Tech Stack:** Expo SDK 57, React Native Web 0.21, Expo Router, React 19.2.3, Zustand 5, Supabase Auth/Postgres/Edge Functions, TypeScript strict mode, React Native `StyleSheet`, Jest 29, Playwright.

## Global Constraints

- Expo SDK 57 targets React Native 0.86, React 19.2.3, and React Native Web 0.21.0.
- Do not expose Supabase service keys, Resend keys, model keys, or provider credentials in the client bundle.
- Preserve existing native routes and native behavior while adding web-specific presentation.
- Public web routes must render visible HTML during static export; they must never depend on a client effect to show the first screen.
- Keep local Zustand persistence as the web MVP source of truth; Supabase sync remains asynchronous and recoverable.
- Use local committed images/SVGs for core UI; no external image API is required for the first render.
- Every task ends with a focused test and the project-wide `npm run check` before handoff.
- Rotate the Supabase secret that was shared outside the project before production deployment.

---

## Workstream A: Web Runtime and Auth Foundation

### Task 1: Add Pure Route-Guard Decisions

**Files:**
- Create: `src/lib/authRouting.ts`
- Test: `src/lib/__tests__/authRouting.test.ts`

**Interfaces:**
- Produces `getAuthDestination(input: AuthRoutingInput): AuthDestination`.
- `AuthRoutingInput` is `{ pathname: string; initialized: boolean; userId: string | null; consentAccepted: boolean; onboardingCompleted: boolean; profileOnboarded: boolean | null }`.
- `AuthDestination` is `{ kind: 'public' | 'consent' | 'onboarding' | 'app'; href?: string }`.

- [ ] **Step 1: Write the failing tests.** Cover unauthenticated public paths, unauthenticated protected paths, authenticated users without consent, authenticated users without onboarding, and authenticated onboarded users.
- [ ] **Step 2: Run `npx jest src/lib/__tests__/authRouting.test.ts --runInBand` and verify the helper is missing.**
- [ ] **Step 3: Implement the pure decision function with no React or Supabase imports.** Public paths include `/`, `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/privacy`, and `/terms`.
- [ ] **Step 4: Run the focused test and then `npm run check`.**
- [ ] **Step 5: Commit the isolated routing helper.**

### Task 2: Remove the Static Spinner Deadlock

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `src/stores/auth.ts`
- Modify: `src/lib/supabase.ts`
- Modify: `src/lib/constants.ts`
- Test: `src/lib/__tests__/authRouting.test.ts`

**Interfaces:**
- `RootLayout` always renders a route stack during static rendering.
- Client-side effects initialize auth and call `router.replace()` only after initialization.
- `supabase` uses web URL-session detection while preserving native behavior.

- [ ] **Step 1: Add a route-path resolver to root layout using Expo Router `usePathname`/`useSegments` and the helper from Task 1.**
- [ ] **Step 2: Remove the branch that returns only `<ActivityIndicator>` for public routes.** Public route HTML must render immediately; only authenticated data may show a local loading state.
- [ ] **Step 3: Add a bounded auth initialization path.** Catch `getSession()` failures, set `initialized: true`, retain a visible auth error, and never leave `initialized` false.
- [ ] **Step 4: Move profile lookup out of the public-route blocking path.** Missing schema or a failed profile query must show onboarding or a retry state after authentication, not suppress login HTML.
- [ ] **Step 5: Set `detectSessionInUrl: Platform.OS === 'web'` and centralize `aurashape://`/web redirect URLs.**
- [ ] **Step 6: Run `npx expo export --platform web` and assert generated `dist/auth/login.html` contains `Aurashape`, `Email`, and `Password`, not only `role="progressbar"`.**
- [ ] **Step 7: Run `npm run check`.**

### Task 3: Make Web Styling Deterministic

**Files:**
- Modify: `metro.config.js`
- Modify: `global.css`
- Modify: `app/+html.tsx`
- Modify: `package.json`
- Create: `scripts/build-web.ps1`

**Interfaces:**
- `npm run build:web` produces a complete `dist/` directory without manual post-build edits.

- [ ] **Step 1: Pin the supported styling pair to NativeWind 4.2.6 and Tailwind CSS 3.4.17, keep `withNativeWind(config, { input: './global.css' })`, and remove the manually linked `/tailwind.css` contract from `app/+html.tsx`.**
- [ ] **Step 2: Keep `global.css` on the Tailwind v3 directives and `tailwind.config.js` on the NativeWind preset/content configuration; the Expo/NativeWind-generated React Native Web stylesheet is the only runtime style artifact.**
- [ ] **Step 3: Add `build:web` to run only the Expo web export and fail if the generated static route HTML contains only the loading spinner.**
- [ ] **Step 4: Add PowerShell assertions that `/auth/login` and `/auth/signup` contain visible form controls and that `/` generates a valid HTML route shell; Task 5 owns the root landing-content assertion.**
- [ ] **Step 5: Run `npm run build:web` and `npm run check`.**

## Workstream B: Public Web Experience

### Task 4: Build the Design Token and Web Component Layer

**Files:**
- Create: `src/web/tokens.ts`
- Create: `src/web/WebButton.tsx`
- Create: `src/web/WebCard.tsx`
- Create: `src/web/WebField.tsx`
- Create: `src/web/WebLogo.tsx`
- Create: `src/web/WebSection.tsx`
- Test: `src/web/__tests__/webTokens.test.ts`

**Interfaces:**
- `WEB_TOKENS` exposes colors, spacing, radii, typography, shadows, and content widths.
- `WebButton` accepts `{ label, onPress, variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean }`.
- `WebField` accepts `{ label, error?, ...TextInputProps }`.
- Components render with React Native styles on web and stay platform-safe.

- [ ] **Step 1: Write token tests for primary, surface, text, border, spacing, and desktop content width values.**
- [ ] **Step 2: Implement tokens and primitive components with accessible labels and pressed/disabled states.**
- [ ] **Step 3: Add keyboard focus-visible styles through web-only style props or a small global CSS rule.**
- [ ] **Step 4: Run focused tests and `npm run check`.**

### Task 5: Build the Public Landing Page

**Files:**
- Modify: `app/index.tsx`
- Create: `src/web/PublicLanding.tsx`
- Create: `assets/images/hero-health.svg`
- Create: `assets/images/feature-food.svg`
- Create: `assets/images/feature-fasting.svg`
- Create: `assets/images/feature-workout.svg`
- Create: `assets/images/feature-community.svg`

**Interfaces:**
- `/` renders a public landing page on web and preserves native redirect behavior.
- CTAs navigate to `/auth/signup` and `/auth/login`.

- [ ] **Step 1: Add a route-level test for web landing content and CTA destinations.**
- [ ] **Step 2: Implement a responsive hero with local artwork, brand statement, product proof cards, privacy trust block, and legal footer.**
- [ ] **Step 3: Make mobile layout single-column and desktop layout split hero/preview with a max-width container.**
- [ ] **Step 4: Verify all local assets resolve in `dist/assets`.**
- [ ] **Step 5: Run `npm run build:web` and `npm run check`.**

### Task 6: Rebuild Web Authentication Pages

**Files:**
- Modify: `app/auth/login.tsx`
- Modify: `app/auth/signup.tsx`
- Modify: `app/auth/forgot-password.tsx`
- Create: `src/web/AuthFrame.tsx`
- Create: `src/web/AuthAside.tsx`
- Create: `assets/images/auth-health.svg`

**Interfaces:**
- Native routes retain current forms.
- Web routes render `AuthFrame` with consistent branding, fields, errors, loading states, OAuth buttons, and legal links.

- [ ] **Step 1: Add tests for required-field errors, password confirmation, disabled submit state, and route links.**
- [ ] **Step 2: Implement the responsive auth frame with desktop visual aside and mobile single-column fallback.**
- [ ] **Step 3: Add explicit `placeholderTextColor`, accessible labels, autocomplete semantics, and visible focus states.**
- [ ] **Step 4: Add a visible Supabase error/retry state rather than silently failing.**
- [ ] **Step 5: Run static export and verify each auth HTML file contains visible form labels.**

## Workstream C: Authenticated Web Product Shell

### Task 7: Build the Responsive Shell

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Create: `src/web/WebAppShell.tsx`
- Create: `src/web/WebSidebar.tsx`
- Create: `src/web/WebTopBar.tsx`
- Create: `src/web/WebMobileNav.tsx`
- Create: `src/web/navItems.ts`

**Interfaces:**
- Web shell consumes the existing route names and exposes navigation for Home, Diary, Fasting, Workout, Progress, Cycle, Mindful, Community, Learn, and Profile.
- Native tab layout remains unchanged except for shared labels/configuration.

- [ ] **Step 1: Add a route map test ensuring every visible destination maps to an existing route.**
- [ ] **Step 2: Implement desktop sidebar, top bar, and mobile navigation using `Slot`/Expo Router navigation.**
- [ ] **Step 3: Add active route styling, collapse behavior below the desktop breakpoint, and keyboard-usable navigation.**
- [ ] **Step 4: Wrap the existing tab content in a max-width responsive content region.**
- [ ] **Step 5: Verify navigation by static export and focused tests.**

### Task 8: Upgrade the Web Dashboard Vertical Slice

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Create: `src/web/HomeDashboard.tsx`
- Create: `src/web/MetricCard.tsx`
- Create: `src/web/ScienceTipCard.tsx`
- Create: `src/web/QuickActionGrid.tsx`

**Interfaces:**
- Web dashboard consumes existing diary, water, achievement, and tip stores.
- Native home remains available through the existing component path.

- [ ] **Step 1: Add tests for empty day, logged day, streak, water progress, and science tip rendering.**
- [ ] **Step 2: Implement dashboard layout: greeting, calorie/macro summary, hydration, streak, quick actions, science card, and recent activity.**
- [ ] **Step 3: Use local visual cards and responsive grid behavior; avoid forcing mobile-width cards on desktop.**
- [ ] **Step 4: Add “Log food”, “Start fast”, “Start workout”, and “Read science” CTAs.**
- [ ] **Step 5: Run `npm run check` and web export.**

### Task 9: Upgrade Diary, Fasting, Workout, Progress, Community, Learn, and Profile Web Layouts

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

- [ ] **Step 1: Add web layout tests for each route's heading, primary action, empty state, and responsive content container.**
- [ ] **Step 2: Convert each web screen to a desktop grid/table/card layout while preserving existing store actions.**
- [ ] **Step 3: Add loading, empty, error, and retry states for any Supabase-backed data.**
- [ ] **Step 4: Add local image/illustration use to progress photos, recipes, science guides, and community empty states.**
- [ ] **Step 5: Verify all eight routes at desktop and mobile widths.**

## Workstream D: AI Nutrition and Reading Moat

### Task 10: Define AI Safety and Structured Output Contracts

**Files:**
- Create: `supabase/functions/ai-coach/index.ts`
- Create: `src/lib/aiTypes.ts`
- Create: `src/lib/aiSafety.ts`
- Test: `src/lib/__tests__/aiSafety.test.ts`

**Interfaces:**
- `FoodAnalysisResult`: `{ items, estimatedCalories, macros, confidence, assumptions, warnings }`.
- `ReadingSummary`: `{ title, summary, claims, evidenceGrade, citations, practicalActions, disclaimer }`.
- Every AI response includes uncertainty and citations where applicable.

- [ ] **Step 1: Write tests rejecting medical diagnosis, medication changes, eating-disorder advice, and unsupported certainty.**
- [ ] **Step 2: Implement schema validation and safety filtering before client delivery.**
- [ ] **Step 3: Implement the Edge Function boundary with server-side provider credentials and authenticated user checks.**
- [ ] **Step 4: Return deterministic mock responses in tests; never call a live model from Jest.**

### Task 11: Build AI Reading Mode

**Files:**
- Create: `src/web/ReadingMode.tsx`
- Create: `src/stores/reading.ts`
- Create: `src/lib/readingSources.ts`
- Modify: `app/articles.tsx`
- Create: `supabase/functions/ai-coach/read.ts`

- [ ] **Step 1: Add tests for highlighting a claim, displaying evidence grade, citations, saved reading, and offline fallback.**
- [ ] **Step 2: Add “Explain this” and “Read deeper” actions to articles/guides.**
- [ ] **Step 3: Show concise summary, evidence grade, cited sources, limitations, and practical actions.**
- [ ] **Step 4: Persist saved reading and recent explanations locally.**
- [ ] **Step 5: Add rate limits and a friendly unavailable state when AI is not configured.**

### Task 12: Build AI Food Capture and Adaptive Coaching

**Files:**
- Create: `supabase/functions/ai-coach/food.ts`
- Create: `src/web/FoodCapture.tsx`
- Create: `src/stores/coach.ts`
- Modify: `app/(tabs)/diary.tsx`
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Add tests for photo/text input normalization, confidence thresholds, manual correction, and diary insertion.**
- [ ] **Step 2: Implement upload/capture UI with preview, retry, manual edit, and explicit “Add to diary” confirmation.**
- [ ] **Step 3: Never auto-log low-confidence nutrition estimates.**
- [ ] **Step 4: Generate weekly coaching recommendations from existing local metrics and explain the reason for each recommendation.**
- [ ] **Step 5: Add user controls to disable AI, delete AI history, and opt out of model processing.**

## Workstream E: Competitive Retention Layer

### Task 13: Adaptive Plans and Habit Loops

**Files:**
- Create: `src/stores/plan.ts`
- Create: `src/web/WeeklyPlan.tsx`
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/workout.tsx`
- Modify: `app/(tabs)/fasting.tsx`

- [ ] **Step 1: Add tests for plan generation from user goal/activity, missed-day recovery, and plan completion.**
- [ ] **Step 2: Build a weekly plan combining meals, workouts, fasting, hydration, and recovery.**
- [ ] **Step 3: Add a “today’s next best action” card to Home.**
- [ ] **Step 4: Add gentle recovery logic rather than punishment after missed days.**

## Workstream F: Browser QA and Release

### Task 14: Add Browser Smoke Tests

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `e2e/web.spec.ts`
- Create: `scripts/assert-web-export.ps1`

- [ ] **Step 1: Add Playwright and configure Chromium against the local static server.**
- [ ] **Step 2: Test landing, login, signup, forgot-password, and protected-route behavior.**
- [ ] **Step 3: Test desktop 1440px and mobile 390px layouts for overflow, visible primary actions, and no console errors.**
- [ ] **Step 4: Assert CSS, JavaScript, SVG, PNG, and route requests return successful responses.**
- [ ] **Step 5: Add the browser suite to CI after the web export step.**

### Task 15: Deploy and Verify Cloudflare Pages

**Files:**
- Modify: `.github/workflows/deploy-docs.yml` or create a dedicated web deploy workflow
- Modify: `docs/ROADMAP.md`
- Modify: `docs/SUBMISSION_CHECKLIST.md`

- [ ] **Step 1: Build with `npm run build:web`.**
- [ ] **Step 2: Deploy the generated `dist/` directory to a preview Pages deployment.**
- [ ] **Step 3: Run browser smoke tests against the preview URL.**
- [ ] **Step 4: Check route HTML and asset requests manually.**
- [ ] **Step 5: Promote only after the preview has no console errors and all acceptance criteria pass.**

## Execution Order

Implement Workstreams A-C first. They produce a usable web app and solve the current deployment failure. Implement Workstreams D-E only after the web foundation is stable, because AI features are valuable only when users can reliably reach and use the product. Workstream F is required before calling the web app release-ready.

## Competitive Positioning

- **Against MyFitnessPal:** privacy-first, science-cited explanations, simpler logging, no ad-heavy core experience.
- **Against YAZIO:** fasting plus full training/progress/community loop, with AI reading that explains evidence instead of only counting calories.
- **Against Freeletics:** nutrition, fasting, body progress, and adaptive coaching in one product rather than workout-only personalization.
- **Core moat:** a trustworthy health knowledge layer connected to the user’s actual behavior, with citations, uncertainty, and transparent recommendations.
