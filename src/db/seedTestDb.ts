import { isTest } from '../config.js';

import { Contact } from './models/Contact.js';
import { User } from './models/User.js';
import { testDatabaseConnection } from './sequelize.js';

export async function initializeTestDatabase() {
    // Safety check - only run in test environment
    if (!isTest()) {
        console.error('This script can only be run in the test environment');
        return false;
    }

    try {
        console.log('Syncing test database...');

        await testDatabaseConnection();

        await Promise.all([User.sync({ force: true }), Contact.sync({ force: true })]);

        console.log('Test database initialized successfully');
    } catch {
        console.error('Failed to initialize test database');
    }
}
