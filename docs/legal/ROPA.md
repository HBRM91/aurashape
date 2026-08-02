# Record of Processing Activities (RoPA)

*Article 30 GDPR | Aurashape | August 2026*

## Processing Activity 1: User Account Management

| Field | Detail |
|---|---|
| **Purpose** | Create and manage user accounts, authenticate users |
| **Legal basis** | Performance of contract (Art. 6(1)(b)) |
| **Data categories** | Email, display name, OAuth provider ID, password hash |
| **Data subjects** | App users |
| **Recipients** | Supabase (Auth service, EU-hosted) |
| **Retention** | Duration of account + 30 days after deletion |
| **Safeguards** | Encryption at rest (AES-256), TLS 1.3 in transit, bcrypt password hashing |

## Processing Activity 2: Health Profile & Tracking

| Field | Detail |
|---|---|
| **Purpose** | Calculate calorie/macro targets, provide food/fasting/workout tracking |
| **Legal basis** | Performance of contract (Art. 6(1)(b)) |
| **Data categories** | Sex, date of birth, height, weight, activity level, dietary preference, fasting plan, food diary entries, workout logs, body measurements |
| **Data subjects** | App users |
| **Recipients** | Supabase (PostgreSQL, EU-hosted) |
| **Retention** | Duration of account + 30 days after deletion |
| **Safeguards** | RLS policies (user-isolated), on-device processing where possible |

## Processing Activity 3: Progress Photos

| Field | Detail |
|---|---|
| **Purpose** | Visual progress tracking (before/after comparison) |
| **Legal basis** | Performance of contract (Art. 6(1)(b)) |
| **Data categories** | Photographs (front, side, back poses) |
| **Data subjects** | App users (opt-in) |
| **Recipients** | Supabase Storage (private bucket, EU-hosted) |
| **Retention** | Duration of account + 30 days after deletion |
| **Safeguards** | RLS-protected private bucket, no public access, encryption at rest |

## Processing Activity 4: Food Database Lookups

| Field | Detail |
|---|---|
| **Purpose** | Search food nutritional information |
| **Legal basis** | Performance of contract (Art. 6(1)(b)) |
| **Data categories** | Search queries (anonymized, no user ID attached) |
| **Data subjects** | App users |
| **Recipients** | Open Food Facts API (France) |
| **Retention** | Not retained by Aurashape; Open Food Facts retention per their policy |
| **Safeguards** | No user-identifying data sent with queries |

## Processing Activity 5: Anonymous Analytics (Opt-in)

| Field | Detail |
|---|---|
| **Purpose** | Understand app usage patterns, improve user experience |
| **Legal basis** | Consent (Art. 6(1)(a)) |
| **Data categories** | Screen views, feature usage events (anonymous, no PII) |
| **Data subjects** | App users who opt-in |
| **Recipients** | PostHog (EU-hosted) |
| **Retention** | Per PostHog retention policy; opt-out stops collection |
| **Safeguards** | No PII, configurable opt-out, EU hosting |

## Processing Activity 6: Crash Reporting

| Field | Detail |
|---|---|
| **Purpose** | Identify and fix app crashes |
| **Legal basis** | Legitimate interest (Art. 6(1)(f)) |
| **Data categories** | Stack traces, device model, OS version, app version |
| **Data subjects** | App users |
| **Recipients** | Sentry |
| **Retention** | 90 days |
| **Safeguards** | Source maps, no user content included, minimal data collection |

## Processing Activity 7: Push Notifications (Opt-in)

| Field | Detail |
|---|---|
| **Purpose** | Send fasting reminders, challenge updates, weekly tips |
| **Legal basis** | Consent (Art. 6(1)(a)) |
| **Data categories** | Expo push token |
| **Data subjects** | App users who enable notifications |
| **Recipients** | Expo Push Service, FCM (Android) / APNs (iOS) |
| **Retention** | Until user disables notifications or deletes account |
| **Safeguards** | Per-channel opt-out, no message content stored server-side |

## Processing Activity 8: Newsletter (Opt-in)

| Field | Detail |
|---|---|
| **Purpose** | Send weekly science-based health tips via email |
| **Legal basis** | Consent (Art. 6(1)(a)) |
| **Data categories** | Email address |
| **Data subjects** | App users who opt-in |
| **Recipients** | Resend (email delivery, EU) |
| **Retention** | Until unsubscribe or account deletion |
| **Safeguards** | Unsubscribe link in every email, instant opt-out |

## Processing Activity 9: Community Features

| Field | Detail |
|---|---|
| **Purpose** | Forum discussions, recipe sharing, challenges |
| **Legal basis** | Performance of contract (Art. 6(1)(b)) |
| **Data categories** | Username, posts, recipes, challenge participation |
| **Data subjects** | App users (opt-in to participate) |
| **Recipients** | Supabase (PostgreSQL, EU-hosted) |
| **Retention** | Duration of account + 30 days after deletion |
| **Safeguards** | Community guidelines, content moderation, RLS |

---

## Controller Details

| Field | Detail |
|---|---|
| **Organization** | Aurashape |
| **Contact** | privacy@aurashape.app |
| **Jurisdiction** | European Union |

---

*This RoPA is reviewed quarterly and updated as processing activities change.*
