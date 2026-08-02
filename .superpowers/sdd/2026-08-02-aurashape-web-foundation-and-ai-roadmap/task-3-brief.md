# Task 3: Make Web Styling Deterministic

**Files:**
- Modify: `metro.config.js`
- Modify: `global.css`
- Modify: `app/+html.tsx`
- Modify: `package.json`
- Create: `scripts/build-web.ps1`

**Requirements:**
- Keep NativeWind 4.2.6 with Tailwind CSS 3.4.17.
- Keep `withNativeWind(config, { input: './global.css' })` as the Metro CSS entry point.
- Keep `global.css` on Tailwind v3 directives and `tailwind.config.js` on the NativeWind preset/content configuration.
- Remove the manually linked `/tailwind.css` contract from `app/+html.tsx`; do not require a manually copied CSS artifact after export.
- Add `npm run build:web` that runs Expo web export and fails if `dist/auth/login.html` or `dist/auth/signup.html` contains only the loading spinner instead of visible form content.
- Add PowerShell assertions that `/auth/login` and `/auth/signup` contain visible form controls and that `/` generates a valid HTML route shell. The root landing-content assertion belongs to Task 5.
- Run `npm run build:web` and `npm run check`.
- Do not modify public/authenticated visual UI in this task.
