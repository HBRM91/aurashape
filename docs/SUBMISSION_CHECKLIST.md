# Aurashape — App Store Submission Checklist

*Updated August 2, 2026 | Target launch: September 1, 2026*

---

## Pre-Submission: Accounts

| # | Item | Status | Owner |
|---|------|--------|-------|
| 1 | Apple Developer Program ($99/year) | 🔲 | Person A |
| 2 | Google Play Console ($25 one-time) | 🔲 | Person A |
| 3 | Domain: aurashape.app registered | 🔲 | Person A |

---

## Pre-Submission: Legal

| # | Item | Status | Notes |
|---|------|--------|-------|
| 4 | Privacy Policy hosted at public URL | 🔲 | Use Supabase static hosting or GitHub Pages |
| 5 | Terms of Service hosted at public URL | 🔲 | Same as above |
| 6 | Supabase DPA signed | 🔲 | Available in Supabase dashboard > Organization > Legal |
| 7 | RoPA document updated | 🔲 | `docs/legal/ROPA.md` |
| 8 | Apple Privacy Nutrition Labels filled | 🔲 | In App Store Connect > App Privacy |

---

## Pre-Submission: Database

| # | Item | Status | Notes |
|---|------|--------|-------|
| 9 | Run migration `supabase/migrations/001_schema.sql` | 🔲 | In Supabase SQL Editor |
| 10 | Verify RLS policies active | 🔲 | Check each table in dashboard > Authentication > Policies |
| 11 | Verify storage buckets created | 🔲 | Check in dashboard > Storage |
| 12 | Configure Auth providers: Google, Apple | 🔲 | Dashboard > Authentication > Providers |
| 13 | Set up redirect URLs for OAuth | 🔲 | Same as above |

---

## Pre-Submission: Design

| # | Item | Status | Notes |
|---|------|--------|-------|
| 14 | App icon 1024×1024 (App Store) | ✅ | `assets/images/icon.png` |
| 15 | App icon 512×512 (Play Store) | ✅ | Same file |
| 16 | Splash screen | ✅ | `assets/images/splash-icon.png` |
| 17 | Adaptive icon (Android) | ✅ | `assets/images/android-icon-*.png` |
| 18 | Feature graphic (Play Store, 1024×500) | 🔲 | Required for Play Store listing |

---

## Pre-Submission: Store Assets

| # | Item | Status | Notes |
|---|------|--------|-------|
| 19 | iPhone 6.7" screenshots (≥3) | 🔲 | 1290×2796px |
| 20 | iPhone 6.5" screenshots (≥3) | 🔲 | 1242×2688px |
| 21 | iPhone 5.5" screenshots (≥3) | 🔲 | 1242×2208px |
| 22 | iPad 12.9" screenshots (optional) | 🔲 | 2048×2732px |
| 23 | Play Store phone screenshots (≥2) | 🔲 | Min 320px, max 3840px |
| 24 | Play Store 7" tablet screenshots (optional) | 🔲 | |
| 25 | Play Store 10" tablet screenshots (optional) | 🔲 | |

### Screenshot Suggestions (6 screenshots total)

1. **Home Dashboard** — Macro donut, water tracker, daily tip. Shows the full overview.
2. **Food Diary** — Meal slots with entries, calorie progress bar. Shows tracking in action.
3. **Fasting Timer** — Animated ring with elapsed/remaining time. Shows the fasting UI.
4. **Workout Logger** — Exercise list with sets/reps/weight. Shows active workout.
5. **Progress** — Weight chart with trend line. Shows data visualization.
6. **Community** — Forum threads or recipe feed. Shows social features.

---

## Pre-Submission: Store Metadata

| # | Item | Status | Notes |
|---|------|--------|-------|
| 26 | App name: "Aurashape — Food Tracker, Fasting & Workout Log" | ✅ | In app.json |
| 27 | Bundle ID: app.aurashape | ✅ | iOS + Android configured |
| 28 | Version: 1.0.0, Build: 1 | ✅ | In app.json |
| 29 | Category: Health & Fitness | 🔲 | Primary category |
| 30 | Secondary category: Food & Drink | 🔲 | Optional |
| 31 | Age rating: 12+ (fitness tracking, no medical claims) | 🔲 | |
| 32 | App Store description (long) | ✅ | `docs/aso/APP_STORE_CONTENT.md` |
| 33 | App Store subtitle (170 chars) | ✅ | Same file |
| 34 | App Store keywords (100 chars) | ✅ | Same file |
| 35 | Play Store short description (80 chars) | ✅ | Same file |
| 36 | Play Store full description | ✅ | Same file |

---

## Pre-Submission: Build

| # | Item | Status | Notes |
|---|------|--------|-------|
| 37 | `eas build --platform ios --profile production` | 🔲 | Requires Apple Developer account |
| 38 | `eas build --platform android --profile production` | 🔲 | Requires keystore |
| 39 | `eas submit --platform ios` | 🔲 | After build succeeds |
| 40 | `eas submit --platform android` | 🔲 | After build succeeds |
| 41 | Sentry source maps uploaded | 🔲 | During EAS build with sentry plugin |

---

## Pre-Submission: Quality

| # | Item | Status | Notes |
|---|------|--------|-------|
| 42 | Test on physical iPhone | 🔲 | |
| 43 | Test on physical Android | 🔲 | |
| 44 | Test barcode scanner | 🔲 | |
| 45 | Test camera (progress photos) | 🔲 | |
| 46 | Test push notifications | 🔲 | Requires APNs/FCM certs |
| 47 | Test deep links | 🔲 | aurashape:// scheme |
| 48 | Test dark mode | 🔲 | Toggle between system/light/dark |
| 49 | Test offline mode | 🔲 | Airplane mode, verify data persists |
| 50 | Test account deletion | 🔲 | Delete account → cascade → logout |
| 51 | No medical claims in copy | ✅ | Verified in all screens and descriptions |

---

## Post-Submission

| # | Item | Status | Notes |
|---|------|--------|-------|
| 52 | Apple Review response (1-3 days) | ⏳ | |
| 53 | Google Review response (1-7 days) | ⏳ | |
| 54 | Monitor Sentry for crashes | ⏳ | |
| 55 | Monitor PostHog for analytics | ⏳ | |
| 56 | Seed community with content | ⏳ | First 50 users |

---

## Quick Reference: Build Commands

```bash
# iOS production build
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Build both + submit
eas build --platform all --profile production --auto-submit
```

---

## Notes

- **Apple Developer approval can take 2-7 days.** Start account registration immediately.
- **Google Play Console is instant** after paying the $25 fee.
- **App Review typically takes 24-48 hours** for both stores.
- **The SQL migration must be run before the first user signs up** so the `on_auth_user_created` trigger creates their profile.
- **Google and Apple OAuth** must be configured in Supabase > Authentication > Providers before enabling in the app.
- **No medical claims.** The app provides "health and fitness tracking" and "educational science content" only.
