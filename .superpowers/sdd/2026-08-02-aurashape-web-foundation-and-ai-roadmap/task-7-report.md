# Task 7 Report: Responsive Web Shell

## Scope

Implemented the responsive web navigation shell for the existing web-ready tab screens while preserving the native Expo Router Tabs navigator. The requested Task 7 files already existed in the preceding foundation commit, so this task corrected and completed their integration instead of duplicating them.

## Files Modified

- `app/(tabs)/_layout.tsx`
- `src/web/WebAppShell.tsx`
- `src/web/WebSidebar.tsx`
- `src/web/WebMobileNav.tsx`
- `src/web/navItems.ts`

## Files Added

- `src/web/__tests__/webNavigation.test.tsx`
- `.superpowers/sdd/2026-08-02-aurashape-web-foundation-and-ai-roadmap/task-7-report.md`

## Navigation Architecture

- Web rendering now branches at `app/(tabs)/_layout.tsx` and returns `WebAppShell` with Expo Router `Slot`.
- Native rendering remains in a separate `NativeTabLayout` using the existing `Tabs` navigator and existing screen options/icons.
- `Slot` renders the selected nested tab route inside the web shell rather than mounting a `Tabs` navigator inside a scroll container.
- The web shell keeps the fixed desktop sidebar, desktop top bar, compact mobile navigation, and a centered content region capped at `WEB_TOKENS.contentWidths.desktop` (1200px).
- Screen-owned web `ScrollView` components remain the scroll containers; the shell no longer adds a competing outer `ScrollView`.

## Route Map

`src/web/navItems.ts` now records both the Expo Router href and the normalized browser path used for active-state matching:

- Home: `/(tabs)` and `/`
- Diary: `/(tabs)/diary` and `/diary`
- Fasting: `/(tabs)/fasting` and `/fasting`
- Workout: `/(tabs)/workout` and `/workout`
- Progress: `/(tabs)/progress` and `/progress`
- Cycle: `/(tabs)/cycle` and `/cycle`
- Mindful: `/(tabs)/meditation` and `/meditation`
- Community: `/(tabs)/community` and `/community`
- Learn: `/articles` and `/articles`
- Profile: `/(tabs)/profile` and `/profile`

The existing Plan destination remains available as an additional route. The map uses normalized paths because Expo Router removes route groups from `usePathname()` values.

## Accessibility and Responsive Behavior

- Sidebar destinations expose link roles, descriptive labels, and selected state.
- Mobile destinations expose button roles, labels, and selected state.
- The mobile More control exposes expanded state and reveals all destinations not shown in the compact five-item bar.
- Mobile navigation items use shrinking/flexible text styles and constrained widths to avoid horizontal overflow.
- Active route styling is applied to sidebar, mobile visible items, and mobile More items.
- Existing dark-mode toggle and profile top-bar navigation remain available.
- Top-bar title now follows the active route when no explicit title is supplied.

## TDD Record

- Added `webNavigation.test.tsx` before changing production code.
- The first focused run failed for the expected missing behaviors: no normalized route paths, no active-state helper, no active Diary styling for `/diary`, and no web `Slot` branch.
- The implementation was then reduced to the route metadata/helper, the `Slot`/native branch split, shell scroll correction, and navigation accessibility/responsive styles.
- The focused suite passed after the implementation.

## Verification

- `npm test -- --runInBand src/web/__tests__/webNavigation.test.tsx`: passed, 1 suite and 5 tests.
- `npm run check`: passed TypeScript plus 28 suites and 331 tests.
- `npm run build:web`: passed. Static export generated 33 routes, including `/diary`, `/fasting`, `/workout`, `/progress`, `/cycle`, `/meditation`, `/community`, `/profile`, `/articles`, and tab-group routes; existing landing/auth asset assertions also passed.
- `git diff --check`: passed with only existing Git line-ending warnings for the dirty worktree.
- No commit was created.

## Concerns

- Learn is an existing top-level `/articles` route rather than a child of `app/(tabs)`. The navigation control reaches it correctly, but its page is outside the `(tabs)` layout and therefore does not retain the sidebar/top bar/mobile navigation after navigation. Keeping it outside the tab group avoids changing the existing article route architecture and was left within Task 7 scope.
- Expo export continues to print the existing warning that push-token listeners are not fully supported on web; it does not fail the build.
- The worktree contains unrelated pre-existing loop/session, progress, Task 6, and `AuthAside` changes. None were reverted or modified.
