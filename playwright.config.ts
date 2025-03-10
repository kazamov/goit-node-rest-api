import { defineConfig } from '@playwright/test';
import path from 'node:path';

import { getConfig } from '@/config.js';

const config = getConfig('test');

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
        trace: process.env.CI ? 'on' : 'on-first-retry',

        // Add screenshot for CI debugging
        screenshot: process.env.CI ? 'on' : 'only-on-failure',
    },

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev',
        url: `http://localhost:${config.port}`,
        reuseExistingServer: true,
        env: {
            NODE_ENV: 'test',
        },
        timeout: 120 * 1000, // Allow more time for server to start in CI
    },

    // Global setup and teardown
    globalSetup: path.resolve('./e2e/globalSetup.ts'),
    globalTeardown: path.resolve('./e2e/globalTeardown.ts'),
});
