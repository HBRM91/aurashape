# Onboarding Foundation Design

## Goal

Replace the current consent and onboarding experience with a trustworthy, responsive, data-complete flow that supports consent separation, date/unit correctness, diet/allergy profile, optional fasting, and goal projections.

## Design

The existing Zustand onboarding store remains the single local source of truth. New fields are added with backward-safe defaults and persisted through the existing middleware. Web and native screens share validation and conversion helpers but use platform-appropriate controls: HTML-style date input on web and the Expo date picker on native when available. The UI continues to support local-first mode.

Consent becomes a dedicated responsive screen with required policy acceptance and independent optional toggles. It uses the deployed legal host from configuration, displays policy version metadata, and does not block onboarding on optional marketing, analytics, or AI choices.

Onboarding stores canonical metric values internally. Imperial input is converted to centimeters/kilograms at the boundary; display values are converted back based on the selected unit system. Diet choices become a set, allergies become a controlled set, fasting becomes `none` or a selected plan, and goal fields include target weight and weekly change.

The goal projection is deterministic and local: current weight, target weight, weekly change, and dates generate a bounded series. The chart distinguishes projected values from actual weight entries. AI guidance is not required for the first slice; the first slice exposes safe local guidance and an explicit opt-in boundary.

## Safety

- Validate dates against real calendar dates and reasonable age bounds.
- Prevent negative, zero, or extreme height/weight values.
- Recommend a conservative weekly loss range and require confirmation for values outside it.
- Do not recommend fasting for users who indicate a contraindication; route to professional advice.
- Allergy filters are exact exclusions.
- Do not persist raw consent language; persist policy version, accepted timestamp, and purpose flags.

## Testing

- Unit tests cover date parsing, unit conversion, diet/allergy selection, fasting opt-out, weekly-rate bounds, and projection generation.
- Component tests cover required consent, optional consent, calendar input, unit toggle, and step navigation.
- Playwright covers desktop/mobile consent and onboarding, reload persistence, and no horizontal overflow.
- `npm run check`, `npm run build:web`, `npm run assert:web`, `npm run assert:local-privacy`, and `npm run test:e2e` are required before deployment.
