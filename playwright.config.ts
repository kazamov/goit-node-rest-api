import { defineConfig } from '@playwright/test';

// Import config only after setting NODE_ENV
import { config } from './src/config.js';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: process.env.CI ? 'github' : 'list',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: `http://localhost:${config.port}`,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev',
        url: `http://localhost:${config.port}`,
        reuseExistingServer: !process.env.CI,
    },

    // Global setup and teardown
    globalSetup: './e2e/globalSetup.ts',
    globalTeardown: './e2e/globalTeardown.ts',
});
