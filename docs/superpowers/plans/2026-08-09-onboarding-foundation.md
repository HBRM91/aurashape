# Onboarding Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild consent and onboarding so users can safely enter dates, units, diet/allergy choices, optional fasting, and weight goals with a dynamic projection.

**Architecture:** Keep canonical measurements in the existing Zustand onboarding store and isolate all conversion, validation, fasting descriptions, and projection math in pure `src/lib` modules. Share these modules between the current web wizard and native wizard, while using platform-appropriate date controls and preserving local-first behavior.

**Tech Stack:** Expo SDK 57, Expo Router, React Native Web, NativeWind, Zustand 5, Jest 29, Playwright.

## Global Constraints

- Preserve all existing unrelated worktree changes.
- Keep local privacy mode as the default.
- Store height in centimeters and weight in kilograms regardless of display unit.
- Allergies are hard exclusions; fasting is optional.
- Use safe, non-medical copy and do not silently invoke AI or write health data.
- Keep the existing Expo SDK 57 dependency baseline.
- Run `npm run check` before completion.

---

### Task 1: Add onboarding domain helpers

**Files:**
- Create: `src/lib/unitConversion.ts`
- Create: `src/lib/goalProjection.ts`
- Create: `src/lib/dietaryProfile.ts`
- Create: `src/lib/fastingPlans.ts`
- Create: `src/lib/__tests__/unitConversion.test.ts`
- Create: `src/lib/__tests__/goalProjection.test.ts`
- Create: `src/lib/__tests__/dietaryProfile.test.ts`
- Create: `src/lib/__tests__/fastingPlans.test.ts`

**Interfaces:**
- `kgToLb(value: number): number`, `lbToKg(value: number): number`, `cmToIn(value: number): number`, `inToCm(value: number): number`.
- `buildWeightProjection(input: { currentKg: number; targetKg: number; weeklyChangeKg: number; startDate: string }): Array<{ date: string; weightKg: number; projected: true }>`.
- `DIETARY_OPTIONS`, `ALLERGY_OPTIONS`, `normalizeDietaryProfile(...)`.
- `FASTING_PLANS` containing `none`, `12:12`, `14:10`, `16:8`, `18:6`, `20:4`, and `5:2`, each with tradeoffs and safety copy.

- [ ] **Step 1: Write failing tests for reversible unit conversion and rounded display values.**
- [ ] **Step 2: Implement conversion helpers with finite-number guards.**
- [ ] **Step 3: Write failing projection tests for loss, gain, maintenance, date rollover, and invalid rates.**
- [ ] **Step 4: Implement a bounded weekly projection that never loops indefinitely and returns the target endpoint.**
- [ ] **Step 5: Write failing dietary, allergy, fasting-option, and contraindication-copy tests.**
- [ ] **Step 6: Implement immutable option catalogs and normalization helpers.**
- [ ] **Step 7: Run the four focused Jest suites and confirm all pass.**

### Task 2: Expand the persisted onboarding state

**Files:**
- Modify: `src/stores/onboarding.ts`
- Modify: `src/types/index.ts`
- Modify: `src/lib/onboardingValidation.ts`
- Test: `src/stores/__tests__/onboarding.test.ts`
- Test: `src/lib/__tests__/onboardingValidation.test.ts`

**Interfaces:**
- Add `unitSystem: 'metric' | 'imperial'`.
- Add `dietaryPreferences: DietaryPreference[]`, `allergies: string[]`, `excludedIngredients: string[]`.
- Add `fastingPlan: FastingPlan | 'none'`, `fastingEnabled: boolean`.
- Add `targetWeightKg: number | null`, `weeklyChangeKg: number | null`.
- Preserve existing `dietaryPreference` and `fastingPlan` reads through normalization during migration.

- [ ] **Step 1: Add failing store tests for defaults, persisted field updates, fasting opt-out, and legacy-state normalization.**
- [ ] **Step 2: Add the new types and defaults without changing existing public store method names.**
- [ ] **Step 3: Extend `partialize` and add a one-time normalization on store hydration.**
- [ ] **Step 4: Extend validation for real dates, age bounds, unit-aware values, target direction, and weekly-rate limits.**
- [ ] **Step 5: Run onboarding store and validation tests.**

