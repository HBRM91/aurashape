# Aurashape — Legal & Compliance Documents

This directory contains all legal and compliance documents required for GDPR and App Store/Play Store submission.

## 1. Privacy Policy

*Last updated: August 2026*

### Who we are

Aurashape ("we", "our", "us") is a free health companion app operated from the European Union. Our data processing is hosted entirely on EU-based infrastructure (Frankfurt, Germany).

Contact: privacy@aurashape.app

### What data we collect

**Account data**: Email address (for authentication), OAuth provider ID (Google/Apple sign-in), display name.

**Health data (optional, user-provided)**: Goal preferences (lose weight, build muscle, maintain, improve health), biological sex, date of birth, height, weight, activity level, dietary preference, fasting plan, food diary entries, workout logs, body measurements, progress photos.

**Usage data (optional, opt-in)**: Anonymous usage analytics via PostHog (EU-hosted). No personally identifiable information is included in analytics.

**Device data**: Push notification token (if enabled), crash reports via Sentry.

### What we do NOT collect

- We do NOT track your location
- We do NOT access your contacts, calendar, messages, or other apps
- We do NOT sell your data to anyone. Ever.
- We do NOT use your data for advertising
- We do NOT share your health data with third parties
- We do NOT even see your meals — all food logging is processed on-device first

### Legal basis for processing

- **Consent** (Art. 6(1)(a) GDPR): Newsletter subscription, analytics opt-in, push notifications
- **Performance of a contract** (Art. 6(1)(b) GDPR): Providing the health tracking service you requested
- **Legitimate interest** (Art. 6(1)(f) GDPR): Crash reporting for app stability, basic account security

### Data storage

All data is stored on Supabase (PostgreSQL) hosted in the EU (eu-central-1, Frankfurt) and encrypted at rest and in transit. Progress photos are stored in Supabase Storage with Row-Level Security (RLS) — only you can access your photos.

### Data retention

- Active account: Data retained while account exists
- Deleted account: All data permanently deleted within 30 days (cascade delete)
- Newsletter: Unsubscribed immediately on request
- Crash reports: Retained for 90 days

### Your rights (GDPR)

You have the right to:
1. **Access** your data — available in-app via "Export My Data" (JSON format)
2. **Rectify** your data — edit any profile field in Settings
3. **Delete** your data — "Delete Account" permanently removes all data
4. **Port** your data — JSON export includes all profile, diary, fasting, and workout data
5. **Withdraw consent** — toggle off analytics/newsletter/push notifications anytime
6. **Object** to processing — contact privacy@aurashape.app

### Third-party services

| Service | Purpose | Data Shared | EU-hosted |
|---|---|---|---|
| Supabase | Database, Auth, Storage | All account/health data | Yes (Frankfurt) |
| PostHog | Analytics (opt-in) | Anonymous events only | Yes (EU) |
| Sentry | Crash reporting | Stack traces, device info | Yes |
| Resend | Transactional email | Email address | Yes |
| Open Food Facts | Food database lookup | Search queries (anonymized) | France |

### Cookies & tracking

We do not use cookies. Analytics is opt-in and anonymous. No cross-app tracking. No advertising SDKs.

### Children

Aurashape is not intended for users under 16. We do not knowingly collect data from children.

### Changes to this policy

We will notify you of material changes via in-app notice. Continued use after changes constitutes acceptance.

### Contact

- Email: privacy@aurashape.app
- EU Representative: privacy@aurashape.app
- Supervisory authority: You have the right to lodge a complaint with your local data protection authority.
