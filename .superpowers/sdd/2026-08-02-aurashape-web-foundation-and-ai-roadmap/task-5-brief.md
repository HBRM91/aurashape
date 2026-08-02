# Task 5: Build the Public Landing Page

**Files:**
- Modify: `app/index.tsx`
- Create: `src/web/PublicLanding.tsx`
- Create: `assets/images/hero-health.svg`
- Create: `assets/images/feature-food.svg`
- Create: `assets/images/feature-fasting.svg`
- Create: `assets/images/feature-workout.svg`
- Create: `assets/images/feature-community.svg`

**Requirements:**
- On web, `/` must render a complete public landing page instead of redirecting directly to login.
- Native behavior may preserve the existing redirect to `/auth/login`.
- Use `WEB_TOKENS` and the web primitives from Task 4 for core layout and buttons.
- Include: hero statement “Your health, shaped by science.”, start-free and sign-in CTAs, product preview cards for food/fasting/workouts/community, privacy-first trust section, local visual artwork, and legal/contact footer links.
- Desktop layout must use a two-column hero and multi-column feature grid; mobile must collapse to one column without horizontal overflow.
- Add local SVG assets with no remote image dependency.
- Add focused render/content tests if the existing Jest setup supports them; otherwise add a deterministic content helper test and static build assertions.
- Run `npm run build:web` and `npm run check`. Do not commit.
