# Phase 2-3 Profile, Theme, and Web Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the authenticated web product profile-aware, theme-consistent, and responsive across the Cycle, Mindful, and highest-impact existing screens.

**Architecture:** Introduce pure profile eligibility selectors and feed filtered navigation from them. Add dynamic web theme colors to shared primitives, then create dedicated WebCycle and WebMeditation screens backed by existing stores. Migrate Weekly Plan, Profile, Recipes, Fasting, and Progress incrementally without changing native business logic.

**Tech Stack:** Expo SDK 57, Expo Router, React Native Web, Zustand 5, React Native StyleSheet, Jest 29, Playwright.

## Global Constraints

- Preserve native behavior except conditional Cycle visibility and direct-route protection.
- Use `useThemeColors()` and semantic web theme tokens for surfaces, text, borders, and controls.
- Do not add dependencies or backend schema migrations unless existing profile loading requires the already-present `sex` field.
- Read Expo SDK `57.0.0` docs before Expo code changes.
- Use TDD: every behavior change gets a failing focused test first.
- Run `npm run check`, `npm run build:web`, and browser tests before deployment.
- Do not revert unrelated dirty-worktree changes or create commits without explicit request.

---

### Task 1: Canonical Profile Eligibility and Dynamic Navigation

**Files:**
- Create: `src/lib/profileEligibility.ts`
- Modify: `src/stores/onboarding.ts`
- Modify: `src/web/navItems.ts`
- Modify: `src/web/WebSidebar.tsx`
- Modify: `src/web/WebMobileNav.tsx`
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `app/(tabs)/cycle.tsx`
- Test: `src/lib/__tests__/profileEligibility.test.ts`
- Modify: `src/web/__tests__/webNavigation.test.tsx`

**Interfaces:**
- `getFeatureAvailability(profile: { sex: 'male' | 'female' | null }): { cycle: boolean }`.
- `getVisibleNavItems(profile)` returns the existing `WebNavItem[]` filtered for the current profile.
- Direct ineligible Cycle access redirects to `/progress`.

- [ ] Write failing tests for male, female, and unknown Cycle availability; filtered web navigation; and direct route guard behavior.
- [ ] Run the focused tests and confirm they fail because navigation is currently static.
- [ ] Implement pure eligibility and navigation filtering without duplicating profile state.
- [ ] Apply filtered items to desktop sidebar, mobile More, and native tab options.
- [ ] Add the Cycle route guard before rendering cycle content and redirect male users to Progress.
- [ ] Run focused eligibility and navigation tests.

### Task 2: Dynamic Web Theme System

**Files:**
- Modify: `src/web/tokens.ts`
- Modify: `src/web/WebAppShell.tsx`
- Modify: `src/web/WebSidebar.tsx`
- Modify: `src/web/WebTopBar.tsx`
- Modify: `src/web/WebMobileNav.tsx`
- Modify: `src/web/WebCard.tsx`
- Modify: `src/web/WebButton.tsx`
- Modify: `src/web/WebField.tsx`
- Test: `src/web/__tests__/webTokens.test.ts`

**Interfaces:**
- `getWebTokens(isDark: boolean)` returns light/dark palettes with identical semantic keys.
- Shared web primitives consume the current theme at render time.

- [ ] Write failing tests proving light and dark palettes differ for page, surface, text, border, and primary colors while retaining the same keys.
- [ ] Run the focused token tests and confirm the dynamic palette API is missing.
- [ ] Add dark semantic web colors and `getWebTokens` without changing spacing or typography contracts.
- [ ] Replace static primitive styles with theme-aware runtime styles driven by `useThemeStore`.
- [ ] Verify shell, navigation, cards, buttons, fields, and top bar update after `setMode('dark')`.
- [ ] Run web primitive/theme tests and `npm run typecheck`.

### Task 3: Dedicated WebCycle Screen

**Files:**
- Create: `src/web/screens/WebCycle.tsx`
- Modify: `app/(tabs)/cycle.tsx`
- Test: `src/web/screens/__tests__/WebCycle.test.tsx`

**Interfaces:**
- `WebCycle` consumes `useCycleStore` actions and renders overview/history/settings states.
- Native Cycle remains the existing implementation for non-web platforms.

- [ ] Write failing component tests for heading, prediction/empty state, add-entry action, history, and settings tabs.
- [ ] Run the focused tests and confirm the component is missing.
- [ ] Implement responsive WebCycle using WebCard, WebButton, WebField, dynamic tokens, and existing store actions.
- [ ] Add explicit empty state and accessible controls for symptom, flow, notes, and dates.
- [ ] Add the web branch in `app/(tabs)/cycle.tsx` while preserving the native branch.
- [ ] Run WebCycle tests and export the route.

### Task 4: Dedicated WebMeditation Screen

**Files:**
- Create: `src/web/screens/WebMeditation.tsx`
- Modify: `app/(tabs)/meditation.tsx`
- Test: `src/web/screens/__tests__/WebMeditation.test.tsx`

**Interfaces:**
- `WebMeditation` consumes `useMeditationStore` and preserves timer cleanup, session completion, breathing patterns, streak, and weekly totals.
- Native Meditation remains unchanged for non-web platforms.

- [ ] Write failing tests for session selection, duration selection, empty history, start control, and stats rendering.
- [ ] Run focused tests and confirm the component is missing.
- [ ] Implement the responsive session workspace with accessible timer controls and cleanup on unmount.
- [ ] Add the web branch in `app/(tabs)/meditation.tsx`.
- [ ] Run WebMeditation tests and verify mobile/desktop layout constraints.

### Task 5: Layout Migration for Existing Web Screens

**Files:**
- Modify: `src/web/WeeklyPlan.tsx`
- Modify: `src/web/screens/WebProfile.tsx`
- Modify: `app/recipes.tsx`
- Modify: `src/web/screens/WebFasting.tsx`
- Modify: `src/web/screens/WebProgress.tsx`
- Test: `src/web/__tests__/layoutMigration.test.tsx`

- [ ] Write failing structural tests for Weekly Plan desktop card widths, Profile non-placeholder metrics/legal links, and mobile tab wrapping.
- [ ] Replace Weekly Plan’s desktop `width: '100%'` cards with a deliberate two-column grid and keep one-column mobile stacking.
- [ ] Remove fake Profile metrics or wire them to real stores; implement Privacy Policy and Terms links.
- [ ] Replace fixed light surfaces in Fasting, Recipes, Profile, and Progress with dynamic theme colors.
- [ ] Make Progress controls wrap or scroll safely at 390px and preserve readable desktop composition.
- [ ] Run focused layout tests and browser overflow checks.

### Task 6: Phase 2-3 QA and Deployment Gate

**Files:**
- Modify: `e2e/web.spec.ts`
- Modify: `scripts/assert-web-export.js`
- Modify: `docs/ROADMAP-PHASE-0-1.md`

- [ ] Add browser tests for Cycle visibility states, Cycle direct redirect, dark-mode toggle persistence, WebCycle, WebMeditation, and redesigned route headings.
- [ ] Require exported Cycle, Meditation, Plan, Profile, Summary, and Articles pages to contain visible headings and shell navigation markers.
- [ ] Run `npm run check`.
- [ ] Run `npm run build:web` and `npm run test:e2e` locally.
- [ ] Deploy the verified export to Cloudflare Pages.
- [ ] Run `WEB_BASE_URL=<deployment-url> npm run test:e2e` against the live deployment.
- [ ] Record completed Phase 2-3 items, remaining issues, and deployment URL in the roadmap.
