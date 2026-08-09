# Web Shell Review Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining Task 7A web-shell review findings for Learn, mobile More active state, and static export verification.

**Architecture:** Keep `/articles` as a top-level route and preserve its native branch. On web, render `WebLearn` inside the existing `WebAppShell`; derive mobile More selection from the normalized active nav item; verify representative static routes with deterministic HTML assertions.

**Tech Stack:** Expo SDK 57, Expo Router 57, React Native Web, TypeScript, Jest 29, PowerShell web export scripts.

## Global Constraints

- Read and follow Expo SDK `57.0.0` documentation before Expo code changes.
- Preserve native behavior and native route forms.
- Do not add dependencies or backend changes.
- Do not revert unrelated dirty-worktree changes.
- Do not commit unless explicitly requested.
- Run `npm run build:web` for this web-facing task.
- Run `npm run check` before claiming completion.
- Keep web output usable at 1440px and 390px widths.

---

### Task 1: Add Focused Navigation and Learn Shell Tests

**Files:**
- Modify: `src/web/__tests__/webNavigation.test.tsx`
- Modify: `app/articles.tsx`
- Modify: `src/web/WebMobileNav.tsx` or `src/web/navItems.ts`

**Interfaces:**
- Consumes: existing `NAV_ITEMS`, `getActiveNavItem`, `WebMobileNav`, `WebAppShell`, and `WebLearn`.
- Produces: observable tests for `/articles`, hidden-route More selection, and web Learn shell rendering.

- [ ] **Step 1: Inspect current focused tests and navigation APIs**

Read `src/web/__tests__/webNavigation.test.tsx`, `src/web/navItems.ts`, `src/web/WebMobileNav.tsx`, and `app/articles.tsx`. Reuse existing mocks and test helpers rather than introducing a second navigation model.

- [ ] **Step 2: Write failing tests for the review findings**

Add tests that assert:

```ts
expect(getActiveNavItem('/articles')?.label).toBe('Learn');
expect(getActiveNavItem('/diary')?.label).toBe('Diary');
```

Render mobile navigation with a route that is only visible in More and assert the More control has selected state and `aria-expanded`; render a compact visible route and assert More is not selected. Render the web Articles route and assert `Learn` plus a shared shell navigation label are present.

- [ ] **Step 3: Run the focused tests and confirm the expected failure**

Run: `npm test -- --runInBand src/web/__tests__/webNavigation.test.tsx`

Expected: the new hidden-route selection and/or Learn shell assertions fail before implementation changes.

### Task 2: Implement More Selection and Learn Shell Integration

**Files:**
- Modify: `src/web/WebMobileNav.tsx` or `src/web/navItems.ts`
- Modify: `app/articles.tsx`

**Interfaces:**
- Consumes: the failing tests and existing normalized route metadata.
- Produces: `More` selected only when the active item is hidden from compact mobile navigation; web `/articles` wrapped by `WebAppShell`.

- [ ] **Step 1: Implement hidden-route More selection**

Compute the active nav item using the existing pathname matching. Define the compact visible item set already used by the component. Set More selected only when an active item exists and is not in that compact set. Preserve `aria-expanded` for the menu state and do not mark compact items selected for hidden routes.

- [ ] **Step 2: Wrap only the web Articles branch**

At the top of `ArticlesScreen`, keep the existing platform branch and return:

```tsx
if (Platform.OS === 'web') {
  return (
    <WebAppShell title="Learn">
      <WebLearn />
    </WebAppShell>
  );
}
```

Leave the native hooks, content, and native rendering below this branch unchanged.

- [ ] **Step 3: Run focused tests and fix only observed failures**

Run: `npm test -- --runInBand src/web/__tests__/webNavigation.test.tsx`

Expected: all focused navigation tests pass.

### Task 3: Strengthen Static Export Assertions

**Files:**
- Modify: `scripts/build-web.ps1`
- Modify: `src/web/__tests__/webNavigation.test.tsx` only if route marker behavior needs coverage

**Interfaces:**
- Consumes: generated `dist/` route HTML and existing shell/screen text.
- Produces: deterministic assertions for `/articles`, `/diary`, `/fasting`, and `/profile`.

- [ ] **Step 1: Inspect the existing export script and generated route markers**

Read `scripts/build-web.ps1` and run the existing export once if needed. Identify stable screen headings and the existing shell navigation marker or accessible label; do not assert generated class names or hydration timing.

- [ ] **Step 2: Add route-specific HTML assertions**

Require each route to contain its heading and the shared shell marker/navigation label. Keep `/articles` mapped to `Learn`, `/diary` to `Diary`, `/fasting` to `Fasting`, and `/profile` to `Profile`. Fail with the route name in the error message when a marker is missing.

- [ ] **Step 3: Run the web build**

Run: `npm run build:web`

Expected: export succeeds and all route assertions pass.

### Task 4: Full Verification and Handoff Evidence

**Files:**
- Modify: `.superpowers/sdd/2026-08-02-aurashape-web-foundation-and-ai-roadmap/task-7-report.md` only if the repository handoff report is maintained during this task
- Modify: `.superpowers/sdd/2026-08-02-aurashape-web-foundation-and-ai-roadmap/progress.md` only if status must be updated

- [ ] **Step 1: Run strict project verification**

Run: `npm run check`

Expected: TypeScript and the full Jest suite pass.

- [ ] **Step 2: Check patch formatting and worktree state**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors; unrelated existing changes remain untouched.

- [ ] **Step 3: Inspect acceptance evidence**

Confirm focused tests, `npm run build:web`, and `npm run check` all passed. Confirm native Articles code was not structurally changed beyond the web branch and no new dependencies or credentials were introduced.
