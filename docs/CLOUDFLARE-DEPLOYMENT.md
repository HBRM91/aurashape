# Cloudflare Pages Deployment

Aurashape deploys the Expo static web export to the Cloudflare Pages project `aurashape`.

## Current Project

- Pages project: `aurashape`
- Default domain: `https://aurashape.pages.dev`
- Deployment branch: `main`
- Account ID: `b1b56dcea807e48c9d3bc918bf1266ec`
- Deployment workflow: `.github/workflows/deploy-web.yml`

## GitHub Configuration

Open the repository’s **Settings → Secrets and variables → Actions**.

### Repository secrets

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages Edit permission for the account |
| `CLOUDFLARE_ACCOUNT_ID` | `b1b56dcea807e48c9d3bc918bf1266ec` |
| `EXPO_PUBLIC_SUPABASE_URL` | `https://gfolypnclohpeqhaufhl.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key only |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog public project key, if analytics is enabled |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry public DSN, if crash reporting is enabled |
| `EXPO_PUBLIC_UNSPLASH_ACCESS_KEY` | Unsplash public client key, if image search is enabled |

Never add `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY`, database passwords, or private Cloudflare tokens to Expo public variables or the repository.

### Repository variables

| Variable | Recommended value |
|---|---|
| `EXPO_PUBLIC_WEB_AUTH_REDIRECT_URL` | `https://aurashape.pages.dev/auth/callback` |

When a custom domain is configured, change this to `https://aurashape.app/auth/callback` and add the same URL to Supabase Auth redirect allow-lists.

## Cloudflare API Token

Create a scoped API token in Cloudflare:

1. Profile → API Tokens → Create Token.
2. Use a custom token.
3. Grant `Account → Cloudflare Pages → Edit` for the Aurashape account only.
4. Store the result as the GitHub secret `CLOUDFLARE_API_TOKEN`.

The workflow also sets `CLOUDFLARE_ACCOUNT_ID`; do not hardcode the token in YAML.

## Workflow Behavior

On every push to `main` or manual workflow dispatch, GitHub Actions:

1. Installs Node 22 dependencies.
2. Scans tracked files for private credential values.
3. Runs TypeScript and Jest via `npm run check`.
4. Builds and validates the static Expo web export.
5. Validates local privacy-mode output.
6. Installs Chromium and runs Playwright.
7. Deploys `dist/` with Wrangler to Pages project `aurashape`.

## Local Deployment

```powershell
$env:CLOUDFLARE_API_TOKEN = "<token>"
$env:CLOUDFLARE_ACCOUNT_ID = "b1b56dcea807e48c9d3bc918bf1266ec"
npm run build:web
npx wrangler@4.98.0 pages deploy dist --project-name aurashape --branch main
```

Do not put the token in `.env`, `.env.example`, shell history, or commit messages.

## Production Smoke Checks

Verify after deployment:

- `https://aurashape.pages.dev/`
- `https://aurashape.pages.dev/privacy`
- `https://aurashape.pages.dev/terms`
- `https://aurashape.pages.dev/onboarding/privacy-consent`
- `https://aurashape.pages.dev/onboarding`
- `https://aurashape.pages.dev/progress`

Required headers include `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and a strict referrer policy.
