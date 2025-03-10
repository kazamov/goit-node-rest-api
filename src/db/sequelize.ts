import { Sequelize } from 'sequelize';

import { getConfig } from '../config.js';

// Get database config from the centralized config
const config = getConfig();

const {
    name: dbName,
    username: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    schema: dbSchema,
    ssl: dbSsl,
} = config.db;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: config.isDevelopment ? console.log : false,
    schema: dbSchema,
    dialectOptions: {
        ssl: dbSsl,
    },
    define: {
        // Set the schema for all models
        schema: dbSchema,
    },
});

export async function testDatabaseConnection() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully');
    } catch {
        console.error('Unable to connect to the database');
    }
}
