import { isTest } from '../config.js';

import { sequelize } from './sequelize.js';

export async function initializeTestDatabase() {
    // Safety check - only run in test environment
    if (!isTest) {
        console.error('This script can only be run in the test environment');
        return false;
    }

    try {
        console.log('Syncing test database...');

        // Force sync will drop tables if they exist and recreate them
        await sequelize.sync({ force: true });

        console.log('Test database initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize test database:', error);
        return false;
    }
}
