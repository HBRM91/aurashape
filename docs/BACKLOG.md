# Aurashape — Full Product Backlog

*All epics, user stories, and acceptance criteria | Version 1.0 — July 2026*

---

## Priority Legend

| Tag | Meaning |
|---|---|
| P0 | Must ship in MVP. No launch without this. |
| P1 | Should ship. Defer only if blocked. |
| P2 | Nice to have. Phase 2+. |

---

## E01 — Authentication & Onboarding

### E01-F01: Email + Social Sign-Up | P0 | 3 pts

**As a** new user, **I want** to create an account with email, Google, or Apple **so that** I can use the app.

**AC:**
- Sign-up with email + password (min 8 chars, 1 number, 1 uppercase)
- Sign-up with Google OAuth
- Sign-in with Apple (iOS) / Google (Android)
- Login with existing credentials
- "Forgot password" → reset email via Resend
- Error messages: invalid email, weak password, existing account
- Session persistence (stay logged in)

---

### E01-F02: Privacy Consent Screen | P0 | 2 pts

**AC:**
- Shown BEFORE sign-up form
- Clear language: "We never see your meals. We never sell your data."
- Three checkboxes (all UNCHECKED by default):
  1. "I agree to the Privacy Policy and Terms of Service" (REQUIRED)
  2. "Optional: Send me weekly science tips via email" (OPTIONAL)
  3. "Optional: Anonymous usage data to improve the app" (OPTIONAL)
- Links to full Privacy Policy and ToS
- Consent timestamp recorded in user_consents table

---

### E01-F03: Onboarding Wizard | P0 | 5 pts

**AC:**
- Step 1 — Goal: Icon cards (Lose weight / Build muscle / Improve health / Maintain)
- Step 2 — Body: Sex, age (16-100), height (cm or ft/in), current weight, target weight
- Step 3 — Activity: 4 levels with PAL values and example personas
- Step 4 — Fasting: Optional plan (Skip / 14:10 / 16:8 / 18:6 / Custom)
- Step 5 — Summary: Calorie target + macro split + fasting plan. "Science-based" label.
- Step 6 — Newsletter: Optional email (pre-filled if email sign-up), Subscribe/Skip
- All calculations on-device (Mifflin-St Jeor equation)
- LOSE: TDEE - 500 | GAIN: TDEE + 300 | MAINTAIN: TDEE ± 0

---

### E01-F04: Profile & Settings | P0 | 2 pts

**AC:**
- View/edit avatar, display name, bio, goal summary
- Re-enter onboarding wizard to change goals → targets recalculate
- Toggle metric/imperial units
- Notification preferences per channel
- "Export My Data" → JSON download
- "Delete My Account" → confirmation → cascade delete → logout

---

## E02 — Nutrition & Calorie Tracking

### E02-F01: Food Diary — Meal Slots | P0 | 5 pts

**AC:**
- Date picker (swipe, calendar tap)
- Calorie progress bar: green <90%, yellow 90-100%, red >100%
- Macro progress bars: Protein (blue), Carbs (yellow), Fat (pink)
- 4 meal slots: Breakfast 🌅, Lunch ☀️, Dinner 🌙, Snacks 🍎
- Each slot: entries list + subtotal calories + "+" button
- Empty state illustration
- Add food: bottom sheet (Search / Scan / Photo)
- Swipe left → delete (with undo snackbar)
- Long-press slot → "Same as yesterday"

---

### E02-F02: Food Search & Database | P0 | 5 pts

**AC:**
- Autocomplete (2+ chars, 300ms debounce)
- Queries Open Food Facts API + local Supabase foods table
- Results: name, brand, calories/serving, serving size
- "Verified" badge on API entries, "Community" on user-submitted
- Tap → log detail (serving size + quantity multiplier 0.25x-2x)
- "Can't find it? Add manually" button
- Recent/frequent foods (last 20) above results
- Performance: <500ms p95

---

### E02-F03: Barcode Scanner | P0 | 5 pts

**AC:**
- Camera with barcode detection overlay (ML Kit on-device)
- Detection <1 second
- Query Open Food Facts by barcode
- Result: product name, image, macros, serving size
- "Log This" → pre-filled → add to slot
- "Not found" → "Add manually" + "Try photo"
- Manual barcode number entry fallback

---

### E02-F04: Custom Food Creator | P0 | 3 pts

