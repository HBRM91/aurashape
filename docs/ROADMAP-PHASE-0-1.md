# Aurashape Phase 0-1 Recovery Roadmap

## Goal

Move the web app from functional preview to a consistent release candidate by fixing the critical user journeys before broad visual polish.

## Timeline

### Phase 0: Stabilization Contract, 1-2 days

- Define one persisted onboarding/profile source for sex, goal, completion, and targets.
- Persist theme mode and support system appearance changes.
- Define shared nutrition target defaults.
- Add route-level acceptance criteria and baseline browser checks.

### Phase 1: Critical Journeys, 3-5 days

- Redesign privacy consent for web and native theme parity.
- Make consent links independent from card toggles.
- Persist local onboarding completion across reloads.
- Handle email-confirmation signup state.
- Validate web onboarding with the same rules as native onboarding.
- Make food search relevant, normalized, and race-safe.
- Make Summary date-aware and consistent with Diary.
- Integrate Summary into the authenticated web shell.
- Add focused unit, component, and browser regression coverage.

## Release Gates

1. A new local user can consent, complete onboarding, reload, and remain onboarded.
2. Search for a known food never displays unrelated products as valid results.
3. Summary opened from a selected diary date reports that date and matching targets.
4. Light, dark, and system themes persist and apply to onboarding, auth, shell, Summary, Diary, and Profile.
5. No P0 route has a dead button, placeholder metric, or silent empty state.
6. `npm run check`, `npm run build:web`, and the full Playwright suite pass locally and against the deployed preview.

## Follow-Up After Phase 1

- Phase 2: profile-based feature availability, Cycle eligibility and route guard, web Cycle, web Mindful, and complete theme migration.
- Phase 3: Weekly Plan, Profile, Recipes, Fasting, and Progress responsive redesign.
- Phase 4: authenticated browser matrix, accessibility, performance, error states, and production release review.

## Phase 0-1 Delivery Status

Completed in the current delivery:

- Persisted onboarding completion and profile fields for local mode.
- Persisted theme selection and system appearance initialization.
- Centralized nutrition target fallbacks.
- Redesigned consent interactions with independent legal links and themed surfaces.
- Added email-confirmation state for cloud signup.
- Added shared web onboarding validation.
- Rejected unrelated food search results and normalized serving nutrition.
- Added stale-result protection to native and web food search.
- Added date-aware Summary routing and a responsive web Summary screen.
- Added export assertions and 24 local/live browser tests.

Still open for Phase 2:

- Full dynamic dark-mode palette migration across every web screen and primitive.
- Canonical profile/feature availability store for gender-aware navigation.
- Hide and guard Cycle for male users.
- Dedicated responsive web Cycle and Mindful screens.
- Weekly Plan, Profile, Recipes, Fasting, and Progress visual cleanup.

Latest verified deployment: `https://f6124fe2.aurashape.pages.dev`

## Phase 2-3 Delivery Status

Completed in the current Phase 2-3 slice:

- Added pure profile eligibility rules for Cycle.
- Filtered Cycle from web navigation for male profiles.
- Added direct Cycle route protection and redirect behavior.
- Added dynamic light/dark semantic web palettes.
- Updated web shell and shared card/button/field primitives to consume the active palette.
- Added responsive WebCycle with overview, history, settings, and entry form.
- Added responsive WebMeditation with session selection, timer, completion, history, and stats.
- Fixed Weekly Plan desktop cards from forced full-width layout.
- Replaced Profile placeholder metrics and dead legal buttons.
- Expanded static export coverage for Cycle, Mindful, Plan, Profile, and Summary.

Remaining Phase 3 migration work:

- Migrate all fixed colors in Profile, Recipes, Fasting, Progress, Home, and Learn to dynamic tokens.
- Add authenticated browser tests for male Cycle navigation and dark-mode persistence.
- Complete responsive visual polish and accessibility pass across all routes.

Latest Phase 2-3 deployment: `https://3e11b0cd.aurashape.pages.dev`

## Estimates

- One developer: 4-5 weeks for Phases 0-4.
- Two developers: 2.5-3 weeks for Phases 0-4 with shared review and QA.
- Phase 0-1 specifically: 4-7 working days for one developer.
