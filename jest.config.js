const expoPreset = require('jest-expo/jest-preset');

process.env.EXPO_OS ??= 'web';

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { diagnostics: false }],
    '^.+\\.(js|jsx)$': expoPreset.transform['\\.[jt]sx?$'],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/lib/supabase.ts',
    '!src/lib/analytics.ts',
    '!src/lib/sentry.ts',
    '!src/lib/email.ts',
    '!src/lib/notifications.ts',
  ],
};