**AC:**
- Form: name (req), brand, serving size+unit, calories/serving (req), protein, carbs, fat, fiber
- Saved to local DB + synced to Supabase
- Appears in "My Foods" search section
- Editable and deletable

---

### E02-F05: Macro Dashboard | P0 | 3 pts

**AC:**
- Donut chart: Protein (blue), Carbs (yellow), Fat (pink)
- Center: total calories consumed
- Per-macro grams eaten/target below
- Tap segment → highlight + show %
- Weekly average bar chart toggle

---

### E02-F06: Water & Habit Trackers | P0 | 2 pts

**AC:**
- Water tracker: circular ring, "+" = 250ml, long-press = custom
- Default target: 2000ml (configurable)
- Fruit counter: "🍎 1 / 3" (configurable)
- Vegetable counter: "🥬 3 / 5" (configurable)
- Visible on Home (primary) and Diary (secondary)
- Completion: ring pulses green
- Daily reset at midnight

---

## E03 — Intermittent Fasting

### E03-F01: Fasting Timer | P0 | 4 pts

**AC:**
- Prominent animated ring timer (purple=fasting, green=eating)
- "Start Fasting" button
- Shows: elapsed time, remaining time, current phase
- "End Fast Early" with confirmation
- Updates every 60 seconds (battery friendly)
- Home screen mini-timer card

---

### E03-F02: Fasting Plans | P0 | 2 pts

**AC:**
- Cards: 14:10 (Beginner), 16:8 (Recommended), 18:6 (Advanced), 20:4 (Warrior), 5:2, 6:1, Custom
- Each: visual timeline bar + difficulty label
- 16:8 pre-selected if onboarding choice
- Custom: pick fasting hours (4-48)
- Switching preserves history

---

### E03-F03: Fasting Notifications | P0 | 1 pt

**AC:**
- "Fast complete! Eating window open"
- "30 min until fasting starts"
- "1 hour left in eating window"
- All individually toggleable

---

### E03-F04: Fasting History | P1 | 3 pts

**AC:**
- Monthly calendar (green=complete, gray=incomplete)
- Tap day → duration, times
- Stats: current streak, longest streak, average duration, total hours/month

---

## E04 — Workout Tracking

### E04-F01: Exercise Library | P0 | 5 pts

**AC:**
- 100+ exercises (JSON + GIFs on Supabase Storage CDN)
- Filter: category + muscle group. Search by name.
- Card: name, muscle badge, difficulty dots, GIF thumbnail
- Detail: full GIF, written instructions, muscle diagram
- Offline-capable (cached on first open)

**Exercises pre-loaded:**
Bodyweight (35): Push-ups, Diamond Push-ups, Wide Push-ups, Decline Push-ups, Pike Push-ups, Pull-ups, Chin-ups, Squats, Jump Squats, Bulgarian Split Squats, Lunges, Walking Lunges, Jumping Lunges, Glute Bridges, Single-Leg Glute Bridges, Plank, Side Plank, Mountain Climbers, Burpees, Crunches, Bicycle Crunches, Leg Raises, Flutter Kicks, Russian Twists, Hollow Body Hold, Superman, Dips, Step-ups, Box Jumps, Wall Sit, Bear Crawl, Inchworms, High Knees, Butt Kicks, Jumping Jacks

Dumbbell (25): DB Bench Press, DB Flyes, DB Shoulder Press, DB Lateral Raises, DB Front Raises, DB Rows, DB Bicep Curls, Hammer Curls, DB Tricep Extensions, DB Kickbacks, Goblet Squats, DB Lunges, DB Deadlifts, DB RDLs, DB Thrusters, DB Snatch, DB Clean, DB Renegade Rows, DB Pullovers, DB Shrugs, DB Calf Raises, DB Step-ups, DB Russian Twists, DB Woodchoppers, DB Farmer's Walk

Barbell (15): BB Squat, BB Deadlift, BB Bench Press, BB OHP, BB Row, BB Hip Thrust, BB Lunge, BB RDL, BB Front Squat, BB Good Morning, BB Bicep Curl, BB Skull Crusher, BB Calf Raise, BB Shrug, BB Clean & Press

Cardio (15): Running, Cycling, Jump Rope, Rowing, Elliptical, Stair Climber, Swimming, Walking, Sprint Intervals, Battle Ropes, Kettlebell Swings, Box Jumps, Burpees, Mountain Climbers, Shadow Boxing

