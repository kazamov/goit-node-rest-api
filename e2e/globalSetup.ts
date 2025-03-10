import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

import { getConfig } from '@/config.js';
import { initializeTestDatabase } from '@/db/seedTestDb.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function globalSetup() {
    const config = getConfig();
    console.log(`Setting up E2E tests with configuration for ${config.env} environment`);

    // Setup Docker container with PostgreSQL
    try {
        // Start Postgres container
        console.log('Starting test database container...');
        execSync('npm run db:test:start', {
            stdio: 'inherit',
            cwd: rootDir,
        });
        console.log('Test environment ready');
    } catch (error) {
        console.error('Failed to set up test environment:', error);
        throw error;
    }

    // Initialize the test database
    await initializeTestDatabase();

    console.log('E2E test environment is ready');
}

export default globalSetup;
