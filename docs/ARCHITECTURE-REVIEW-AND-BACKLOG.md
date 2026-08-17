# Aurashape — Architecture Review & Deep Product Backlog

**Date:** 2026-08-17
**Scope:** Full-stack review of the Expo/Supabase codebase, competitive gap analysis against
MyFitnessPal, YAZIO and Freeletics, and a cost-minimal execution backlog.
**Constraint:** Reach top-tier product quality at minimal recurring cost.

> This document supersedes nothing. `docs/PRODUCT-BACKLOG.md` and `docs/FINAL-RELEASE-BACKLOG.md`
> remain the record of *release* scope. This document covers what comes after that: the
> structural work needed to compete with category leaders, and the defects that block it.

---

## 0. Executive Summary

Aurashape has more **surface** than its competitors and less **spine**. Ten native tabs,
twelve web nav entries, 15+ Zustand stores, ~30k lines, B2B org tables, a cycle tracker, a
meditation library and a community forum — shipped before offline sync, a food database, or
any way to charge money.

Three findings dominate everything else in this backlog:

| # | Finding | Impact |
|---|---|---|
| **1** | **There is no monetization layer.** No IAP/RevenueCat dependency, no entitlement table, no paywall, no trial. | MyFitnessPal, YAZIO and Freeletics are all subscription businesses. Aurashape currently cannot take a euro. |
| **2** | **Cloud sync is non-functional, not merely incomplete.** `processQueue` has zero callers; the queue is not persisted; only one of four diary mutations enqueues; local IDs are not UUIDs so inserts would be rejected anyway. | "Cloud mode" is write-only-in-theory and write-nothing-in-practice. No multi-device, no reinstall recovery, silent data loss. |
| **3** | **The food database is the moat, and it is one uncached call to Open Food Facts.** | Food search quality *is* the product in this category. OFF is barcode/packaged-heavy and weak on generic and restaurant foods — precisely where MFP wins. |

The good news: the **cost-minimal path is also the high-quality path**. USDA FoodData Central is
public domain, Open Food Facts is open data, on-device SQLite is free, and the deterministic
local coach (`src/lib/localCoach.ts`) already handles the guidance surface without an LLM. The
expensive parts (licensed nutrition APIs, per-user LLM calls, always-on sync servers) are all
avoidable or gate-able behind the paid tier.

**Recommended sequencing:** repair the foundation (W0), win the core logging loop (W1), install
monetization (W2), *then* build retention and training depth (W3–W4). Do not add an eleventh
feature area before the first four are done.

---

## 1. Method & Confidence

- Read: all of `src/`, `app/`, `supabase/`, `scripts/`, `.github/`, `docs/`.
- Verified by inspection with file references throughout.
- **Not** verified: `npm run check` could not be run — this container has no `node_modules`
  (`ls node_modules | wc -l` → 0). CI (`.github/workflows/deploy-web.yml`) is the source of
  truth for the current green/red state. No source files were modified by this review.
- Defect claims below are marked **[confirmed]** — each was proven by reading the code, and
  where a dependency's behaviour was at issue, by reading that dependency's own shipped type
  definitions. Nothing in §2 rests on inference alone. Where a claim depends on *external*
  facts that can change (vendor pricing), it is called out as an explicit verification task
  (**COST-01**) rather than asserted.

---

## 2. Architecture Review

### 2.1 What is genuinely good

Worth protecting during refactors — this is not a rewrite candidate.

- **Privacy-first default is a real differentiator.** `DATA_MODE` defaults to `local`
  (`src/lib/privacyMode.ts:6`) and `isLocalOnly()` gates analytics, sync, push and AI at every
  call site. MyFitnessPal's 2018 breach and its ad-tech posture make "we never see your meals"
  a defensible wedge, especially in the EU.
- **Deterministic local coach.** `src/lib/localCoach.ts` + `src/stores/insights.ts` produce
  guidance with no server round-trip. This is both a privacy feature and a COGS feature —
  most competitors pay for every coaching interaction.
- **AI output is validated, not trusted.** `src/lib/aiClient.ts` runs structural type guards on
  every LLM response (`isFoodAnalysisResult`, `isReadingSummary`, `isWeeklyCoaching`) and
  `src/lib/aiSafety.ts` has 577 lines of tests behind it. This is better discipline than most
  production AI features.
- **Security posture on the backend.** Five migrations of RLS hardening, `SECURITY DEFINER`
  ACLs, advisor hardening, initplan hardening, and a 10-member minimum aggregation threshold
  for employer cohorts. This is real work, correctly done.
- **Test and gate culture.** 20+ suites, Playwright e2e, plus custom guards
  (`assert:secrets`, `assert:local-privacy`, `assert:web-export`) wired into CI.
- **Strict TypeScript** with `noUnusedLocals`/`noUnusedParameters` and a `@/` path alias.

### 2.2 Critical defects

---

#### A1 — Cloud sync does not work [confirmed] · Severity: Critical

