import { getConfig } from '@/config.js';
import { initializeTestDatabase } from '@/db/seedTestDb.js';

async function globalSetup() {
    const config = getConfig();
    console.log(`Setting up E2E tests with configuration for ${config.env} environment`);

    // Initialize the test database
    await initializeTestDatabase();

    console.log('E2E test environment is ready');
}

export default globalSetup;
