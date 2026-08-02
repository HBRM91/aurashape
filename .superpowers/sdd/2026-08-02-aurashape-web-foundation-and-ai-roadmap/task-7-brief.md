# Task 7: Build the Responsive Web Shell

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Create: `src/web/WebAppShell.tsx`
- Create: `src/web/WebSidebar.tsx`
- Create: `src/web/WebTopBar.tsx`
- Create: `src/web/WebMobileNav.tsx`
- Create: `src/web/navItems.ts`
- Test: `src/web/__tests__/webNavigation.test.tsx`

**Requirements:**
- Web uses a responsive desktop shell with left sidebar, top bar, and centered content region capped at 1200px.
- Mobile web uses compact navigation and does not overflow horizontally.
- Native continues using Expo Router Tabs and existing native behavior.
- Navigation destinations cover Home, Diary, Fasting, Workout, Progress, Cycle, Mindful, Community, Learn, and Profile.
- Active route styling and accessible labels are required.
- Use `Slot`/Expo Router navigation correctly for nested tab content.
- Use `WEB_TOKENS` and explicit styles, not Tailwind-dependent layout.
- Add route map tests and run `npm run check` plus `npm run build:web`. Do not commit.
