# Aurashape Final Release Roadmap

Updated 2026-08-08. This roadmap supersedes the outdated Phase 0/1 status labels in `docs/ROADMAP.md` for web release planning.

## Product Goal

Ship a trustworthy, responsive, privacy-first Aurashape web app where a new user can consent, onboard, log food accurately, use every eligible health feature, recover from errors, and complete core journeys on desktop and mobile.

## Current Baseline

- Web production preview is live at `https://3e11b0cd.aurashape.pages.dev`.
- `npm run check`: 51 suites, 393 tests passing.
- Local and live Playwright: 28 tests passing at desktop and mobile widths.
- Static export: 33 routes with 16 route/content assertions.
- Phase 0-1 critical flows are implemented.
- Phase 2-3 core web screens are implemented: Cycle, Mindful, Recipes, Summary, Weekly Plan, Profile, Fasting, Progress, Learn, Diary, Workout, and Home.

## Release Definition

The app is final-release ready only when all gates below pass:

1. No P0/P1 functional defect remains in onboarding, search, Summary, navigation, theme, or eligible feature routing.
2. All authenticated routes have desktop/mobile browser coverage.
3. Light, dark, and system themes work across every web screen, including child cards and forms.
4. Cycle visibility and direct-route protection are tested for male, female, and unknown profiles.
5. All pages have keyboard-accessible controls, visible focus, labels, and useful empty/error states.
6. Web export, local browser, live browser, TypeScript, and Jest gates pass.
7. Supabase production schema, RLS, auth settings, and sync behavior are verified against the real project.
8. Previously exposed Supabase service-role credentials are revoked and rotated.
9. Legal URLs, consent logging, AI opt-out, and data deletion/export behavior are verified in production.
10. A custom canonical domain or an explicitly approved Pages domain is configured with HTTPS.

## Phase 3: Complete Product Surface

Status: in progress. Estimate: 2-4 working days.

### Scope

- Finish dynamic theme migration inside child components for Home, Learn, Profile, Recipes, Fasting, Progress, Diary, Workout, and Community.
- Add responsive layout checks for all primary routes at 390px and 1440px.
- Add route-level empty, loading, error, retry, and success states where missing.
- Add authenticated browser coverage for profile setup, Cycle eligibility, dark mode, Summary, Recipes, and Plan.

### Exit Gate

- No fixed light-only surface remains in a web-owned screen except intentional semantic accents.
- Every primary route has heading, primary action, empty state, and responsive browser assertions.

## Phase 4: Release Hardening

Status: next. Estimate: 5-7 working days.

### Scope

- Accessibility audit: keyboard navigation, focus rings, labels, roles, contrast, reduced motion.
- Performance audit: bundle size, cold render, large diary, long workout, image loading, hydration.
- Error boundaries and retry states for remote data and auth/profile loading.
- Full authenticated Playwright matrix: local user, cloud user, male, female, unknown profile, dark mode, reload, logout.
- Add deployment smoke checks for every critical route and asset.
- Verify analytics event names and PII boundaries.

### Exit Gate

- No uncaught console errors, asset 404s, horizontal overflow, or inaccessible primary controls.
- P95 route load and interaction budgets are documented and pass agreed thresholds.

## Phase 5: Production Data and Security

Status: blocked on owner credentials/project confirmation. Estimate: 3-5 working days after access.

### Scope

- Select one canonical Supabase migration and remove schema ambiguity.
- Apply schema and verify RLS for profiles, diary, workouts, fasting, body data, community, recipes, and sync queue.
- Revoke and rotate the previously exposed service-role credential.
- Verify only public Supabase URL/anon key reach the client bundle.
- Configure auth email confirmations, password policy, OAuth redirect URLs, SMTP, and CAPTCHA.
- Deploy and smoke-test Edge Functions separately.
- Verify export/delete/consent behavior against production data.

### Exit Gate

- Real cloud signup, onboarding, data write, reload, logout, export, and deletion pass against production.
- Security review has no open critical finding.

## Phase 6: Email, Push, and Operations

Status: not started. Estimate: 3-5 working days plus external account setup.

### Scope

- Configure Resend secrets and verified sending domain.
- Send welcome and newsletter emails with unsubscribe handling.
- Configure APNs/FCM/Expo push credentials.
- Register push tokens and verify deep links from notification taps.
- Add production error monitoring, alert routing, deployment rollback instructions, and incident runbook.

### Exit Gate

- Email and push flows are opt-in, reversible, logged, and tested on real devices/accounts.

## Phase 7: AI Safety and Growth Features

Status: deferred until Phases 3-6 pass. Estimate: 2-4 weeks.

### Scope

- AI food capture with confidence, assumptions, correction, explicit confirmation, and opt-out.
- Evidence-aware reading mode with citations and disclaimers.
- Weekly health summary with safe local fallback.
- Community thread detail, replies, leaderboards, profiles, and recipe sharing.
- Unified streaks, challenge badges, and retention metrics.

### Exit Gate

- AI never silently logs nutrition, diagnoses, changes treatment, or exposes provider credentials.
- Community moderation and report flows exist before broad launch.

## Timeline

For one developer working sequentially:

- Phase 3 completion: 2-4 days.
- Phase 4 release hardening: 5-7 days.
- Phase 5 production data/security: 3-5 days after credentials/access.
- Phase 6 email/push/operations: 3-5 days plus external setup.
- Final web release candidate: approximately 2-3 weeks.
- AI/community growth scope: additional 2-4 weeks after release readiness.

## Order of Execution

1. Complete Phase 3 theme and route migration.
2. Execute Phase 4 QA and accessibility gates.
3. Resolve Phase 5 credentials, schema, RLS, and secret rotation blockers.
4. Configure Phase 6 email, push, monitoring, and rollback.
5. Promote the final release only after all gates pass.
6. Start Phase 7 growth work after launch, not before.