Stretching (10): Hamstring, Quad, Hip Flexor, Cat-Cow, Child's Pose, Downward Dog, Cobra, Shoulder, Tricep, Butterfly

---

### E04-F02: Workout Logger | P0 | 8 pts

**AC:**
- "Start Workout" → "Quick Log" or "From Template"
- Add exercises from library
- Per exercise: set counter, weight (kg/lbs), reps, "+" set, swipe delete set
- "Last time: 40kg × 10" shown below current exercise
- Auto-start timer, elapsed time shown, pause/resume
- Total volume shown: Σ(sets × reps × weight)
- "Finish" → summary screen. "Cancel" → confirmation.

---

### E04-F03: Workout History & PRs | P0 | 3 pts

**AC:**
- List: date, duration, exercises, volume
- Tap → full detail with sets/reps/weight
- PR badge in logger: "🔥 PR: 60kg × 8"
- Weight trend chart per exercise

---

### E04-F04: Post-Workout Summary | P0 | 2 pts

**AC:**
- Duration, calories (MET calc), exercises, volume
- PR celebration: confetti + card
- Motivational quote (rotating 20 science-backed)
- Science tip: "Protein within 2h of training increases MPS by 50%"
- "Share Workout" → card image → native share (Aurashape watermark)

---

## E05 — Body & Progress

### E05-F01: Weight Logger & Chart | P0 | 3 pts

**AC:**
- Number pad input, pre-filled with last entry
- Trend line chart (7d/30d/90d/1y)
- Goal line: dashed horizontal at target
- Progress: "40% to goal!"
- Estimated date: "At this rate, by October 2026"
- Editable entries

---

### E05-F02: Body Measurements | P0 | 3 pts

**AC:**
- Form: neck, shoulders, chest, waist, hips, arms, thighs, calves, body fat %
- Visual body diagram (tap point → measure)
- History chart per body part
- BMI auto-calculated
- "Total cm lost"

---

### E05-F03: Progress Photos | P0 | 5 pts

**AC:**
- Camera with body outline overlay
- Three poses: Front, Side, Back (sequential)
- Preview with Retake/Looks Good
- Gallery: grid by date, filter by pose
- Comparison: two dates → side-by-side + slider overlay
- "Share" → image → native share (Aurashape watermark)
- Private bucket, RLS-protected
- Clear privacy notice

---

## E06 — Science Content Engine

### E06-F01: Daily Health Hack Tip | P0 | 3 pts

**AC:**
- Home screen card: "Today's Science"
- Tip title + 2-3 sentence explanation + source
- Category badge: #FoodHack / #HealthHack / #FastingScience
- "The Science" expandable: study, authors, journal, year, summary
- Reactions: 👍 💬 🔄
- Comment section on tips
- Archive by category
- 90 tips pre-loaded (3 months, offline)

---

### E06-F02: Deep-Dive Articles | P0 | 5 pts

**AC:**
- "Learn" section with article list
- Article detail: Markdown renderer, headings, images, "The Science" boxes
- Stored in Supabase (update without release)
- Bookmark, share, comment
- 4 articles at launch, new every Sunday

---

### E06-F03: Food Hacking Guides | P1 | 3 pts

**AC:**
- Visual card guides: infographic style, scannable
- Topics: Satiating Plate, Glycemic Index, Macros, Protein for Vegans
- Shareable as images

---

## E07 — Community Features

### E07-F01: User Profiles | P0 | 3 pts

**AC:**
- Avatar, username, bio, goal, member since
- Stats (optional): streak, workouts/month, goal % (not absolute)
- Privacy: "Show to: Everyone / Community / Nobody"
- "Show weight: Goal % only / No"
- "Show workouts: Yes / No"
- Defaults: Community-only, weight hidden

---

### E07-F02: Weekly Challenges | P0 | 5 pts

**AC:**
- Tab: Active / Upcoming / Past
- Card: name, description, rules, duration, participants, "Join"
- Types: "7-Day Tracking", "5-Day Fasting", "Workout 4x", "Protein Crusher"
- Personal progress + community average
- Leaderboard (completion %)
- Completion badge on profile
- Push: "Weekend challenge starts tomorrow!"

---

### E07-F03: Recipe Sharing | P0 | 5 pts

**AC:**
- Submit: name, description, photo, ingredients (DB-linked), instructions, prep/cook time, servings
- Macros auto-calculated
- Tags: meal type, diet
- Feed: grid (photo, name, creator, macros, likes)
- "Log This Recipe" → all ingredients → diary
- Like, comment, save, share
- "Top Recipes This Week"

