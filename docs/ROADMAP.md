# Aurashape — 12-Month Roadmap v1.1

*Updated August 2, 2026 | 3-Person Team | Status: Phase 0 complete, entering Phase 1*

---

## Current State

**Code complete:** E01 (Auth), E02 (Nutrition), E03 (Fasting), E04 (Workout), E05 (Body & Progress)

**Partial:** E06 (Science Content — tips done, articles placeholder), E07 (Community — forum listing + challenges exist, no threads/profiles/recipes), E08 (Email — opt-in done, Resend not wired), E09 (Platform — 7/9 features done, Supabase + store submission pending)

**Remaining MVP work:** ~47 points across community, content, email, and platform.

---

## Phase 0: Foundation ✅ COMPLETE

*August 1-2, 2026*

| Deliverable | Status |
|---|---|
| Expo scaffold, Supabase auth integration, tab navigation | ✅ |
| Privacy consent + onboarding wizard | ✅ |
| Food diary core (search, barcode, custom foods, macro dashboard, habits) | ✅ |
| Intermittent fasting (timer, plans, history) | ✅ |
| Workout tracking (100 exercises, logger, history, PRs) | ✅ |
| Body & progress (weight, measurements, photos, BMI, insights) | ✅ |
| Dark mode (all screens themed, system/manual toggle) | ✅ |
| Data persistence (11 stores via AsyncStorage) | ✅ |
| Analytics (screen tracking, PostHog) | ✅ |
| Sentry error capture (critical paths) | ✅ |

---

## Phase 1: MVP Completion (August 3-16, 2026)

**Goal:** All P0 features complete. App is launchable.

### Sprint 4: Community Core (Aug 3-8)

| Story | Est. | Description |
|---|---|---|
| E07-F04 detail | 5 pts | Thread detail view + nested replies (3 levels) |
| E07-F02 leaderboards | 2 pts | Challenge leaderboards |
| E07-F01 profiles | 3 pts | Community member profiles |
| E07-F03 recipes | 8 pts | Recipe submission form + community recipe feed |
| E07-F05 polish | 2 pts | Nested comment replies + comment likes |

**Exit criteria:** Thread opens to detail view with replies. Users can create and share recipes. Leaderboard visible. Member profiles viewable.

### Sprint 5: Content + Email (Aug 9-11)

| Story | Est. | Description |
|---|---|---|
| E06-F02 articles | 5 pts | 4 full articles as inline JSON with science boxes, citations, detail view |
| E06-F01 tips | 2 pts | Study-reference expandable cards on daily tips + 60 more tips |
| E08-F04 Resend | 2 pts | Welcome email + newsletter template + unsubscribe |
| E08-F02 settings | 1 pt | Newsletter toggle wired to Resend API |

**Exit criteria:** All 4 articles readable with full content. Daily tips have "The Science" detail. Welcome email sends on sign-up.

### Sprint 6: Platform + Launch Prep (Aug 12-16)

| Story | Est. | Description |
|---|---|---|
| E09-F02 Supabase | 5 pts | Project created, schema deployed, RLS, storage buckets, env vars |
| E09-F03 sync | 3 pts | Wire sync queue from stores to Supabase |
| E09-F06 analytics | 1 pt | Action events: meal_logged, fast_started, workout_completed |
| E09-F10 perf | 3 pts | Performance audit, cold start <500ms, memory <150MB |
| E09-F08 submission | 3 pts | Store accounts, icon, splash, screenshots, descriptions, ASO |
| E09-F09 GDPR | 1 pt | Host policies publicly, Supabase DPA |

**Exit criteria:** Supabase live with real data flowing. App submitted to both stores. All legal docs hosted.

---

## Phase 2: Beta Launch (August 17-31, 2026)

**Goal:** Internal testing, bug fixes, store review.

| Week | Activity |
|---|---|
| W3 Aug | Internal beta (team + 10 friends). Bug bash. Crash fixes. |
| W4 Aug | Closed beta (50-100 users). Community seeding. Feedback collection. |
| W4 Aug | App Store + Play Store review process. Address rejections. |

**Launch target:** September 1, 2026 🚀

---

## Phase 3: Growth (September-November 2026)

**Goal:** 500 → 1,000 users. Community self-sustaining.

| Month | Deliverable |
|---|---|
| September | Push notification certs + real push goes live. Deep-link handling. |
| September | AI food photo recognition (E10-F01) |
| October | Streaks system unification (E11-F01) + streak freezes |
| October | Apple Health / Google Fit sync |
| November | Food hacking guides (E06-F03) |
| November | Newsletter hits 250 subscribers |

---

## Phase 4: Community Maturity (December 2026-March 2027)

**Goal:** 1,000 → 5,000 users. Community is the retention engine.

| Month | Deliverable |
|---|---|
| December | Weekly AI health summary (E10-F02) |
| January | German localization (E13-F01) — DACH market entry |
| January | Meal plan generator (E12-F02) |
| February | AI Chat Coach (E10-F03) |
| February | Shopping list generator (E12-F03) |
| March | Team-based challenges (E07 extension) |
| March | Referral engine |

---

## Phase 5: Aurabiosens Launch (April-July 2027)

**Goal:** 5,000 → 10,000 users. Product cross-sell.

| Month | Deliverable |
|---|---|
| April | French + Italian localization (E13-F02, E13-F03) |
| April | Aurabiosens teasers in newsletter + app |
| May | Aurabiosens product tracking tab in app |
| May | Shop tab: product listings, community discount codes |
| June | Wearable integration exploration |
| July | Aurabiosens product launch → Aurashape community = first wave of customers |

---

## Key Decisions

| Decision | Status |
|---|---|
| Community in MVP (not deferred) | ✅ P0 |
| Science content engine in MVP | ✅ P0 |
| AI features deferred to post-launch | ✅ P1 |
| Privacy-first from Day 1 | ✅ Competitive advantage |
| Email capture optional | ✅ GDPR + trust |
| Launch in English, localize later | ✅ Speed to market |
| Inline article content (no CMS dependency) | ✅ New decision |
| Data persistence via Zustand + AsyncStorage | ✅ Simpler than WatermelonDB |
