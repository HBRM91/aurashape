# Sprint 0 — Foundation

*Start: August 1, 2026 | Target End: August 7, 2026*

## Sprint Goal

Set up the development environment, database schema, authentication flow, privacy consent, onboarding wizard, and initial content pipeline so Sprint 1 can begin building core features immediately.

---

## Tasks by Role

### Person B — Developer

| # | Task | Est. | Status |
|---|---|---|---|
| B1 | Scaffold Expo project (`create-expo-app aurashape --template tabs`) | 1h | ✅ |
| B2 | Install core dependencies (NativeWind, Zustand, WatermelonDB, Supabase JS, Victory Native, Sentry, PostHog, phosphor-icons) | 2h | ✅ |
| B3 | Configure TypeScript strict mode + path aliases | 1h | ✅ |
| B4 | Set up Supabase project (EU region: Frankfurt) | 1h | 🔲 |
| B5 | Write full database schema migration (all tables + RLS + storage buckets) | 4h | ✅ |
| B6 | Configure Row-Level Security policies for all tables | 2h | ✅ (in migration) |
| B7 | Supabase Auth integration: email/password, Google OAuth, Apple OAuth | 3h | 🔲 |
| B8 | Auth screens: Sign Up, Login, Forgot Password | 4h | 🔲 |
| B9 | Privacy consent screen (before signup, 3 checkboxes, links to policy) | 2h | 🔲 |
| B10 | Onboarding wizard (6 steps: goal, body info, activity, fasting, plan summary, newsletter) | 6h | 🔲 |
| B11 | On-device calorie/macro calculator (Mifflin-St Jeor, all goal combos) | 2h | 🔲 |
| B12 | Profile + Settings screen (edit profile, units, notification prefs, data export, account deletion) | 4h | 🔲 |
| B13 | Bottom tab navigation shell (Home, Diary, Fasting, Workout, Community, Profile) | 2h | 🔲 |
| B14 | Configure EAS Build (eas.json: development, preview, production) | 1h | 🔲 |
| B15 | Set up environment variables (.env, app.config.ts) | 1h | 🔲 |
| B16 | Initialize Git repo + initial commit | 0.5h | 🔲 |
| B17 | CI/CD: GitHub Actions test workflow | 1h | 🔲 |

### Person A — Product / Strategy / Legal

| # | Task | Est. | Status |
|---|---|---|---|
| A1 | Register Apple Developer Program account ($99/year) | 2h | 🔲 |
| A2 | Register Google Play Console account ($25 one-time) | 1h | 🔲 |
| A3 | Draft Privacy Policy (GDPR-compliant, EU focus) | 4h | 🔲 |
| A4 | Draft Terms of Service | 3h | 🔲 |
| A5 | Create Data Processing Agreement (DPA) document | 1h | 🔲 |
| A6 | Create Record of Processing Activities document | 2h | 🔲 |
| A7 | Write ASO keyword research doc (target keywords for App Store + Play Store) | 2h | 🔲 |
| A8 | Define success metrics baseline (DAU, retention, funnel targets) | 1h | 🔲 |
| A9 | Set up PostHog account + create dashboard for Sprint 0 KPIs | 1h | 🔲 |
| A10 | Register domain: aurashape.app | 1h | 🔲 |

### Person C — Marketing / Content / Design

| # | Task | Est. | Status |
|---|---|---|---|
| C1 | Create Figma design file: color tokens, typography scale, spacing system | 3h | 🔲 |
| C2 | Design component library: buttons, inputs, cards, modals, tabs | 4h | 🔲 |
| C3 | Design app icon (1024×1024) | 4h | 🔲 |
| C4 | Design splash screen | 2h | 🔲 |
| C5 | Write 30 daily health hack tips (Food Hacking category) | 6h | 🔲 |
| C6 | Write 1 deep-dive article: "Why Calories In/Calories Out Is Only Half the Story" | 4h | 🔲 |
| C7 | Write 1 deep-dive article: "Intermittent Fasting: What 20 Years of Research Actually Shows" | 4h | 🔲 |
| C8 | Create Instagram account + profile design + first 3 posts | 2h | 🔲 |
| C9 | Create TikTok account + first 2 video scripts | 2h | 🔲 |
| C10 | Create Twitter/X account + bio + pinned tweet | 1h | 🔲 |
| C11 | Write app store description (short + long) for both stores | 2h | 🔲 |
| C12 | Write onboarding copy (all 6 steps + privacy consent) | 2h | 🔲 |

---

## Sprint 0 Exit Criteria

- [x] Expo app runs on iOS simulator and Android emulator
- [ ] Supabase project live with full schema + RLS
- [ ] Auth flow works end-to-end (sign up → privacy consent → onboarding → home)
- [ ] Onboarding wizard calculates correct calorie/macro targets for all goal combinations
- [ ] Profile + settings screen functional
- [ ] Tab navigation works across all 6 tabs
- [ ] 30 daily tips written (Person C)
- [ ] 2 articles written (Person C)
- [ ] Privacy Policy + ToS drafted (Person A)
- [ ] App icon + splash screen designed (Person C)
- [ ] App Store + Play Store accounts registered (Person A)
- [ ] Git repo initialized with initial commit
- [ ] EAS Build configured
- [ ] CI/CD pipeline working

---

## Daily Standup Schedule

| Day | Time | Duration |
|---|---|---|
| Monday | 10:00 CET | 15 min async (Slack) |
| Tuesday | 10:00 CET | 15 min async (Slack) |
| Wednesday | 10:00 CET | 15 min async (Slack) |
| Thursday | 10:00 CET | 15 min async (Slack) |
| Friday | 10:00 CET | 30 min sync (video) — sprint review |

---

## Notes

- This is an aggressive sprint for 3 people. Cut scope, not quality.
- "Done" means tested on at least one physical device.
- Person B: prefer Expo managed workflow. Avoid ejecting.
- Person A: Apple Developer approval can take 2-7 days. Start immediately.
- Person C: tips don't need to be perfect. Ship 30, improve later.
- All three: no gold-plating. "Good enough to learn from" > "Perfect but never shipped."