Four independent faults, any one of which is fatal:

1. **`processQueue` is never called.** `grep -rn "processQueue" src app` returns only the
   interface declaration (`src/stores/sync.ts:19`) and the implementation
   (`src/stores/sync.ts:38`). No caller on app foreground, on auth, on connectivity change, on
   interval — none.
2. **The queue is not persisted.** `useSyncStore` is a bare `create(...)` with no `persist`
   middleware (`src/stores/sync.ts:23`) — yet `'sync-storage'` is listed as a persisted key in
   `src/lib/localData.ts:20`, implying persistence that does not exist. Every queued write dies
   on app restart.
3. **Three of four diary mutations never enqueue.** `addEntry` enqueues
   (`src/stores/diary.ts:59`); `updateEntry`, `removeEntry` and `copyFromDate` do not. Even a
   working queue would diverge from the server permanently.
4. **The payload cannot be inserted.** `diary_entries.id` is `UUID PRIMARY KEY`
   (`supabase/migrations/001_initial_schema.sql`), but the client generates
   `String(nextId++)` from `let nextId = Date.now()` (`src/stores/diary.ts:32`). The enqueued
   payload also carries the whole denormalized `food` object and a non-UUID `food_id`.
   Postgres rejects it; the item returns to `remaining` and retries forever.

There is also **no pull path**. Sync is conceived as upload-only, so multi-device and
reinstall-recovery are architecturally absent, not merely unimplemented.

**Verdict:** do not patch. Replace with a proper offline-first engine (**FND-02**).

---

#### A2 — Client IDs collide and are not UUIDs [confirmed] · Severity: High

`let nextId = Date.now()` (`src/stores/diary.ts:32`) and `let workoutId = Date.now()`
(`src/stores/workout.ts:42`) are millisecond counters. Two devices, or one device after
reinstall, generate overlapping ID spaces. Merging two devices' histories silently overwrites
records. Fix with UUIDv7 generated client-side (**FND-01**).

---

#### A3 — Diary storage grows without bound in a single JSON blob [confirmed] · Severity: High

`useDiaryStore` persists **every entry ever logged**, each with a fully denormalized `Food`
object, into one AsyncStorage key, and `partialize` spreads the entire state
(`src/stores/diary.ts:186`). Consequences:

- Every meal log serializes the **entire history** and rewrites the whole blob.
- Cold start parses the entire history before first paint.
- A committed user at 5 entries/day with ~300-byte foods reaches ~1.6 MB after a year and
  ~5 MB after three. Android's AsyncStorage has a default 6 MB cursor window — the exact
  ceiling a two-year power user hits, and the failure mode is total diary loss.

MyFitnessPal-scale usage is not survivable on this storage model. Move to SQLite with
date-bucketed reads (**FND-03**).

---

#### A4 — Analytics has never fired a single event [confirmed] · Severity: High

`src/lib/analytics.ts:11` calls `PostHogLib.PostHog.setup(...)`. Inspecting the shipped type
definitions of `posthog-react-native@4.61.1` (`dist/posthog-rn.d.ts:118,176`), `PostHog` is
`declare class PostHog extends PostHogCore` with `constructor(apiKey, options?)` — there is
**no static `setup`**, and `capture`/`identify` are instance methods. So:

- `PostHog.setup` is `undefined` → calling it throws `TypeError`
- the `catch` sets `enabled = false` (`src/lib/analytics.ts:16`)
- `track()` returns early on `!enabled` — **permanently, silently, for every event**

Separately, the options key passed is `captureApplicationLifecycleEvents`; v4 names it
`captureAppLifecycleEvents` (`dist/posthog-rn.d.ts:35`).

The blast radius is the whole measurement plan: `docs/METRICS.md`, activation, funnel and
retention numbers are all zero, and the swallowing `catch` means nobody would ever notice.
Fix in **FND-04**; add a startup assertion so a dead analytics pipe fails loudly.

---

#### A5 — No monetization exists anywhere [confirmed] · Severity: Critical (business)

`grep -ril "revenuecat\|in-app-purchase\|subscription\|paywall\|premium\|stripe"` across
`src/`, `app/`, `supabase/` and `package.json` returns exactly one file — `src/stores/theme.ts`,
matching on an unrelated string. There is no store SDK, no `subscriptions` or `entitlements`
table, no receipt validation, no paywall screen, no trial, no feature gate, no restore-purchase
flow. See **§4** and epic **MON**.

---

#### A6 — Unbounded, ungated AI spend [confirmed] · Severity: High (cost)

`supabase/functions/_shared/openai.ts` calls `gpt-4o-mini` with **no `max_tokens`**, no
per-user rate limit, no daily quota, no response caching and no entitlement check. `analyzeFood`
accepts `imageBase64` (`src/lib/aiClient.ts:44`), so an authenticated user can submit unlimited
vision requests.

