# Web Shell Review Closure Design

## Goal

Close the remaining responsive web shell review findings for the Learn route. The `/articles` route must retain the authenticated web shell, hidden mobile routes must make the More control visibly active, and static export checks must prove that representative routes render both screen content and shell navigation.

## Scope

- Keep `/articles` as the existing top-level Expo Router route.
- Preserve the native Articles implementation and all native tab behavior.
- On web, render `WebLearn` inside the existing `WebAppShell` with the title `Learn`.
- Mark the mobile More control selected when the active route is only available from its expanded menu, without selecting unrelated visible items.
- Add focused navigation tests for normalized active paths, More selection, and the web Learn shell wrapper.
- Extend deterministic web export assertions for `/articles`, `/diary`, `/fasting`, and `/profile`.

## Non-Goals

- Do not move Learn into the `(tabs)` route group.
- Do not redesign the sidebar, top bar, or mobile navigation.
- Do not change stores, authentication, Supabase behavior, native rendering, or add dependencies.

## Design

`app/articles.tsx` will branch on `Platform.OS` before the native hooks and render `<WebAppShell title="Learn"><WebLearn /></WebAppShell>` on web. The existing native branch remains unchanged after that branch.

Navigation active state will continue to use normalized browser paths from `src/web/navItems.ts`. The mobile navigation will derive a `moreSelected` value from the active item: it is true only when the active item is not among the compact visible items. The More button will expose `aria-expanded` and selected styling consistently.

The web export assertions will require route-specific visible headings and a shared shell marker or accessible navigation label. Assertions will remain textual and deterministic so they work against generated static HTML without waiting for client effects.

## Testing

- Unit tests verify `/articles` resolves to Learn, `/diary` resolves to Diary, and a hidden route selects More while visible routes do not.
- Component tests verify the web Articles branch includes shell navigation and the Learn heading.
- `npm test -- --runInBand src/web/__tests__/webNavigation.test.tsx` verifies the focused behavior.
- `npm run build:web` verifies static export and route assertions.
- `npm run check` verifies strict TypeScript and the complete Jest suite.
- `git diff --check` verifies patch formatting.

## Acceptance Criteria

1. Web `/articles` displays the same shell navigation as authenticated tab routes.
2. Native `/articles` behavior is unchanged.
3. Mobile More is selected only for routes hidden inside More.
4. Export assertions pass for `/articles`, `/diary`, `/fasting`, and `/profile`.
5. Focused tests, full checks, and web build pass.
