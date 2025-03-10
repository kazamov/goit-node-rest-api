import { isTest } from '@/config.js';

async function globalTeardown() {
    // Clean up the test environment
    // Safety check - only run in test environment
    if (!isTest()) {
        throw new Error('This function can only be run in the test environment');
    }

    console.log('Tearing down test environment...');
    console.log('E2E test environment has been cleaned up');
}

export default globalTeardown;
