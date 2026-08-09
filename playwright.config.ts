import { defineConfig } from '@playwright/test';

const remoteBaseURL = process.env.WEB_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: remoteBaseURL || 'http://localhost:8081',
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
  ...(remoteBaseURL ? {} : {
    webServer: {
      command: 'npx serve dist --single -p 8081',
      port: 8081,
      reuseExistingServer: true,
    },
  }),
});
