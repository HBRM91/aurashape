# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Verification

Before claiming work is done, run:
```
npm run check
```

This runs `tsc --noEmit` (strict TypeScript with noUnusedLocals and noUnusedParameters) followed by `jest --no-coverage` (233 tests across 20 suites).

## Testing

- Tests use Jest 29 + ts-jest with diagnostics disabled
- Test files live in `src/**/__tests__/` and are excluded from tsc
- Coverage targets: stores should maintain ~80%+, overall ~55%+

## Architecture

- Expo SDK 57, Expo Router v4 (file-based routing)
- Zustand 5 for state management (15 stores)
- NativeWind 4 for Tailwind styling
- Dark mode via `useThemeColors()` hook from `src/stores/theme`
- Strict TypeScript with path alias `@/` → root
