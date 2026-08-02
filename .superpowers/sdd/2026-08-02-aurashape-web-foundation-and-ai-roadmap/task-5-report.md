# Task 5 Report: Public Landing Page

## Scope

Implemented the public web landing page for `/` while preserving the native route behavior. On web, the root route now renders the public Aurashape page; on native platforms it still redirects to `/auth/login`.

## Files Added

- `src/web/PublicLanding.tsx`
- `src/web/__tests__/publicLanding.test.tsx`
- `assets/images/hero-health.svg`
- `assets/images/feature-food.svg`
- `assets/images/feature-fasting.svg`
- `assets/images/feature-workout.svg`
- `assets/images/feature-community.svg`

## Files Modified

- `app/index.tsx`
- `scripts/build-web.ps1`

## Landing Page

- Added the required hero statement: `Your health, shaped by science.`
- Added primary `Start free` and `Sign in` actions using `WebButton` and Expo Router `useRouter().push()` destinations for `/auth/signup` and `/auth/login`.
- Added a responsive header with the existing `WebLogo` primitive.
- Added product preview cards for Food, Fasting, Workouts, and Community using `WebCard`, `WebSection`, `WEB_TOKENS`, and local SVG artwork.
- Added a privacy-first trust section covering consent, no ads, and user-controlled deletion.
- Added a final conversion section and footer links for Privacy Policy, Terms of Service, and `mailto:hello@aurashape.app`.
- Used the existing hosted legal URLs `https://aurashape.app/privacy` and `https://aurashape.app/terms`; no nonexistent in-app legal routes were introduced.
- Desktop uses a split hero and four-card feature row. Smaller layouts collapse the hero, feature cards, privacy content, and footer into safe single-column or wrapped layouts.
- Removed fixed-width mobile assumptions from the header and privacy checklist to avoid narrow-screen horizontal overflow.

## Local Artwork

All five illustrations are hand-authored SVGs with no remote image dependency. Expo static export emitted them as hashed files under `dist/assets/assets/images/`:

- `hero-health.*.svg`
- `feature-food.*.svg`
- `feature-fasting.*.svg`
- `feature-workout.*.svg`
- `feature-community.*.svg`

The existing `scripts/build-web.ps1` assertions now check the root landing copy and require each of these local SVG asset families after export.

## TDD Record

- Added the focused landing test before the implementation. The first run failed because the root route still rendered the native redirect.
- The passing test covers the required hero/product/trust content, both CTA labels, valid footer destinations, and both CTA route pushes.
- The test pins `Platform.OS` to `web` only inside the Jest case because the repository Jest preset reports a native platform by default; production routing still uses the real `Platform.OS` value.

## Verification

- `npm test -- --runInBand src/web/__tests__/publicLanding.test.tsx`: passed, 1 suite and 2 tests.
- `npm run build:web`: passed. Static export generated `/`, auth pages, and all five local SVG assets; build assertions passed.
- `npm run check`: passed, TypeScript plus 25 suites and 256 tests.

## Concerns

- Expo emits its existing web warning that push-token listeners are not fully supported on web; this is unrelated to the landing page and does not fail the export.
- The worktree contained unrelated pre-existing changes and generated loop/session files; none were reverted or modified.
- No commit was created.

## Task 5 Review Fixes

- Removed the incorrect `accessibilityRole="scrollbar"` from the landing page `ScrollView`.
- Converted desktop `What's inside` and `Privacy first` labels into accessible Expo Router links targeting `#features` and `#privacy`.
- Tightened the root static-export assertion to extract `<body>`, remove scripts and styles, and check landing copy within the resulting visible body content.
- Added focused coverage for both desktop anchor links, including their destinations and accessibility labels.
- Aligned the existing auth export assertions with the current visible headings: `Welcome back` and `Start your journey`.

## Review Fix Verification

- `npm run build:web`: passed. Root landing copy was checked in visible body content; auth pages and all five local SVG assets passed.
- `npm run check`: passed, TypeScript plus 25 suites and 257 tests.