The cost trap specific to this configuration: **`gpt-4o-mini` bills images at a much higher
token multiplier than text**, which erases most of the price advantage over larger vision
models. A "cheap model" assumption here is wrong in exactly the code path with the highest
volume. Verify current per-image pricing before launch (**COST-01**) and gate photo analysis
behind the paid tier with a hard quota (**COST-02**).

---

#### A7 — Food data layer is thin, uncached, and subtly inaccurate [confirmed] · Severity: Critical (product)

`src/lib/foodApi.ts` is the entire food system. Problems, in order of user-visible damage:

1. **Serving-size lie.** `calories_per_serving: nutriments['energy-kcal_serving'] ?? nutriments['energy-kcal_100g']`
   (`src/lib/foodApi.ts:52`) — when OFF has no per-serving data, the **per-100 g** value is
   stored in a field named and displayed as *per serving*. Every macro follows the same
   pattern. For a food with a 30 g serving this overstates intake by 3.3×. In a calorie
   tracker, this is the worst class of bug: silently wrong numbers that users act on.
2. **Recall-destroying filter.** The client requires *every* query term to appear as a
   substring of `name + brand` (`src/lib/foodApi.ts:79`). "chicken breast" misses
   "Breast of chicken"; "greek yoghurt" misses "yogurt". No stemming, no fuzzy match, no
   synonym map.
3. **No cache, no offline.** Every keystroke-driven search is a cold network call. Logging a
   meal on the subway fails outright.
4. **No generic foods.** OFF is packaged/barcode-oriented. "banana", "chicken breast, grilled",
   "olive oil" — the majority of real logging — are poorly covered.
5. **No locale filter**, so a German user searching "Quark" competes with the global index.
6. **No micronutrients** beyond fiber; `sugar_g` and `saturated_fat_g` exist in the schema and
   are never populated from OFF.
7. **No frequency/recency ranking** — the single highest-leverage relevance signal in food
   logging, and it is free to compute locally.

This is the epic that decides whether the product is competitive (**FOOD**).

---

### 2.3 Structural problems

#### A8 — Navigation sprawl [confirmed] · Severity: High (product)

The native tab bar (`app/(tabs)/_layout.tsx`) renders **ten** tabs: eight declared and always
visible (Home, Diary, Fasting, Workout, Progress, Mindful, Profile, Community), a conditional
Cycle tab for non-male users (`app/(tabs)/_layout.tsx:91`), and `app/(tabs)/plan.tsx`, which is
**auto-registered by Expo Router without being declared in the layout at all** — an unowned tab
nobody wrote down. Only `organization` is deliberately hidden via `href: null`. The web sidebar
carries twelve entries (`src/web/navItems.ts`).

For reference: MyFitnessPal ships 5 tabs, YAZIO 4, Freeletics 4. A tab bar past ~5 items stops
being navigation and becomes a menu; on a 375 pt screen, ten tabs give each ~37 pt of width
against the 44 pt minimum touch target. Every added surface also dilutes the core loop —
**log → see progress → adjust** — which is the only loop that drives D1/D7 retention.

Recommendation (**UX-01**): collapse to **Home · Diary · Plan · Progress · More**, with
Fasting/Cycle/Mindful/Learn/Community/Organization behind More, let the user promote one
secondary feature into the fifth slot, and declare every route explicitly so no tab can appear
by accident again.

#### A9 — Content libraries are an order of magnitude short [confirmed] · Severity: High (product)

| Library | File | Current | Competitive reference |
|---|---|---:|---|
| Recipes | `src/lib/recipes.ts` | **17** | YAZIO ships 2,500+ |
| Exercises | `src/lib/exercises.ts` | **100** | Freeletics/Strong: 400–900 with media |
| Reading sources | `src/lib/readingSources.ts` | **10** | 50+ per `docs/PRODUCT-BACKLOG.md` P1-10 |
| Tips | `src/lib/tips.ts` | ~90 | adequate |

`docs/PRODUCT-BACKLOG.md` P1-01 already targets 120 recipes. The gap is content production, not
engineering — plan it as a content pipeline with a validation schema (**CONT**), not as tickets.

#### A10 — Circular store dependencies hidden behind swallowing `require`s [confirmed] · Severity: Medium

`src/stores/diary.ts:59-60` does
`try { require('./sync')... } catch {}` and `try { require('./achievements')... } catch {}`;
`achievements.ts` requires `./diary` back. The lazy `require` breaks the cycle at runtime and
the bare `catch {}` swallows *every* error inside — including real bugs in achievement logic and
the sync enqueue. Replace with an event bus or explicit subscription (**FND-05**).

#### A11 — CI has no PR gate and no native pipeline [confirmed] · Severity: Medium

`.github/workflows/deploy-web.yml` triggers only on `push: [main]` and `workflow_dispatch`.
Nothing runs on pull requests, so `npm run check`, the privacy assertions and Playwright only
execute *after* merge to the deploy branch. There is no EAS build, no native test run, no
migration check, no dependency audit. (**QA-01**, **QA-02**)

#### A12 — 11 MB of build output committed to the repository [confirmed] · Severity: Low

