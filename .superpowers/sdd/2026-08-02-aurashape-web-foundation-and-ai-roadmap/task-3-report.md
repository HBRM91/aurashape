# Task 3 Report: Deterministic Web Styling

## Scope

Implemented the web export foundation changes from the Task 3 brief without changing public or authenticated route UI. NativeWind 4.2.6 remains the styling integration and Tailwind CSS 3.4.17 remains the Tailwind v3 compiler.

## Changes

- Removed the manually authored `/tailwind.css` stylesheet link from `app/+html.tsx`.
- Pinned `nativewind` to `4.2.6` and `tailwindcss` to `3.4.17` in `package.json` and the root dependency contract in `package-lock.json`.
- Added `npm run build:web`, backed by `scripts/build-web.ps1`.
- Made the build script run `npx expo export --platform web --clear`, so the generated CSS and static HTML are produced by Expo/Metro/NativeWind without a post-export CSS copy step.
- Added PowerShell assertions for `/`, `/auth/login`, and `/auth/signup`.
- The root assertion verifies the generated static root shell. The login assertion requires `Aurashape`, `Email`, and `Password`; the signup assertion requires `Create Account`, `Email`, and `Password`.
- The auth assertions reject missing content and spinner-only HTML. All assertions also require the corresponding static HTML file to exist.

## Preserved Configuration

- `metro.config.js` continues to use `isCSSEnabled: true` and `withNativeWind(config, { input: './global.css' })`.
- `metro.config.js` retains the existing single-worker setting used to keep export output stable.
- `global.css` remains on the Tailwind v3 `@tailwind base`, `@tailwind components`, and `@tailwind utilities` directives.
- `tailwind.config.js` remains configured with the NativeWind preset and the existing app/src content globs.
- No manually generated `tailwind.css` artifact is needed or referenced.

## Verification

Ran `npm run build:web`:

- Expo web export completed successfully with 31 static routes.
- `/` generated `dist/index.html` and passed the root-shell assertion.
- `/auth/login` generated `dist/auth/login.html` containing visible `Aurashape`, `Email`, and `Password` content.
- `/auth/signup` generated `dist/auth/signup.html` containing visible `Create Account`, `Email`, and `Password` content.
- The generated route HTML no longer contains the `/tailwind.css` link.

Ran `npm run check`:

- TypeScript passed with no errors.
- Jest passed: 22 suites and 241 tests.

## Concerns

- Expo continues to print its existing warning that push-token listeners are not fully supported on web; the export still completes and the assertions pass.
- `/` is an intentional redirect route, so its static HTML is a generated root shell rather than the login form. The auth routes are the form-content checks.
- The new build entry point is PowerShell-based as requested and assumes Windows PowerShell is available.
- Existing unrelated worktree changes were left untouched. No commit was created.

## Review Fix

- Tightened the root assertion to require only a generated HTML route shell in `dist/index.html`: doctype, document elements, body, and the root mount element. It does not assert landing-page content; that remains Task 5 scope.
- Changed auth assertions to extract each generated `<body>`, remove `<script>` and `<style>` blocks, and validate the visible body rather than the full HTML document.
- Auth routes now require an actual `<input>` control, the expected submit text (`Log In` or `Sign Up`), and the existing visible page text. Spinner-only or asset-only output no longer satisfies the checks.
- Re-ran `npm run build:web`: export completed with 31 static routes and all three route assertions passed.
- Re-ran `npm run check`: TypeScript passed; Jest passed with 22 suites and 241 tests.

## Remaining Review Fix

- Updated the auth route assertions in `scripts/build-web.ps1` to require `<input`, `tabindex="0"`, and the expected submit label after scripts and styles are stripped from the generated body.
- Kept the root shell assertion unchanged.
- Ran `npm run build:web`: export completed with 31 static routes and all three route assertions passed.
- Ran `npm run check`: TypeScript passed; Jest passed with 22 suites and 241 tests.
- No commit was created.
