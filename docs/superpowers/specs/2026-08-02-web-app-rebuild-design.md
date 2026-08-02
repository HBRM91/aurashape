# Aurashape Web App Rebuild

## Context

Aurashape is an Expo SDK 57 application with React Native Web, Expo Router, Zustand, Supabase, NativeWind, and a substantial native feature set. The current Cloudflare Pages deployment does not present the application reliably on web. Static routes render the root layout's loading spinner because authentication initialization only runs in a client effect. The existing login screen is also a minimal native form rather than a complete responsive web experience.

The goal is to make the existing application a usable, polished web app first while preserving native routes and stores for a later store release.

## Goals

- Make every public web route render usable HTML without waiting for client auth initialization.
- Provide a complete responsive public landing page and authentication flow.
- Provide a desktop authenticated shell with a responsive mobile fallback.
- Make the existing MVP features reachable and legible on web.
- Use local/static visual assets for reliable deployment.
- Keep Supabase auth, Zustand stores, analytics, and existing native behavior.
- Verify the deployed web artifact rather than relying only on TypeScript and Jest.

## Non-goals

- Rewriting the native application.
- Replacing Expo Router with Next.js.
- Introducing a second state-management or backend stack.
- Adding new product domains beyond the existing MVP.
- Bundling Supabase service keys, Resend keys, or other server secrets.

## Architecture

### Runtime Gate

The root layout will always render the route stack during static rendering. Authentication state will be resolved after hydration by a dedicated client-side gate. The gate will:

- Render public routes immediately.
- Resolve the Supabase session with a bounded loading state.
- Redirect authenticated users to the app shell.
- Redirect unauthenticated users away from protected routes.
- Handle missing profile data and Supabase failures as visible recoverable states instead of an infinite spinner.

Supabase web session handling will enable URL session detection on web and preserve the existing native behavior. OAuth redirect URLs will be centralized in one configuration value.

### Web Presentation Layer

Existing routes will remain the routing contract. Web-specific presentation components will live under `src/web/` and will be selected from route screens using platform detection. Native screens and stores remain intact.

The web layer will use explicit theme tokens and React Native `StyleSheet`/inline styles for critical layout. NativeWind may continue supporting existing native screens, but web correctness will not depend on a manually copied Tailwind CSS artifact.

Shared tokens will cover:

- Brand green, ink, muted text, surfaces, borders, and semantic states.
- Spacing, radii, typography sizes, and shadows.
- Desktop, tablet, and mobile layout constants.

### Web Shell

Protected web screens will use:

- A responsive left sidebar on desktop.
- A top bar with date/context, theme control, notifications, and profile access.
- A centered content region with a 1200px maximum width.
- A compact mobile navigation fallback.

The existing screens will be wrapped in web-friendly containers and progressively upgraded with responsive grids and card layouts.

## User Experience

### Public Landing Page

The root route will become a public landing page instead of an unconditional redirect. It will include:

- Hero statement: “Your health, shaped by science.”
- Start-free and sign-in calls to action.
- Product preview panels for food, fasting, workouts, progress, and community.
- Privacy-first trust section.
- Local visual artwork and the existing Aurashape brand assets.
- Footer links to Privacy Policy, Terms, and contact.

### Authentication

Login, signup, and password reset will use a responsive split layout on desktop and a focused single-column layout on mobile. Each page will include:

- Brand mark and supporting visual.
- Clearly styled form fields and primary action.
- Validation, loading, and error states.
- OAuth buttons.
- Cross-links between auth routes.
- Privacy/legal links.

### Authenticated Screens

The first web pass will prioritize the screens users need to understand the product:

1. Home dashboard with macro summary, streak, hydration, science tip, and quick actions.
2. Diary with meal cards and macro progress.
3. Fasting with a prominent timer and plan cards.
4. Workout with exercise/session cards and progress.
5. Progress with charts, measurements, and photos.
6. Community with forum, challenges, and recipes.
7. Learn with articles and guides.
8. Profile/settings with theme, privacy, notifications, and account actions.

## Visual Assets

Local assets will be added for:

- Landing hero illustration.
- Feature preview illustrations.
- Auth-side illustration.
- Article and guide cover art.
- Empty states.

The assets will be SVG/PNG files committed under `assets/images/` and referenced locally. Unsplash will not be required for core page rendering, and its access key will not be exposed in the browser bundle.

## Data and Error Handling

- Existing Zustand stores remain the local source of truth for the web MVP.
- AsyncStorage persistence remains enabled.
- Supabase calls will show loading, empty, and retry states.
- Profile lookup will not block public routes.
- Auth/session initialization will have a bounded failure path.
- Browser-only APIs will be isolated behind platform checks.
- Server secrets remain restricted to Supabase Edge Functions.

## Verification

The implementation is complete only when all of the following pass:

- `npm run check`
- `npx expo-doctor`
- `npx expo export --platform web`
- Static HTML for `/`, `/auth/login`, `/auth/signup`, and `/auth/forgot-password` contains visible page content, not only a spinner.
- Browser smoke tests confirm navigation, auth form interaction, responsive layouts, and no console errors.
- The deployed Cloudflare Pages URL serves CSS, JavaScript, images, and all declared routes with status 200.
- Desktop and mobile viewport checks pass for public landing, auth, home, diary, fasting, workout, progress, community, learn, and profile.

## Rollout

1. Fix static rendering and auth hydration.
2. Build the public landing and auth web presentation.
3. Add the responsive authenticated shell.
4. Upgrade the highest-value authenticated screens.
5. Add local visual assets and empty states.
6. Add browser smoke tests and deploy verification.
7. Deploy a new Cloudflare Pages preview, verify it, then promote to production.

## Security Requirement

Any Supabase secret/service key previously shared outside the project must be rotated before production deployment. Only the public anon key may be present in the client bundle.
