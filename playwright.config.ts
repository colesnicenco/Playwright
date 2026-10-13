import { defineConfig, devices } from '@playwright/test';
import { STANDARD_USER_STATE } from './first_test_suite/test-data/users';

export default defineConfig({
  testDir: './first_test_suite/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Screenshots and traces of failed tests; Playwright empties this folder at the start of each run
  outputDir: 'test-results/artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    headless: true,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STANDARD_USER_STATE },
      dependencies: ['setup'],
    },
  ],
});
