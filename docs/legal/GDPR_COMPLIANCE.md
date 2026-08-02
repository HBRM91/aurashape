# GDPR Compliance Summary

*Aurashape | August 2026 | EU-based (Frankfurt)*

## Compliance Status

| Requirement | Status | Evidence |
|---|---|---|
| Lawful basis for processing | Done | See RoPA §2 — contract + consent |
| Privacy Policy (Art. 13-14) | Done | `docs/legal/PRIVACY_POLICY.md` |
| Terms of Service | Done | `docs/legal/TERMS_OF_SERVICE.md` |
| Data Processing Agreement (Art. 28) | Done | `docs/legal/DPA.md` |
| Record of Processing (Art. 30) | Done | `docs/legal/ROPA.md` |
| Consent management (Art. 7) | Done | Privacy consent screen + `user_consents` table |
| Data portability (Art. 20) | Done | "Export My Data" → JSON download |
| Right to erasure (Art. 17) | Done | "Delete Account" → cascade delete |
| Privacy by design (Art. 25) | Done | On-device processing, RLS, encryption |
| Data breach notification (Art. 33-34) | Done | DPA §6 — Supabase notifies within 72h |
| Data residency (EU) | Done | Supabase eu-central-1 (Frankfurt) |
| Data Protection Officer | Not required | < 250 employees, no large-scale special categories |
| DPIA (Art. 35) | Not required | No high-risk processing identified |
| EU Representative | Not required | Aurashape is EU-based |

## Technical Measures

| Measure | Implementation |
|---|---|
| Encryption at rest | AES-256 (Supabase PostgreSQL) |
| Encryption in transit | TLS 1.3 |
| Access control | Row-Level Security (RLS) per user |
| Authentication | Supabase Auth (JWT, role separation) |
| On-device processing | Mifflin-St Jeor BMR calculation runs locally |
| Data minimization | Only essential fields collected |
| Pseudonymization | User ID is UUID, not email in analytics |
| Backup | Daily automated backups (Supabase) |
| Audit logging | `user_consents` table with timestamps |

## Consent Flow

```
User visits app
  → Privacy consent screen (3 checkboxes, unchecked by default)
    → Required: Privacy Policy + ToS
    → Optional: Newsletter
    → Optional: Anonymous analytics
  → Consent recorded in user_consents table (timestamp, IP, consent type)
  → User proceeds to sign-up
```

## Data Subject Rights Implementation

| Right | Implementation |
|---|---|
| Access | Profile screen shows all stored data |
| Rectification | Edit Profile, re-run onboarding |
| Erasure | Settings → Delete Account → cascade delete |
| Portability | Settings → Export My Data → JSON |
| Withdraw consent | Settings → toggle notifications/newsletter/analytics |
| Restrict processing | Not applicable (minimal processing) |

## Third-Party Audits

| Provider | Certification |
|---|---|
| Supabase | SOC 2 Type II, ISO 27001 |
| PostHog | SOC 2 Type II (EU cloud) |
| Sentry | SOC 2 Type II, ISO 27001 |
| Resend | SOC 2 (in progress) |

## Data Flow Diagram

```
User Device
  ├── On-device: BMR calculation, local state (Zustand)
  ├── TLS → Supabase Auth (email/OAuth)
  ├── TLS → Supabase PostgreSQL (profiles, diary, workouts, fasting, body_logs, etc.)
  ├── TLS → Supabase Storage (progress_photos, avatars — private buckets, RLS)
  ├── TLS → Open Food Facts API (anonymized search queries)
  ├── TLS → Expo Push Service (push token)
  ├── TLS → PostHog (anonymous events, EU-hosted, opt-in)
  ├── TLS → Sentry (crash reports, minimal data)
  └── TLS → Resend (email, opt-in newsletter)
```

*All traffic is TLS-encrypted. All persistent data storage is in the EU (Frankfurt).*
