# Phase 2-3 Profile, Theme, and Web Experience Design

## Goal

Make the authenticated web product profile-aware, theme-consistent, and responsive across Cycle, Mindful, Weekly Plan, Profile, Recipes, Fasting, and Progress while preserving native behavior.

## Architecture

Add a canonical persisted profile/eligibility layer derived from onboarding and Supabase profile data. Navigation metadata is filtered through that layer, and direct ineligible routes redirect safely instead of relying only on hidden links.

Add a dynamic web theme palette consumed by the shell and shared web primitives. Build dedicated web presentations for Cycle and Mindful that reuse their existing stores, then migrate the highest-impact existing screens to shared responsive layout primitives.

## Profile Eligibility

- `sex: 'male' | 'female' | null` is the source field for Cycle availability.
- Unknown sex keeps Cycle available until the user makes a choice.
- Male users do not see Cycle in sidebar, mobile More, or native tabs.
- Direct `/cycle` access redirects male users to `/progress`.
- Eligibility logic is pure and unit tested independently from UI.

## Theme

- Preserve `system`, `light`, and `dark` modes.
- Provide light and dark web palettes with identical semantic keys.
- Shell, buttons, fields, cards, navigation, Cycle, Mindful, Summary, and Profile use dynamic colors.
- Domain accents remain semantic, but page surfaces, text, borders, and controls never use fixed light-only surfaces.

## Web Screens

### WebCycle

Responsive cycle overview, prediction card, history, settings, symptom/flow entry form, and an empty state. It reuses `useCycleStore` and shows a clear eligibility-safe state.

### WebMeditation

Responsive session workspace with session type selection, duration, timer, breathing mode, completion controls, history, and weekly statistics. It reuses `useMeditationStore` and keeps timer cleanup behavior.

### Layout Migration

- Weekly Plan uses a deliberate desktop grid and stacked mobile cards.
- Profile removes placeholders and wires legal links and available metrics.
- Recipes, Fasting, and Progress replace fixed light surfaces and cramped controls with shared responsive primitives.

## Testing and Release Gates

- Unit tests cover eligibility, filtered navigation, direct route guards, and dynamic theme palettes.
- Component tests cover WebCycle, WebMeditation, and updated Weekly Plan/Profile empty states.
- Browser tests cover male/female navigation behavior, dark mode, Cycle redirect, mobile overflow, and representative redesigned routes.
- `npm run check`, `npm run build:web`, local Playwright, and live Playwright must pass before deployment.

## Non-Goals

- No changes to cycle or meditation business calculations beyond route eligibility and presentation.
- No backend schema migration unless required to load the existing `sex` field.
- No native screen redesign beyond conditional Cycle tab visibility and shared data access.
