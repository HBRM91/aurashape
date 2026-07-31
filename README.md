# Aurashape

**Free, privacy-first health companion.** Food tracking, intermittent fasting, workout logging, and science-based health hacks — built to grow a community of health-conscious people who will become the first customers of Aurabiosens.

> 3-person startup | Community-first | Science-backed | GDPR-native | 0 EUR infra cost

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 52+, managed workflow) |
| Language | TypeScript (strict) |
| Navigation | Expo Router v4 |
| State | Zustand |
| Local DB | WatermelonDB (offline-first sync) |
| Backend | Supabase (Auth, PostgreSQL, Storage, RLS) |
| Food API | Open Food Facts (free REST API) |
| Push | Expo Push / FCM |
| Analytics | PostHog (privacy-first) |
| Crash | Sentry |
| Email | Resend |
| Styling | NativeWind (Tailwind) |
| Charts | Victory Native |
| CI/CD | EAS Build + EAS Submit |

## Getting Started

```bash
npm install
npx expo start
```

## Project Structure

```
aurashape/
├── app/                  # Expo Router screens
│   ├── (tabs)/           # Tab-based screens
│   ├── onboarding/       # Onboarding flow
│   └── _layout.tsx       # Root layout
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand stores
│   ├── db/               # WatermelonDB models + sync
│   ├── lib/              # Utilities (supabase, api)
│   ├── constants/        # Design tokens, config
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # DB migration files
├── assets/               # Images, fonts, GIFs
├── docs/                 # Roadmap, backlog, sprint plans
├── app.json              # Expo config
└── package.json
```

## Documentation

| File | Content |
|---|---|
| [docs/ROADMAP.md](docs/ROADMAP.md) | 12-month product roadmap |
| [docs/BACKLOG.md](docs/BACKLOG.md) | Full user story backlog with acceptance criteria |
| [docs/SPRINT-0.md](docs/SPRINT-0.md) | Current Sprint 0 task list |

## Sprint 0 (Current)

Setting up: Expo scaffold, Supabase DB, Auth flow, Privacy consent, Onboarding wizard. See [SPRINT-0.md](docs/SPRINT-0.md).

## Privacy

Built GDPR-first from Day 1. On-device processing. Encrypted storage. No data selling. EU-hosted (Supabase Frankfurt). Full privacy consent before signup.
