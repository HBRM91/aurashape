# Aurashape — Full Product Backlog

*All epics, user stories, and acceptance criteria | Version 1.1 — August 2026*

---

## Priority Legend

| Tag | Meaning |
|---|---|
| P0 | Must ship in MVP. No launch without this. |
| P1 | Should ship. Defer only if blocked. |
| P2 | Nice to have. Phase 2+. |

---

## Status Legend

| Icon | Meaning |
|---|---|
| ✅ | Done |
| ⚠️ | Partial — core works, missing polish/edge cases |
| 🔲 | Not started |

---

## E01 — Authentication & Onboarding | 12 pts | ✅ Complete

### E01-F01: Email + Social Sign-Up | P0 | 3 pts ✅

**AC:**
- [x] Sign-up with email + password (min 8 chars, 1 number, 1 uppercase)
- [x] Sign-up with Google OAuth
- [x] Sign-in with Apple (iOS) / Google (Android)
- [x] Login with existing credentials
- [x] "Forgot password" → reset email via Resend
- [x] Error messages: invalid email, weak password, existing account
- [x] Session persistence (stay logged in)

---

### E01-F02: Privacy Consent Screen | P0 | 2 pts ✅

**AC:**
- [x] Shown BEFORE sign-up form
- [x] Clear language: "We never see your meals. We never sell your data."
- [x] Three checkboxes (all UNCHECKED by default)
- [x] Links to full Privacy Policy and ToS
- [x] Consent persisted to AsyncStorage

---

### E01-F03: Onboarding Wizard | P0 | 5 pts ✅

**AC:**
- [x] Step 1 — Goal: Icon cards (Lose weight / Build muscle / Improve health / Maintain)
- [x] Step 2 — Body: Sex, age (16-100), height (cm or ft/in), current weight, target weight
- [x] Step 3 — Activity: 4 levels with PAL values and example personas
- [x] Step 4 — Fasting: Optional plan (Skip / 14:10 / 16:8 / 18:6 / Custom)
- [x] Step 5 — Summary: Calorie target + macro split + fasting plan
- [x] Step 6 — Newsletter: Optional email, Subscribe/Skip
- [x] All calculations on-device (Mifflin-St Jeor equation)

---

### E01-F04: Profile & Settings | P0 | 2 pts ✅

**AC:**
- [x] View/edit avatar, display name, bio, goal summary
- [x] Re-enter onboarding wizard to change goals → targets recalculate
- [x] Toggle metric/imperial units
- [x] Notification preferences per channel
- [x] "Export My Data" → JSON download
- [x] "Delete My Account" → confirmation → cascade delete → logout

---

## E02 — Nutrition & Calorie Tracking | 23 pts | ✅ Complete

### E02-F01: Food Diary — Meal Slots | P0 | 5 pts ✅

**AC:**
- [x] Date picker (swipe, calendar tap)
- [x] Calorie progress bar: green <90%, yellow 90-100%, red >100%
- [x] Macro progress bars: Protein (blue), Carbs (yellow), Fat (pink)
- [x] 4 meal slots: Breakfast, Lunch, Dinner, Snacks
- [x] Each slot: entries list + subtotal calories + "+" button
- [x] Empty state illustration
- [x] Add food: bottom sheet (Search / Scan / Photo)
- [x] Swipe left → delete (with undo snackbar)
- [x] Long-press slot → "Same as yesterday"

---

### E02-F02: Food Search & Database | P0 | 5 pts ✅

**AC:**
- [x] Autocomplete (2+ chars, 300ms debounce)
- [x] Queries Open Food Facts API + local Supabase foods table
- [x] Results: name, brand, calories/serving, serving size
- [x] "Verified" badge on API entries
- [x] Tap → log detail (serving size + quantity multiplier)
- [x] "Can't find it? Add manually" button
- [x] Recent/frequent foods (last 20) above results

---

### E02-F03: Barcode Scanner | P0 | 5 pts ✅

**AC:**
- [x] Camera with barcode detection overlay
- [x] Query Open Food Facts by barcode
- [x] Result: product name, macros, serving size
- [x] "Log This" → pre-filled → add to slot
- [x] "Not found" → "Add manually" + "Try photo"
- [x] Sentry error capture on lookup failures

---

### E02-F04: Custom Food Creator | P0 | 3 pts ✅