`docs/web/` holds a full Expo web export (11 MB against a 3.4 MB packfile). Every rebuild
re-commits changed hashed bundles, growing history permanently. CI already deploys to
Cloudflare Pages, so this directory is redundant. (**COST-06**)

#### A13 — Nutrition targets are static where competitors are adaptive [confirmed] · Severity: Medium

`src/lib/nutritionTargets.ts` resolves targets with `??` fallbacks to fixed defaults
(2000 kcal / 100 / 200 / 55). Mifflin-St Jeor at onboarding, then never revised. MyFitnessPal
and YAZIO both re-derive TDEE from *observed* weight trend versus *logged* intake, which is
strictly more accurate than any equation because it measures the individual's actual energy
balance. This is pure client-side math — zero marginal cost, high perceived intelligence.
(**RET-04**)

#### A14 — Schema/store impedance mismatch [confirmed] · Severity: Medium

The Postgres schema models `foods` as a shared normalized table with `diary_entries.food_id` as
an FK. The client stores a denormalized `food` object inside each entry. Neither
representation can round-trip to the other. Any sync work must first pick one contract
(recommendation: client keeps a denormalized **snapshot** for history immutability *and* a
`food_ref` for dedup — nutrition data legitimately changes over time, and a diary should record
what was true when logged). (**FND-02**)

#### A15 — No health-platform, widget, or wearable integration [confirmed] · Severity: High (retention)

No HealthKit / Health Connect, no home-screen widget, no watch app, no App Intents / Siri, no
Quick Actions. Competitors treat these as core retention infrastructure: weight from a smart
scale, steps as an activity adjustment, and one-tap water logging from a widget each remove
friction from the daily loop. Steps→calorie-adjustment in particular is a headline
MyFitnessPal feature. (**RET-01**, **RET-02**)

#### A16 — English-only [confirmed] · Severity: Medium (growth)

No i18n framework; all copy is inline in components. YAZIO's growth is DACH-first, and the EU
privacy positioning aims at the same market. Retrofitting i18n after ~30k lines of inline
strings is significantly more expensive than installing it now. (**GROW-02**)

---

## 3. Competitive Gap Analysis

Scored against the category leaders. **●** = competitive · **◐** = partial · **○** = absent.

| Capability | MFP | YAZIO | Freeletics | Aurashape | Gap |
|---|:--:|:--:|:--:|:--:|---|
| Food DB breadth & quality | ● | ● | — | ○ | **FOOD-01..05** |
| Barcode scanning | ● | ● | — | ◐ | `app/barcode.tsx` exists; no cache/offline |
| Photo / AI meal logging | ● | ● | — | ◐ | built, ungated, uncosted |
| Quick-add & meal templates | ● | ● | — | ◐ | `QuickAddSheet` web-only |
| Recipe library | ◐ | ● | — | ○ | 17 vs 2,500 |
| Meal planning + grocery list | ○ | ● | — | ◐ | web-only |
| Adaptive calorie targets | ● | ● | — | ○ | **RET-04** |
| Weight-trend smoothing | ● | ● | — | ○ | **RET-05** |
| Guided training programs | — | ◐ | ● | ◐ | no progressive overload engine |
| Exercise media / form video | — | ○ | ● | ○ | **TRN-03** |
| Offline logging | ● | ● | ● | ○ | **FND-02/03** |
| Multi-device sync | ● | ● | ● | ○ | **FND-02** |
| Health platform sync | ● | ● | ● | ○ | **RET-01** |
| Widgets / watch | ● | ● | ● | ○ | **RET-02** |
| Streaks & habit loop | ● | ● | ● | ◐ | achievements exist, no streak surface |
| Paywall / subscription | ● | ● | ● | ○ | **MON-01..06** |
| Localization | ● | ● | ● | ○ | **GROW-02** |
| Intermittent fasting | ○ | ● | — | ● | **ahead** |
| Cycle tracking | ○ | ◐ | — | ● | **ahead** |
| Local-only privacy mode | ○ | ○ | ○ | ● | **ahead — the wedge** |
| Cited, evidence-graded content | ○ | ○ | ○ | ● | **ahead** |
| B2B / employer programs | ◐ | ○ | ◐ | ● | **ahead — revenue option** |

**Read:** Aurashape is ahead on differentiation and behind on fundamentals. Differentiation
without fundamentals does not retain users — nobody stays for a privacy promise if food search
can't find their lunch. Close the fundamentals; the wedge is already built.

---

## 4. Monetization Architecture (cost-minimal)

The single highest-value missing system. Recommended shape:

**Free tier** — unlimited food/water/weight logging, barcode scanning, local-only mode,
fasting timer, deterministic local coach, basic progress charts. Generous by design: the free
tier *is* the acquisition channel, and it costs almost nothing because it runs on-device.

