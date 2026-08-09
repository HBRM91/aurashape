# Aurashape Product Backlog

Updated 2026-08-09. This backlog is the compact execution source for the next product release.

## Product Rules

- Privacy, consent, and data minimization come before personalization.
- Metric and imperial units must be equivalent, reversible, and clearly labeled.
- Allergies are hard exclusions in recipes and plans, not preferences.
- Fasting is optional and must include suitability warnings and tradeoffs.
- Projections are estimates, never promises or medical advice.
- AI is opt-in, transparent, and cannot diagnose, prescribe, or silently write health data.
- Media and content must be original, openly licensed, or legally embeddable with attribution.
- No copying of MyFitnessPal, YAZIO, Calm, Moonly, Navamsha, or other commercial content.

## P0: Trust And Onboarding

| ID | Item | Acceptance criteria | Dependencies |
|---|---|---|---|
| P0-01 | Privacy consent rebuild | Responsive web/native layout; required privacy and terms separated from optional newsletter, analytics, and AI; current legal URLs; policy version/date; accessible controls and error states | Shipped |
| P0-02 | Date and unit onboarding | Native date picker; web calendar input; intuitive formatting; impossible dates rejected; metric/imperial toggle with reversible conversion and labels | Shipped |
| P0-03 | Rich nutrition profile | Multiple diet selections; exclusions; controlled allergy taxonomy; persisted profile; hard recipe filtering | Shipped foundation; recipe filtering next |
| P0-04 | Optional fasting | Explicit opt-in/opt-out; 12:12 through 20:4 and 5:2 explanations; benefits, tradeoffs, warnings, hydration, disclaimer | Shipped |
| P0-05 | Goal timeline | Target weight; desired weekly change; safe range guidance; estimated target date; dynamic actual-vs-projection chart | Shipped |
| P0-06 | Coaching consent | AI guidance opt-in; local fallback; clear uncertainty and health disclaimer; no silent data writes | P0-03, P0-05 |

## P1: Nutrition

| ID | Item | Acceptance criteria | Dependencies |
|---|---|---|---|
| P1-01 | Recipe engine | 120 validated recipes with structured ingredients, macros, allergens, cuisines, time, cost, and dietary tags; expandable to 500+ | P0-03 |
| P1-02 | Weekly planner | 7-day meal plan filtered by allergies/diet/targets; substitutions preserve exclusions | P1-01 |
| P1-03 | Grocery list | Consolidates ingredient quantities by week; grouping, check-off, export/share | P1-02 |
| P1-04 | Food search | Better ranking, barcode, serving normalization, locale/country filtering, caching, retry states, verified/unverified labeling | P0-03 |
| P1-05 | Provider evaluation | Document Open Food Facts coverage and decide whether a licensed provider is needed; no unsupported worldwide coverage claims | P1-04 |

## P1: Training

| ID | Item | Acceptance criteria | Dependencies |
|---|---|---|---|
| P1-06 | Workout database | Structured exercise metadata, alternatives, equipment, levels, contraindications, sets/reps/tempo/rest; 10-60 minute programs | None |
| P1-07 | Workout media | Openly licensed images or legal embeds, attribution, source URLs, fallback diagrams | P1-06 |
| P1-08 | Program generator | Home/gym, beginner/intermediate/advanced, strength/cardio/mobility/recovery plans with progressive overload | P1-06 |

## P1: Mindful And Learn

| ID | Item | Acceptance criteria | Dependencies |
|---|---|---|---|
| P1-09 | Mindful library | Guided breathing, body scan, sleep, focus, recovery, and affirmations with duration, script, evidence note, and source | None |
| P1-10 | Learn library | 50+ cited articles across nutrition, recovery, exercise, sleep, stress, mindfulness, fasting, and behavior; review dates and safety notes | None |
| P1-11 | Content discovery | Search, filters, saved articles, daily rotation, empty/error states | P1-09, P1-10 |

## P2: Quality And Scale

| ID | Item | Acceptance criteria | Dependencies |
|---|---|---|---|
| P2-01 | Personalization | Profile drives recipes, workouts, fasting suggestions, progress coaching, and local fallback | P0, P1 |
| P2-02 | Performance | Bounded/virtualized lists, cached content/images, responsive charts, offline/retry states | P1 |
| P2-03 | Release QA | Accessibility, responsive Playwright, content validation, allergy exclusion tests, projection tests, production smoke tests | P0, P1, P2-01 |

## Execution Order

1. P0-01 privacy consent.
2. P0-02 date and units.
3. P0-03 diet and allergies.
4. P0-04 optional fasting.
5. P0-05 goal timeline and chart.
6. P0-06 coaching consent.
7. P1 nutrition, training, mindful, and learn slices in parallel where independent.
8. P2 quality, performance, and release verification.

## Current Release Slice

**P0-01 through P0-05:** Rebuild the consent and onboarding foundation before expanding content catalogs. Every slice must pass `npm run check`, static export assertions, responsive browser tests, and Cloudflare smoke checks.