**AC:**
- [x] Form: name (req), brand, serving size+unit, calories/serving (req), protein, carbs, fat, fiber
- [x] Saved to local store + persisted to AsyncStorage
- [x] Appears in "My Foods" search section
- [x] Editable and deletable

---

### E02-F05: Macro Dashboard | P0 | 3 pts ✅

**AC:**
- [x] Donut chart: Protein (blue), Carbs (yellow), Fat (pink)
- [x] Center: total calories consumed
- [x] Per-macro grams eaten/target below

---

### E02-F06: Water & Habit Trackers | P0 | 2 pts ✅

**AC:**
- [x] Water tracker: circular ring, "+" = 250ml, long-press = custom
- [x] Default target: 2000ml (configurable)
- [x] Fruit counter + vegetable counter
- [x] Visible on Home (primary) and Diary (secondary)
- [x] Data persisted to AsyncStorage

---

## E03 — Intermittent Fasting | 7 pts | ✅ Complete

### E03-F01: Fasting Timer | P0 | 4 pts ✅

**AC:**
- [x] Animated SVG ring timer (purple=fasting, green=eating)
- [x] "Start Fasting" button
- [x] Shows: elapsed time, remaining time, current phase
- [x] "End Fast Early" with confirmation
- [x] Updates every second during active fast

---

### E03-F02: Fasting Plans | P0 | 2 pts ✅

**AC:**
- [x] Cards: 14:10 (Beginner), 16:8 (Recommended), 18:6 (Advanced), 20:4 (Warrior), 5:2, 6:1, Custom
- [x] 16:8 pre-selected if onboarding choice
- [x] Custom: pick fasting hours (4-48)
- [x] Switching preserves history

---

### E03-F03: Fasting Notifications | P0 | 1 pt ⚠️

**AC:**
- [x] Notification scheduling code written
- [ ] "Fast complete! Eating window open" — needs real push certs
- [ ] "30 min until fasting starts" — needs real push certs
- [ ] "1 hour left in eating window" — needs real push certs
- [x] All individually toggleable in settings

---

### E03-F04: Fasting History | P1 | 3 pts ✅

**AC:**
- [x] Monthly calendar (green=complete, gray=incomplete)
- [x] History list with duration and completion status
- [x] Data persisted to AsyncStorage

---

## E04 — Workout Tracking | 18 pts | ✅ Complete

### E04-F01: Exercise Library | P0 | 5 pts ✅
### E04-F02: Workout Logger | P0 | 8 pts ✅
### E04-F03: Workout History & PRs | P0 | 3 pts ✅
### E04-F04: Post-Workout Summary | P0 | 2 pts ✅

---

## E05 — Body & Progress | 11 pts | ✅ Complete

### E05-F01: Weight Logger & Chart | P0 | 3 pts ✅
### E05-F02: Body Measurements | P0 | 3 pts ✅
### E05-F03: Progress Photos | P0 | 5 pts ✅

---

## E06 — Science Content Engine | 18 pts | ⚠️ Partial

### E06-F01: Daily Health Hack Tip | P0 | 3 pts ⚠️

**AC:**
- [x] Home screen card: "Today's Science"
- [x] Tip title + explanation + source
- [x] Category badge: #FoodHack / #HealthHack / #FastingScience
- [x] 30 tips pre-loaded (1 month)
- [x] Comment section on tips
- [x] Data persisted to AsyncStorage
- [ ] "The Science" expandable card per tip (study, authors, journal, year)
- [ ] Reactions: 👍 💬 🔄 on tips (currently only comments)
- [ ] Archive by category view
- [ ] Expand to 90 tips (3 months coverage)

**Remaining work:** Add study-reference expandable cards to each tip, reaction buttons, archive view. Write 60 more tips.

---

### E06-F02: Deep-Dive Articles | P0 | 12 pts 🔲

**AC:**
- [x] Article list with category + read time
- [x] Category filter chips (All/Nutrition/Fasting/Science/Workouts)
- [ ] Full article content — 4 articles with structured body (paragraphs, "The Science" boxes, citations)
- [ ] Article detail view with full content rendering
- [ ] Bookmark articles
- [ ] Share articles
- [x] Comment section on articles
- [x] Data persisted to AsyncStorage
- [ ] New article every Sunday pipeline

