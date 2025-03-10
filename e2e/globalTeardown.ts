import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

import { isTest } from '@/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function globalTeardown() {
    // Clean up the test environment
    // Safety check - only run in test environment
    if (!isTest()) {
        throw new Error('This function can only be run in the test environment');
    }

    console.log('Tearing down test environment...');

    try {
        // Stop and remove containers
        execSync('npm run db:test:stop', {
            stdio: 'inherit',
            cwd: rootDir,
        });

        console.log('Test environment cleaned up');
    } catch (error) {
        console.error('Failed to tear down test environment:', error);
        throw error;
    }

    console.log('E2E test environment has been cleaned up');
}

export default globalTeardown;
