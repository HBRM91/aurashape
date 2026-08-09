# Production Readiness

Last audited: August 8, 2026

## Verified

- `npm run check`: 51 suites, 393 tests passing.
- `npm run build:web`: 33 static routes exported with 16 route/content, legal-page, asset, and security-header assertions.
- `npm run test:e2e`: 28 local browser checks passing at desktop and mobile widths.
- Remote browser checks: 30 desktop/mobile checks passing against `https://9c2b53c3.aurashape.pages.dev`.
- Cloudflare Pages production deployment is live at `https://9c2b53c3.aurashape.pages.dev`.
- `/privacy`, `/terms`, and the landing page return visible content.
- Deployed headers include `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- Current web bundles contain no service-role, OpenAI, or Resend secret values.
- Local-only mode is now the default build mode; personalized AI, analytics, Sentry, push-token upload, sync, and email are gated off.
- `npm run assert:local-privacy` passes for the deployed build artifact.
- `npm run assert:secrets` scans tracked text files and rejects private credential values; the current repository passes.
- B2B foundation is implemented in `supabase/migrations/202608090001_b2b_foundation.sql` and the authenticated `/organization` route; remote migration `b2b_foundation` is applied and verified.
- P0 onboarding foundation is deployed at `https://05263417.aurashape.pages.dev`: rebuilt consent, web calendar input, reversible metric/imperial display, richer diet/allergy choices, optional fasting education, target timeline, and actual-vs-projected weight chart.

## Release Blockers

- The Supabase service-role credential was previously committed and must be revoked and rotated. Removing it from the current worktree does not remove it from Git history.
- `aurashape.app` is not attached as a Cloudflare Pages custom domain and is not present as a Cloudflare zone in the configured account. DNS/domain ownership must be completed before using it as the canonical production URL.
- Supabase remote schema/RLS state has been verified through MCP. Migration history includes `b2b_foundation`, `onboarding_profile_fields`, `security_definer_acl`, `advisor_hardening`, and `rls_initplan_hardening`.
- `supabase/migrations/001_initial_schema.sql` matches the existing remote baseline (`foods`, `body_logs`, `workout_sets`, and related tables). The incompatible duplicate `001_schema.sql` has been removed.
- Supabase Auth production settings still require confirmation: email confirmations, password requirements, OAuth providers, redirect URLs, CAPTCHA, and SMTP.
- AI features forward health-related input to OpenAI. Privacy policy, consent language, data-processing agreements, retention, and user opt-out behavior require legal/product approval before enabling AI in production.
- Resend/OpenAI/Supabase Edge Function secrets must be configured in Supabase, and Edge Functions must be deployed and smoke-tested separately from the Pages frontend.

## Deployment

- `.github/workflows/deploy-web.yml` builds, tests, exports, runs Playwright, and deploys `dist/` with Wrangler when the required GitHub secrets are configured.
- Required GitHub secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_SENTRY_DSN`, and `EXPO_PUBLIC_UNSPLASH_ACCESS_KEY`.
- Required GitHub variable: `EXPO_PUBLIC_WEB_AUTH_REDIRECT_URL`.