**Remaining work:** Write 4 full articles as inline JSON with sections, science boxes, and citations. Build article detail view. Add bookmark/share.

---

### E06-F03: Food Hacking Guides | P1 | 3 pts 🔲

**AC:**
- [ ] Visual card guides: infographic style, scannable
- [ ] Topics: Satiating Plate, Glycemic Index, Macros, Protein for Vegans
- [ ] Shareable as images

---

## E07 — Community Features | 28 pts | 🔲 Not Started

### E07-F01: User Profiles | P0 | 3 pts 🔲

**AC:**
- [ ] Avatar, username, bio, goal, member since
- [ ] Stats (optional): streak, workouts/month, goal % (not absolute)
- [ ] Privacy: "Show to: Everyone / Community / Nobody"
- [ ] "Show weight: Goal % only / No"
- [ ] "Show workouts: Yes / No"
- [ ] Defaults: Community-only, weight hidden

---

### E07-F02: Weekly Challenges | P0 | 5 pts ⚠️

**AC:**
- [x] Tab: Active / Upcoming / Past (in community screen)
- [x] 5 challenge types: 7-Day Tracking, Workout 4x, Protein Crusher, Water Warrior, Mindful Minutes
- [x] Join/leave challenges
- [x] Personal progress tracking (+25% button)
- [ ] Leaderboard — community average + ranked by completion %
- [ ] Completion badge on profile
- [ ] Push: "Weekend challenge starts tomorrow!" — needs real push certs

**Remaining work:** Leaderboard view, challenge completion badges, push notifications.

---

### E07-F03: Recipe Sharing | P0 | 8 pts 🔲

**AC:**
- [ ] Submit: name, description, photo, ingredients (DB-linked), instructions, prep/cook time, servings
- [ ] Macros auto-calculated from ingredients
- [ ] Tags: meal type, diet
- [ ] Feed: grid (photo, name, creator, macros, likes)
- [ ] "Log This Recipe" → all ingredients → diary
- [ ] Like, comment, save, share
- [ ] "Top Recipes This Week"
- [ ] User-submitted recipes stored + persisted

---

### E07-F04: Discussion Forum | P0 | 10 pts ⚠️

**AC:**
- [x] Thread list with categories: Fasting, Progress, Nutrition, Workouts, Recipe, General
- [x] Create thread: title, body, category
- [x] 5 seed threads pre-loaded
- [x] Like/delete threads
- [x] Data persisted to AsyncStorage
- [ ] Thread detail view — tap opens thread with full content
- [ ] Nested replies (max 3 levels) on threads
- [ ] Upvote/downvote on replies
- [ ] Sort: Newest / Most Upvoted
- [ ] Report → moderation queue
- [ ] Community guidelines pinned

**Remaining work:** Thread detail screen, nested reply UI, voting, moderation reporting, guidelines.

---

### E07-F05: Tip & Article Comments | P0 | 2 pts ⚠️

**AC:**
- [x] Comments on every tip and article
- [x] Basic comment add/view
- [ ] Nested replies (3 levels)
- [ ] Like button on comments
- [ ] Team badge on official replies

**Remaining work:** Nested reply threading, comment likes, official reply badges.

---

## E08 — Email & Newsletter | 5 pts | ⚠️ Partial

### E08-F01: Onboarding Opt-In | P0 | 1 pt ✅
### E08-F02: Settings Management | P0 | 1 pt ⚠️

**AC:**
- [x] Toggle newsletter on/off in settings
- [ ] Unsubscribe webhook endpoint
- [ ] GDPR-compliant consent logging to Supabase

---

### E08-F03: Newsletter Content | P0 | 1 pt 🔲
- [ ] Weekly template: Science Bite, Community Spotlight, What's New
- [ ] Content pipeline for weekly sends

---

### E08-F04: Resend Integration | P0 | 2 pts 🔲

**AC:**
- [ ] Welcome email on sign-up
- [ ] Newsletter template + scheduled send
- [ ] Unsubscribe webhook
- [ ] Consent logged to Supabase
- [ ] Resend API key configured in env vars

---

## E09 — Platform | 35 pts | ⚠️ Partial

### E09-F01: App Shell & Navigation | P0 | 3 pts ✅

