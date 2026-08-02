# Task 6 Report: Web Authentication Pages

## Scope

Rebuilt the login, signup, and forgot-password presentation for web while keeping the existing native form paths and auth actions intact. The web routes now use the shared web primitives and responsive auth shell, with static-export checks covering visible form content.

## Files Added

- `src/web/AuthFrame.tsx`
- `src/web/AuthAside.tsx`
- `assets/images/auth-health.svg`
- `src/web/__tests__/authRoutes.test.tsx`

## Files Modified

- `app/auth/login.tsx`
- `app/auth/signup.tsx`
- `app/auth/forgot-password.tsx`
- `src/web/tokens.ts`
- `scripts/build-web.ps1`

## Web Presentation

- Added `AuthFrame` with a responsive split layout: the desktop web layout includes the form card and `AuthAside`; narrower web layouts collapse to a centered single-column form.
- Added `AuthAside` with local `auth-health.svg` artwork, Aurashape branding, privacy-first messaging, and a responsive scroll container.
- Added `WebLogo` to the web auth frame.
- Used `WEB_TOKENS`, `WebButton`, `WebField`, explicit React Native styles, visible focus styles, and visible form error states.
- Login includes labeled email/password fields, autocomplete semantics, loading text, validation/error messaging, Google and Apple actions, signup and forgot-password links, and Privacy Policy/Terms of Service links.
- Signup includes labeled email/password/confirmation fields, `new-password` autocomplete semantics, existing required/password-length/password-confirmation validation, loading/error messaging, OAuth actions, login link, and legal links.
- Forgot-password includes a labeled email field, autocomplete semantics, loading/error messaging, success confirmation copy, and login link.
- All web fields expose accessible labels. Web submit and OAuth controls expose accessible button names.

## Native Preservation

- Native screens remain behind the `Platform.OS === 'web'` branch and continue to use the existing `TextInput`, `TouchableOpacity`, `KeyboardAvoidingView`, native OAuth controls, and validation/action functions.
- Auth store methods were not changed.

## Static Export

Updated `scripts/build-web.ps1` to verify:

- `/auth/login` contains visible `Welcome back`, `Email`, `Password`, and `Log In` content.
- `/auth/signup` contains visible `Start your journey`, `Email`, `Password`, and `Sign Up` content.
- `/auth/forgot-password` contains visible `Reset your password`, `Email`, and `Send Reset Link` content.
- Each auth route contains visible input controls and a focusable submit control.
- `auth-health.svg` is emitted as a hashed local asset alongside the existing landing artwork.

## TDD Record

- Added the focused auth route test before the implementation. The first run failed because the web routes exposed placeholder-only native inputs and native OAuth controls instead of accessible web fields/actions.
- The passing test covers login route content/legal links, login empty-field validation, signup confirmation validation, and forgot-password empty-email validation.
- The test forces `Platform.OS` to `web` only for the web route suite; native platform behavior is not altered in production.

## Verification

- `npm test -- --runInBand src/web/__tests__/authRoutes.test.tsx`: passed, 1 suite and 4 tests.
- `npm run build:web`: passed. Static export generated all four auth HTML routes and the local `auth-health` asset; visible content and control assertions passed.
- `npm run check`: passed, TypeScript plus 26 suites and 261 tests.

## Concerns

- The Expo export continues to print its existing warning that push-token listeners are not fully supported on web; this is unrelated to the auth pages and does not fail the build.
- Native screen rendering was preserved structurally but does not have a dedicated screen-level native test in the current test setup.
- The worktree contains unrelated pre-existing changes and generated loop/session files; none were reverted or modified.
- No commit was created.

## Review Fixes Before Task 7

- Login and signup web OAuth actions now use a shared submitting/error flow per form. Google and Apple buttons disable during the request, show provider-specific loading text, and render returned or thrown errors in the existing live summary. Native OAuth controls remain unchanged.
- Web validation now passes field-specific errors to `WebField` while retaining the live summary error. Inputs expose `aria-invalid` and `aria-describedby` pointing to their live error text.
- Forgot-password now includes Privacy Policy and Terms of Service links, and its successful reset path is covered by a focused test.
- OAuth buttons stack below 480px web widths, keeping both actions usable around 320px.
- `AuthFrame` treats an unavailable server-render width of `0` as the deterministic desktop fallback, so static auth HTML includes the desktop aside artwork instead of omitting it. The export script now verifies that artwork on all auth routes.

## Review Verification

- Focused tests: `npm test -- --runInBand src/web/__tests__/authRoutes.test.tsx src/web/__tests__/webPrimitives.test.tsx` passed, 2 suites and 18 tests.
- `npm run build:web` passed. Static export generated all auth routes, verified visible form controls and aside artwork, and emitted the local `auth-health` asset.
- `npm run check` passed, TypeScript plus 27 suites and 324 tests.
- No commit was created.

## Remaining Artwork Fix

- Added `assets/images/auth-health.png` as a deterministic `sharp` conversion of the existing SVG artwork.
- `AuthAside` now selects the PNG for web/static export and retains the SVG fallback for native behavior.
- The focused auth regression test verifies the PNG signature, and `scripts/build-web.ps1` requires the hashed PNG to be emitted with the static export.
- Verification: focused auth tests passed (9 tests), `npm run build:web` passed, and `npm run check` passed (27 suites, 325 tests).
