# Task 4: Build the Web Design Token and Primitive Layer

**Files:**
- Create: `src/web/tokens.ts`
- Create: `src/web/WebButton.tsx`
- Create: `src/web/WebCard.tsx`
- Create: `src/web/WebField.tsx`
- Create: `src/web/WebLogo.tsx`
- Create: `src/web/WebSection.tsx`
- Test: `src/web/__tests__/webTokens.test.ts`

**Requirements:**
- `WEB_TOKENS` must expose colors, spacing, radii, typography, shadows, and content widths.
- `WebButton` must accept `{ label, onPress, variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean }`.
- `WebField` must accept `{ label, error?, ...TextInputProps }` and render a visible label/error.
- `WebCard`, `WebLogo`, and `WebSection` must be reusable, accessible, and platform-safe.
- Use React Native styles rather than depending on Tailwind class generation for critical web layout.
- Add focused token tests and run `npm run check`.
- Do not modify existing product screens in this task. Do not commit.