- [x] Bottom tabs: Home / Diary / Fasting / Workout / Progress / Cycle / Mindful / Profile
- [x] Community tab registered (hidden from tab bar, accessible via navigation)
- [x] Stack screens: Articles, Recipes, Summary, Barcode Scanner

---

### E09-F02: Supabase Setup | P0 | 5 pts 🔲

**AC:**
- [ ] Supabase project created (EU/Frankfurt region)
- [ ] Auth configured: email/password, Google OAuth, Apple OAuth
- [ ] Full database schema deployed with migrations
- [ ] Row-Level Security policies on all tables
- [ ] Storage buckets for: progress photos, recipe images, exercise GIFs
- [ ] Production env vars configured (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] Profile table sync from auth.users

---

### E09-F03: Offline-First | P0 | 8 pts ⚠️

**AC:**
- [x] All user data persists to AsyncStorage (survives app restart)
- [x] Sync queue infrastructure (insert/update/delete with retry)
- [ ] Wired from stores to Supabase — stores write local then enqueue sync
- [ ] Last-write-wins conflict resolution
- [ ] Sync status badge in app
- [ ] Queued items survive app restart (sync queue persisted)

**Remaining work:** Wire sync queue to Supabase writes, conflict resolution, sync status indicator.

---

### E09-F04: Push Notifications | P0 | 3 pts ⚠️

**AC:**
- [x] Notification scheduling infrastructure (Expo Notifications)
- [x] Channel definitions: Fasting, Cycle, Meditation, Meal Reminders, Weekly Tips
- [x] Preferences UI in profile settings
- [ ] Real push certificates (APNs + FCM)
- [ ] Push token registration with Expo Push API
- [ ] Deep-link handling on notification tap

**Remaining work:** Configure APNs and FCM in developer accounts, register tokens.

---

### E09-F05: Dark Mode | P0 | 2 pts ✅

- [x] System detection + manual toggle (System / Light / Dark)
- [x] Full ThemeColors system with light and dark palettes
- [x] All screens themed: Home, Diary, Fasting, Workout, Progress, Cycle, Mindful, Profile, Community, Articles, Recipes, Summary
- [x] Tab bar themed
- [x] Settings persisted to AsyncStorage

---

### E09-F06: Analytics | P0 | 2 pts ✅

- [x] PostHog integration (EU host)
- [x] Screen view tracking on all tab screens + articles
- [x] Identify user on auth
- [x] Anonymous events only, no PII
- [ ] Core event tracking: meal_logged, fast_started, workout_completed, weight_logged, meditation_completed, challenge_joined

**Remaining work:** Add action events (meal_logged, fast_started, etc.) in store actions.

---

### E09-F07: Crash Reporting | P0 | 1 pt ✅

- [x] Sentry integration
- [x] Error capture in critical paths: barcode scanner, food API, sync queue
- [x] Native crash handling enabled
- [ ] Source maps upload during build

**Remaining work:** EAS Build source map upload config.

---

### E09-F08: App Store Submission | P0 | 8 pts 🔲

**AC:**
- [ ] Apple Developer Program account ($99/year)
- [ ] Google Play Console account ($25 one-time)
- [ ] App icon (1024×1024)
- [ ] Splash screen design
- [ ] App Store screenshots (6.5" and 5.5" displays)
- [ ] Play Store screenshots + feature graphic
- [ ] App Store description (short + long)
- [ ] ASO metadata (keywords, subtitle, promotional text)
- [ ] Privacy nutrition labels (App Store)
- [ ] Data safety section (Play Store)
- [ ] No medical claims — verified by legal review

---

### E09-F09: GDPR Compliance | P0 | 3 pts ⚠️

**AC:**
- [x] Privacy Policy document (in repo)
- [x] Terms of Service document (in repo)
- [x] Privacy consent screen with opt-in checkboxes
- [x] Data export → JSON share
- [x] Account deletion → cascade delete → logout
- [ ] Host Privacy Policy + ToS at public URL
- [ ] Data Processing Agreement (DPA) with Supabase
- [ ] Record of Processing Activities (RoPA) document

**Remaining work:** Host legal docs publicly, sign DPA with Supabase.

---

### E09-F10: Performance & Polish | P0 | 5 pts 🔲

*New story — identified during audit*