### Task 3: Rebuild privacy consent

**Files:**
- Modify: `app/onboarding/privacy-consent.tsx`
- Modify: `src/stores/privacy.ts`
- Modify: `src/lib/constants.ts`
- Create: `src/lib/__tests__/consent.test.ts`
- Create: `src/web/__tests__/privacyConsent.test.tsx`

**Interfaces:**
- Consent state records policy version, accepted timestamp, required policy/TOS flags, and independent optional flags.
- Legal URLs derive from `WEB_AUTH_REDIRECT_URL` origin instead of a stale hardcoded hostname.

- [ ] **Step 1: Write failing tests for required/optional consent independence, policy version persistence, and legal URL construction.**
- [ ] **Step 2: Implement the consent store fields with local persistence and cloud payload compatibility.**
- [ ] **Step 3: Replace the native-only layout with responsive themed cards, accessible checkbox labels, visible focus, policy version, and error copy.**
- [ ] **Step 4: Verify optional newsletter, analytics, and AI choices do not block continuation.**
- [ ] **Step 5: Run focused consent tests and static export assertions.**

### Task 4: Rebuild the web onboarding wizard

**Files:**
- Modify: `src/web/WebOnboarding.tsx`
- Modify: `src/web/__tests__/onboarding.test.tsx`
- Modify: `e2e/web.spec.ts`

**Interfaces:**
- Step order: goal, body/date/units, activity/diet/allergies, optional fasting, goal timeline, plan summary.
- Web date input uses `type="date"` semantics through React Native Web-compatible props.
- Unit toggle converts displayed height/weight while preserving canonical metric store values.

- [ ] **Step 1: Write failing component tests for date input, unit toggle, multiple diet/allergy selection, fasting opt-out, and target timeline fields.**
- [ ] **Step 2: Implement the new steps with existing `WebButton`, `WebCard`, tokens, and accessible labels.**
- [ ] **Step 3: Add inline validation and preserve state while navigating backward.**
- [ ] **Step 4: Add summary cards for calorie targets, projected date, weekly change, fasting status, and dietary exclusions.**
- [ ] **Step 5: Run focused component tests and local Playwright tests at 390px and 1440px.**

### Task 5: Add dynamic goal projection to progress

**Files:**
- Modify: `src/web/screens/WebProgress.tsx`
- Create: `src/web/WeightProjectionChart.tsx`
- Create: `src/web/__tests__/weightProjectionChart.test.tsx`
- Modify: `src/web/__tests__/webNavigation.test.tsx` only if route behavior changes

**Interfaces:**
- Chart accepts `projection`, `actualEntries`, `targetKg`, and `unitSystem`.
- Renders a lightweight SVG/canvas-free responsive chart with separate actual and projected lines, target marker, and accessible text summary.

- [ ] **Step 1: Write failing chart tests for empty, actual-only, projection-only, and mixed data.**
- [ ] **Step 2: Implement the responsive chart with bounded points and accessible summary text.**
- [ ] **Step 3: Add the target date, weekly rate, and projection card to the weight tab.**
- [ ] **Step 4: Run component tests and responsive browser checks.**

### Task 6: Release verification and deploy

**Files:**
- Modify: `docs/PRODUCT-BACKLOG.md` status rows
- Modify: `docs/PRODUCTION_READINESS.md`
- Modify: `e2e/web.spec.ts`

- [ ] **Step 1: Run `npm run check`.**
- [ ] **Step 2: Run `npm run build:web`.**
- [ ] **Step 3: Run `npm run assert:web`, `npm run assert:local-privacy`, and `npm run assert:secrets`.**
- [ ] **Step 4: Run local and deployed Playwright suites.**
- [ ] **Step 5: Deploy `dist` to the `aurashape` Cloudflare Pages project.**
- [ ] **Step 6: Smoke-test consent, onboarding, progress, legal routes, and security headers on the deployment URL.**