**Aurashape Plus** (~€4.99/mo, ~€29.99/yr, 7-day trial) — AI photo logging (quota'd), adaptive
targets, meal planner + grocery list, full recipe library, program generator, data export,
detailed micronutrients, cloud sync across devices.

**B2B** — the employer-program tables already exist (`202608090001_b2b_foundation.sql`) with a
privacy-preserving aggregation threshold. Per-seat billing on top of shipped infrastructure is
the cheapest revenue line available; treat it as a fast-follow, not a distraction.

**Cost-minimal implementation choices:**

- **RevenueCat** over hand-rolled receipt validation. Free below a meaningful monthly-tracked-revenue
  threshold, then a small percentage — versus weeks of engineering plus indefinite maintenance
  of two store APIs, restore flows and subscription-state edge cases. Verify the current
  threshold and rate before committing (**COST-01**).
- **Entitlements cached on-device** and re-validated on app foreground. Never block the UI on a
  network entitlement check — a user who paid must never see a paywall on a plane.
- **Gate on cost, not on value.** The features that cost money to serve (AI, cloud sync, hosted
  media) are the ones behind the wall. Free-tier users must impose near-zero marginal cost.

---

## 5. Cost Model

**All figures are order-of-magnitude planning assumptions, not quotes.** Vendor pricing changes;
**COST-01** requires verification before any of these numbers enters a financial plan.

**Fixed, unavoidable:** Apple Developer program (annual), Google Play registration (one-time),
domain. **Fixed, near-zero:** Cloudflare Pages hosting (already in use, free tier),
GitHub Actions (free tier for a repo this size), Supabase (a paid tier is required in practice —
free-tier projects pause after inactivity, which is disqualifying for production).

**Variable and dangerous:** LLM inference. This is the only line that scales with usage in a way
that can outrun revenue. Controls, in order of leverage:

1. Gate AI behind the paid tier entirely (**MON-04**).
2. Hard per-user daily quota, enforced server-side in the edge function (**COST-02**).
3. Set `max_tokens` — currently unset (`supabase/functions/_shared/openai.ts`).
4. Cache by normalized-description hash; "chicken breast 200g" should be inferred once
   globally, not once per user (**COST-03**).
5. Downscale images client-side before upload — image token cost scales with resolution, and a
   food photo does not need full-sensor detail (**COST-04**).
6. Route the text-only path through the deterministic parser first; only escalate to the LLM on
   parse failure (**COST-05**).

**Free-tier levers already available or nearly so:**

| Need | Cost-minimal choice | Why |
|---|---|---|
| Generic foods DB | **USDA FoodData Central** (public domain) | No licence fee, no attribution constraint, excellent generic coverage — the exact gap OFF leaves |
| Branded/barcode foods | **Open Food Facts** (ODbL) | Already integrated; free; attribution required |
| Food search infra | **On-device SQLite FTS5** | Zero server cost, works offline, faster than any network call |
| Coaching | **Existing deterministic local coach** | Already built; €0/interaction vs LLM per-call |
| Analytics | PostHog free tier | Sufficient at launch volume |
| Errors | Sentry free tier | Sufficient at launch volume |
| Exercise media | Openly-licensed sources + generated diagrams | Avoids studio production cost; already the policy in `docs/PRODUCT-BACKLOG.md` P1-07 |

**The strategic point:** bundling USDA + OFF into an on-device FTS5 index converts the single
largest recurring cost in this category (a licensed nutrition API) into a one-off engineering
task, and simultaneously fixes offline logging and search latency. It is the best
cost-per-quality trade available in this backlog.

---

## 6. Target Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Expo app (iOS · Android · Web)                                  │
│                                                                  │
│  UI          Expo Router · NativeWind · Skia/Victory charts       │
│  State       Zustand stores (unchanged public API)                │
│  ── new ──                                                        │
│  Data        Repository layer  ← single seam for all persistence  │
│  Storage     SQLite (expo-sqlite): diary · workouts · body · foods │
│              AsyncStorage: prefs + session only                   │
│  Search      SQLite FTS5 over bundled USDA+OFF + recency ranking  │
│  Sync        Outbox + pull cursor · UUIDv7 · LWW + tombstones     │
│  Entitle     RevenueCat SDK → cached entitlement snapshot         │
│  Health      HealthKit / Health Connect (opt-in)                  │
└───────────────┬──────────────────────────────────────────────────┘
                │ (cloud mode only — local mode terminates here)
┌───────────────▼──────────────────────────────────────────────────┐
│  Supabase (EU)   Postgres + RLS · Auth · Storage · Edge Functions │
│                  ai-coach (quota + cache + max_tokens)            │
│                  send-emails · entitlement webhook receiver       │
└──────────────────────────────────────────────────────────────────┘
```

**The one architectural rule to enforce:** stores must never touch AsyncStorage or Supabase
directly. Every read and write goes through the repository layer. That seam is what makes the
SQLite migration, the sync engine and local/cloud mode switching tractable instead of a
15-store rewrite. Introduce it in **FND-01** before anything else.

---

## 7. The Backlog

Estimates in ideal engineering days for one experienced developer.
**P0** = blocks a competitive launch · **P1** = required for parity · **P2** = advantage/scale.

### Phase W0 — Foundation Repair · P0 · ~22–30 d

*Nothing else in this backlog is safe to build until this phase lands.*

| ID | Story | AC | Est | Deps |
|---|---|---|---:|---|
| **FND-01** | Repository layer + UUIDv7 IDs | All persistence behind `src/data/*` repositories; no store imports AsyncStorage or `supabase` directly (enforced by lint rule); all client IDs are UUIDv7; migration converts existing `Date.now()` IDs in place without data loss | 4 | — |
| **FND-02** | Offline-first sync engine | Persisted outbox survives restart; all mutations (insert/update/**delete**) enqueue; exponential backoff with jitter; poison-item quarantine after N attempts; **pull path** with a server cursor; last-write-wins on `updated_at` with tombstones for deletes; flush on foreground, on auth, on connectivity regain; user-visible sync status; two-device integration test proves convergence | 8 | FND-01 |
| **FND-03** | SQLite storage migration | `expo-sqlite` for diary, workouts, body logs, foods; date-range indexed queries; one-time AsyncStorage→SQLite migration, idempotent and reversible; cold start unaffected by history size; perf test with a seeded 3-year diary | 5 | FND-01 |
| **FND-04** | Fix analytics pipeline | Instance API (`new PostHog(key, opts)`); correct `captureAppLifecycleEvents` key; startup assertion fails loudly in dev when init fails; no bare `catch {}` around init; smoke test asserts an event reaches the sink | 1 | — |
| **FND-05** | Break store dependency cycles | Replace inline `require()` + `catch {}` with an event bus or explicit subscriptions; no swallowed errors; achievements and sync react to domain events | 2 | FND-01 |
| **FND-06** | Fix serving-size normalization | Per-100 g values are **never** presented as per-serving; explicit `basis: 'serving' \| '100g'` on every food; UI states the basis; unit tests cover OFF products with and without serving data; audit + correct existing logged entries | 2 | — |
| **FND-07** | Reconcile schema ↔ client model | One documented contract; entries store an immutable nutrition **snapshot** plus a `food_ref`; migration aligns both sides; round-trip test | 2 | FND-01, FND-02 |
| **FND-08** | Sentry release health | Source maps uploaded per release, release tagging, `beforeSend` PII scrub verified against local-mode guarantees | 1 | — |
| **FND-09** | Data-integrity guards | No `NaN`/negative macros persisted; date boundaries respect device timezone; DST-safe day math; property tests on aggregation | 2 | FND-01 |

### Phase W1 — Win the Core Loop · P0 · ~20–26 d

*This is the phase that decides whether the product is competitive.*

| ID | Story | AC | Est | Deps |
|---|---|---|---:|---|
| **FOOD-01** | Bundle USDA FoodData Central | Public-domain Foundation + SR Legacy generic foods normalized into a bundled SQLite DB; build-time generation script, reproducible; documented licence provenance; app size impact measured and budgeted | 4 | FND-03 |
| **FOOD-02** | On-device FTS5 search | SQLite FTS5 index; prefix + fuzzy matching; stemming and a synonym map (yoghurt/yogurt, courgette/zucchini); results in <50 ms p95 offline; replaces the all-terms substring filter | 4 | FOOD-01 |
| **FOOD-03** | Relevance ranking | Ranking blends text score + personal frequency + recency + verified-source weight; "your foods" surface above global results; measurably fewer keystrokes-to-log (instrumented) | 3 | FOOD-02, FND-04 |
| **FOOD-04** | OFF cache + offline barcode | Barcode and search results cached in SQLite with TTL; offline scan resolves from cache; graceful degraded state; country/locale filter on OFF queries | 3 | FOOD-01 |
| **FOOD-05** | Serving & portion model | Multiple named portions per food (g, ml, cup, slice, piece, package); imperial/metric equivalence; portion picker with a numeric keypad; conversions reversible and unit-tested | 3 | FND-06 |
| **FOOD-06** | Quick-add & meal templates | Save any meal as a reusable template; copy yesterday; recent/favorites on the first screen; **≤3 taps from app open to a logged repeat meal** | 3 | FOOD-03 |
| **FOOD-07** | Micronutrients | Sugar, saturated fat, sodium, potassium populated from both sources; diary surfaces them; targets where evidence supports one | 2 | FOOD-01 |
| **FOOD-08** | Food-log editing quality | Inline edit of servings, undo on delete, swipe actions, drag between meal slots, bulk delete | 2 | FND-02 |
| **UX-01** | Navigation collapse | Five primary tabs (Home · Diary · Plan · Progress · More); everything else under More; one user-promotable slot; every route explicitly declared (no router auto-registration); deep links preserved; no route orphaned; a11y touch targets ≥44 pt | 3 | — |

### Phase W2 — Monetization · P0 · ~12–16 d

| ID | Story | AC | Est | Deps |
|---|---|---|---:|---|
| **MON-01** | Store + RevenueCat integration | `react-native-purchases` wired for iOS and Android; products configured; sandbox purchase, renewal, cancellation, refund and **restore** all verified on device | 4 | — |
| **MON-02** | Entitlement layer | Single `useEntitlement()` source of truth; cached on-device, revalidated on foreground; **never blocks UI on network**; offline grace period; deterministic in tests | 2 | MON-01 |
| **MON-03** | Paywall + trial | 7-day trial; paywall states (trial / active / expired / grace / billing-retry); required store-policy links; localized pricing; full-funnel instrumentation | 3 | MON-02, FND-04 |
| **MON-04** | Feature gating | AI, adaptive targets, planner, full recipe library, cloud sync, export gated; free tier never degraded below "unlimited manual logging"; a gated feature never appears then disappears | 2 | MON-02 |
| **MON-05** | Server-side entitlement | RevenueCat webhook → Supabase `entitlements` table; RLS-protected; edge functions check entitlement before spending on inference; client claims are never trusted | 2 | MON-01 |
| **MON-06** | Subscription lifecycle UX | Manage/cancel deep link, expiry notice, win-back offer, refund handling, "what you keep if you cancel" clearly stated | 2 | MON-03 |

### Phase W3 — Retention & Habit · P1 · ~18–24 d

| ID | Story | AC | Est | Deps |
|---|---|---|---:|---|
| **RET-01** | Health platform sync | HealthKit + Health Connect, opt-in and revocable; weight in/out, steps in, workouts out; steps drive an activity adjustment with the calculation shown; local mode unaffected | 5 | FND-01 |
| **RET-02** | Widgets & quick actions | Home-screen widget (remaining calories, one-tap water); iOS App Intents / Siri; Android quick settings tile; deep links to a pre-filled log | 4 | UX-01 |
| **RET-03** | Streaks & habit loop | Unified cross-feature streak; freeze/repair mechanic; honest milestone celebration; streak visible on Home; no dark patterns | 3 | FND-05 |
| **RET-04** | Adaptive calorie targets | Weekly TDEE re-derived from observed weight trend vs logged intake; user-visible explanation and an opt-out; safe-rate clamps and warnings; replaces static `getNutritionTargets` defaults | 3 | FND-03, FOOD-03 |
| **RET-05** | Weight trend smoothing | Exponentially-weighted trend line alongside raw weight; explains water-weight noise; projection uses trend, not last reading | 2 | RET-04 |
| **RET-06** | Notification intelligence | Meal reminders adapt to observed logging times; quiet hours; per-channel opt-out; frequency cap; every notification deep-links to the action | 3 | RET-03 |
| **RET-07** | Onboarding → first log | First food logged inside the first session is the activation metric; onboarding ends *in* the diary, not on a summary screen; funnel instrumented at every step | 3 | UX-01, FND-04 |

### Phase W4 — Training Depth (Freeletics parity) · P1 · ~16–22 d

| ID | Story | AC | Est | Deps |
|---|---|---|---:|---|
| **TRN-01** | Exercise DB 100 → 400+ | Exercises with muscle groups, equipment, difficulty, alternatives, contraindications, cues; schema-validated; sourced per `docs/PRODUCT-BACKLOG.md` P1-07 licensing rules | 5 | — |
| **TRN-02** | Progressive overload engine | Program generator adapts load/volume from logged performance and RPE; deload logic; plateau detection; explains every recommendation | 5 | TRN-01, FND-03 |
| **TRN-03** | Exercise media | Openly-licensed images or legal embeds with attribution; generated fallback diagrams; lazy-loaded and cached; no unlicensed content | 3 | TRN-01 |
| **TRN-04** | Workout session UX | Rest timer with background notification, plate calculator, previous-performance inline, superset support, in-session reordering | 3 | TRN-01 |
| **TRN-05** | Training analytics | Volume by muscle group, 1RM estimates, PR timeline, weekly load and fatigue proxy | 2 | TRN-02 |

### Phase W5 — Content & Growth · P1/P2 · ~20–28 d

| ID | Story | AC | Est | Deps |
|---|---|---|---:|---|
| **CONT-01** | Recipe library 17 → 300+ | Structured ingredients, macros computed from the food DB (not hand-entered), allergens, cuisine, cost, time; validation script in CI; hard allergen exclusion enforced | 8 | FOOD-01 |
| **CONT-02** | Meal planner on native | Port `src/web/MealPlanner.tsx` + `GroceryList.tsx` to native; targets- and allergy-aware; substitutions preserve exclusions | 4 | CONT-01 |
| **CONT-03** | Learn library 10 → 50+ | Cited articles with evidence grades and review dates per the existing content policy | 5 | — |
| **GROW-01** | ASO & store presence | Screenshots, preview video, localized listings; `docs/aso/` assets executed | 3 | MON-03 |
| **GROW-02** | Localization framework | i18n installed, strings extracted, German first; pluralization, date/number/unit formatting; pseudo-locale test in CI | 5 | UX-01 |
| **GROW-03** | Referral & sharing | Shareable progress cards (privacy-safe by default), referral attribution, deep-link install flow | 3 | MON-03 |

### Phase W6 — Cost & Operational Discipline · P0/P1 · ~10–14 d

| ID | Story | AC | Est | Deps |
|---|---|---|---:|---|
| **COST-01** | Verify all vendor pricing | Current published pricing for OpenAI (**including the image token multiplier**), RevenueCat, Supabase, Sentry, PostHog, Resend, EAS documented with dates and links; §5 updated; unit economics modeled at 1k / 10k / 100k MAU | 1 | — |
| **COST-02** | AI quota & rate limiting | Server-enforced per-user daily quota in the edge function; `max_tokens` set; 429 with a clear user message; quota visible in-app; abuse alerting | 2 | MON-05 |
| **COST-03** | AI response caching | Normalized-description hash cache shared across users; cache-hit rate instrumented; target ≥40% on text analysis | 2 | COST-02 |
| **COST-04** | Client-side image downscaling | Photos resized and re-compressed before upload; measured token/cost reduction; accuracy regression tested against a labeled set | 1 | COST-02 |
| **COST-05** | Deterministic-first food parsing | "200g chicken breast" resolves locally from the FTS index; LLM invoked only on parse failure; hit rate instrumented | 2 | FOOD-02, COST-03 |
| **COST-06** | Remove committed web build | `docs/web/` deleted and gitignored; CI remains the only deploy path; history-rewrite decision documented | 0.5 | — |
| **QA-01** | PR CI gate | `npm run check`, `assert:secrets`, `assert:local-privacy`, Playwright run on **every PR**; branch protection requires green | 1 | — |
| **QA-02** | Native build pipeline | EAS build + submit for iOS/Android; versioning and release channels; OTA update policy documented | 3 | — |
| **QA-03** | Performance budgets | Cold start, bundle size, list scroll FPS, search latency budgeted and asserted in CI; regressions fail the build | 2 | FND-03 |

---

## 8. Sequencing

```
W0 Foundation ██████████████  ← nothing ships on a broken base
   └─ W1 Core Loop  ████████████    ← this is the product
        ├─ W2 Monetization ███████  ← install before growth spend
        └─ W3 Retention   ██████████
             ├─ W4 Training  █████████
             └─ W5 Content/Growth ██████████
W6 Cost & Ops  ▓▓▓ ← runs continuously alongside; COST-01 and QA-01 start immediately
```

**Rough totals:** W0–W2 (competitive launch) ≈ 54–72 d · W0–W4 (full parity) ≈ 88–118 d.

**Two rules for this sequence:**

1. **No new feature areas until W2 completes.** The product has ten tabs and no revenue.
   The next thing built should be depth, not breadth.
2. **COST-01 and QA-01 start on day one.** They are cheap, they unblock every financial and
   quality decision downstream, and both are under a day of work.

---

## 9. Release Gates

| Gate | Threshold |
|---|---|
| Activation | ≥60% of new users log a food within their first session (**RET-07**) |
| Search quality | ≥90% of top-20 searches resolve in ≤3 keystrokes; p95 <50 ms offline |
| Sync integrity | Two-device convergence test passes; zero data-loss findings in a 7-day soak |
| Nutrition accuracy | Zero per-100 g values presented as per-serving; spot-audit of 100 foods |
| Cost | AI COGS per paying user below a documented ceiling from **COST-01** |
| Retention | D1 ≥40%, D7 ≥20%, D30 ≥10% |
| Quality | `npm run check` green on PRs; performance budgets enforced; no critical a11y defects |

---

## 10. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Sync rewrite corrupts existing local data | High | FND-01/02/03 ship behind a flag; migrations idempotent and reversible; export-before-migrate; staged rollout |
| USDA/OFF still leave coverage gaps | Medium | Measure search success rate before deciding on a paid provider — exactly the evaluation `docs/PRODUCT-BACKLOG.md` P1-05 already calls for |
| AI cost outruns subscription revenue | High | MON-04 gating + COST-02..05; alerting on cost-per-user; kill switch on the edge function |
| Bundled food DB inflates app size | Medium | Measure in FOOD-01; ship a compact core index with on-demand expansion if the budget is exceeded |
| Content production (recipes/exercises) stalls engineering | Medium | Run CONT/TRN-01 as a parallel content track with a schema contract, not as engineering tickets |
| Feature sprawl resumes | Medium | UX-01 plus an explicit "no new tabs before W2" rule |
| App Store subscription rejection | Medium | MON-03 covers required disclosures and restore; review guidelines checked before submission |

---

## 11. Explicitly Out of Scope

Recorded so they are decisions rather than oversights: social feed expansion, video coaching,
live classes, hardware integrations beyond standard health platforms, marketplace/coach
matching, Android Wear/watchOS standalone apps (beyond RET-02 widgets), and any additional
top-level feature area before W2 closes.