**AC:**
- [ ] Home screen loads in <500ms on cold start
- [ ] Food search autocomplete <300ms debounce
- [ ] Image caching for progress photos
- [ ] Scroll performance on diary with 50+ entries
- [ ] Memory profiling — under 150MB during active workout
- [ ] Battery impact test — <5% drain per hour of fasting timer

---

## E10 — AI Coach (Phase 1) | P1 | 21 pts 🔲

*Deferred to post-launch. Not in MVP scope.*

---

## E11 — Gamification (Phase 1) | P1 | 8 pts 🔲

### E11-F01: Streaks System | P1 | 3 pts ⚠️

- [x] Streak tracking in meditation store (days meditated)
- [x] Diary streak calculation in achievements
- [ ] Unified streak system: "You're on a 5-day health streak!"
- [ ] Streak freeze (1 per week)

**Remaining work:** Unified cross-feature streak system, streak freeze mechanic.

---

### E11-F02: Achievements & Badges | P1 | 5 pts ✅

- [x] 18 achievements across 5 categories
- [x] Auto-check on every relevant action
- [x] Unlock tracking with timestamps
- [x] Persisted to AsyncStorage

---

## E12 — Meal Plans & Recipes (Phase 2) | P2 | 21 pts 🔲

*Post-launch.*

---

## E13 — i18n (Phase 2) | P2 | 24 pts 🔲

*Post-launch. German first (DACH market).*

---

## MVP Launch Checklist

Below is the prioritized list of everything needed to go from "code works" to "shipping."

### BLOCKERS — Cannot launch without these

| # | Item | Epic | Est. |
|---|------|------|------|
| 1 | Supabase project + schema + env vars | E09-F02 | 5 pts |
| 2 | Apple Developer + Google Play accounts | E09-F08 | 2 pts |
| 3 | App icon + splash screen design | E09-F08 | 2 pts |
| 4 | Store screenshots + descriptions + ASO | E09-F08 | 3 pts |
| 5 | Host Privacy Policy + ToS publicly | E09-F09 | 1 pt |

### USER-FACING — Must ship for MVP

| # | Item | Epic | Est. |
|---|------|------|------|
| 6 | Thread detail view + nested replies | E07-F04 | 5 pts |
| 7 | Challenge leaderboards | E07-F02 | 2 pts |
| 8 | User profiles (community members) | E07-F01 | 3 pts |
| 9 | Recipe submission + feed | E07-F03 | 8 pts |
| 10 | 4 full articles with inline content | E06-F02 | 5 pts |
| 11 | Study-reference cards on daily tips | E06-F01 | 2 pts |
| 12 | Nested comment replies + likes | E07-F05 | 2 pts |
| 13 | Resend email integration | E08-F04 | 2 pts |

### POLISH — Ships with MVP

| # | Item | Epic | Est. |
|---|------|------|------|
| 14 | Wire sync queue to Supabase | E09-F03 | 3 pts |
| 15 | Action event analytics | E09-F06 | 1 pt |
| 16 | Unified streak system | E11-F01 | 2 pts |
| 17 | Performance profiling + optimization | E09-F10 | 3 pts |

### POST-LAUNCH — v1.1

| # | Item | Epic |
|---|------|------|
| 18 | Push notification certs + deep links | E09-F04 |
| 19 | Food hacking guides | E06-F03 |
| 20 | AI food photo recognition | E10-F01 |
| 21 | Apple Health / Google Fit sync | — |
| 22 | German localization | E13-F01 |

---

## Story Point Summary

| Epic | P0 Stories | P0 Points | Status |
|---|---|---|---|
| E01: Auth & Onboarding | 4 | 12 | ✅ |
| E02: Nutrition & Calories | 6 | 23 | ✅ |
| E03: Intermittent Fasting | 3 | 7 | ✅ |
| E04: Workout Tracking | 4 | 18 | ✅ |
| E05: Body & Progress | 3 | 11 | ✅ |
| E06: Science Content | 2 | 15 | ⚠️ 7 pts remaining |
| E07: Community | 5 | 28 | 🔲 20 pts remaining |
| E08: Email Capture | 4 | 5 | ⚠️ 4 pts remaining |
| E09: Platform | 9 | 32 | ⚠️ 16 pts remaining |
| **TOTAL** | **40 stories** | **~151 pts** | **~47 pts remaining to MVP** |
