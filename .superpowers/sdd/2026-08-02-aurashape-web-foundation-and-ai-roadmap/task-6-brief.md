# Task 6: Rebuild Web Authentication Pages

**Files:**
- Modify: `app/auth/login.tsx`
- Modify: `app/auth/signup.tsx`
- Modify: `app/auth/forgot-password.tsx`
- Create: `src/web/AuthFrame.tsx`
- Create: `src/web/AuthAside.tsx`
- Create: `assets/images/auth-health.svg`

**Requirements:**
- Preserve the current native forms; only web routes use the new presentation.
- Desktop uses a branded split layout with local artwork; mobile collapses to a focused single-column form.
- Use `WEB_TOKENS`, `WebLogo`, `WebButton`, `WebField`, and explicit React Native styles.
- Login includes email/password, visible validation/error/loading states, Google/Apple actions, signup link, forgot-password link, and legal links.
- Signup includes email/password/confirmation, existing validation, OAuth actions, login link, and legal links.
- Forgot-password includes email, loading/error/success states, and login link.
- Add accessible labels, autocomplete semantics, and visible focus/error states.
- Add local `auth-health.svg` asset.
- Add focused tests for route content and form validation where existing test setup supports them.
- Run `npm run build:web` and `npm run check`. Do not commit.
