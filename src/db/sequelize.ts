import { Sequelize } from 'sequelize';

import { config } from '../config.js';

// Get database config from the centralized config
const {
    name: dbName,
    username: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    schema: dbSchema,
} = config.db;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: config.isDevelopment ? console.log : false,
    schema: dbSchema,
    dialectOptions: {
        ssl: true,
    },
    define: {
        // Set the schema for all models
        schema: dbSchema,
    },
});

export async function testDatabaseConnection() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
}
