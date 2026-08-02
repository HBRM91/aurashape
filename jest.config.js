/** @type {import('jest').Config} */
module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { diagnostics: false }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFiles: ['./jest.setup.js'],
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