---

### E07-F04: Discussion Forum | P0 | 5 pts

**AC:**
- Categories: Fasting, Workouts, Nutrition, Progress, Off-Topic
- Create thread: title, body (Markdown), category, optional photo
- List: title, preview, category, replies, time
- Thread: OP + nested replies (max 3 levels)
- Upvote/downvote, sort: Newest/Most Upvoted
- Report → moderation queue
- Community guidelines pinned

---

### E07-F05: Tip & Article Comments | P0 | 2 pts

**AC:**
- Comments on every tip and article
- Nested replies (3 levels)
- Like button
- Team badge on official replies
- Push: "Someone replied"

---

## E08 — Email & Newsletter

### E08-F01: Onboarding Opt-In | P0 | 1 pt
- Final step: "Get weekly science tips" + email + Subscribe/Skip

### E08-F02: Settings Management | P0 | 1 pt
- Toggle newsletter on/off, unsubscribe, GDPR-compliant

### E08-F03: Newsletter Content | P0 | N/A
- Every Friday. Sections: Science Bite, Community Spotlight, What's New

### E08-F04: Resend Integration | P0 | 2 pts
- Welcome email, newsletter template, unsubscribe webhook, consent logged

---

## E09 — Platform

### E09-F01: App Shell & Navigation | P0 | 3 pts
- Bottom tabs: Home / Diary / Fasting / Workout / Community / Profile
- Expo Router, iOS + Android native tab styles

### E09-F02: Supabase Setup | P0 | 3 pts
- Project (EU/Frankfurt). Auth (email/Google/Apple). Full schema + RLS. Storage buckets.

### E09-F03: Offline-First | P0 | 8 pts
- WatermelonDB local. Writes → local → sync queue → Supabase. Last-write-wins. Sync badge.

### E09-F04: Push Notifications | P0 | 3 pts
- Expo Push + FCM. Channels: Fasting, Challenges, Community, Weekly. Toggle per. Deep-link.

### E09-F05: Dark Mode | P0 | 2 pts
- System detection + manual toggle. All screens. NativeWind tokens.

### E09-F06: Analytics | P0 | 2 pts
- PostHog (EU). Anonymous events only. No PII. Dashboard for Person A.

### E09-F07: Crash Reporting | P0 | 1 pt
- Sentry. Source maps. Alerts to Person B.

### E09-F08: App Store Submission | P0 | 5 pts
- App Store Connect + Play Console. Icon, splash, screenshots. ASO metadata. No medical claims.

### E09-F09: GDPR Compliance | P0 | 3 pts
- Privacy Policy + ToS. Consent audit. Data export. Account deletion. Supabase DPA. RoPA doc.

---

## E10 — AI Coach (Phase 1)

### E10-F01: AI Food Photo | P1 | 8 pts
### E10-F02: Weekly AI Summary | P1 | 5 pts
### E10-F03: AI Chat Coach | P1 | 8 pts

*Deferred to post-launch.*

---

## E11 — Gamification (Phase 1)

### E11-F01: Streaks System | P1 | 3 pts
### E11-F02: Achievements & Badges | P1 | 5 pts

*Deferred to post-launch.*

---

## E12 — Meal Plans & Recipes (Phase 2)

### E12-F01: Curated Recipe Library | P2 | 8 pts
### E12-F02: Meal Plan Generator | P2 | 8 pts
### E12-F03: Shopping List | P2 | 5 pts

---

## E13 — i18n (Phase 2)

### E13-F01: German Localization | P2 | 8 pts
### E13-F02: French Localization | P2 | 8 pts
### E13-F03: Italian Localization | P2 | 8 pts

---

## MVP Story Point Summary

| Epic | P0 Stories | P0 Points |
|---|---|---|
| E01: Auth & Onboarding | 4 | 12 |
| E02: Nutrition & Calories | 6 | 23 |
| E03: Intermittent Fasting | 3 | 7 |
| E04: Workout Tracking | 4 | 18 |
| E05: Body & Progress | 3 | 11 |
| E06: Science Content | 2 | 8 |
| E07: Community | 5 | 20 |
| E08: Email Capture | 4 | 4 |
| E09: Platform | 9 | 30 |
| **TOTAL** | **40 stories** | **~133 pts** |
