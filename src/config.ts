import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Determine which environment we're in
const nodeEnv = process.env.NODE_ENV || 'development';
console.log(`Running in ${nodeEnv} environment`);

// Load the appropriate .env file based on environment
let envFile = '.env';
if (nodeEnv === 'test') {
    envFile = '.env.test';
} else if (nodeEnv === 'staging') {
    envFile = '.env.staging';
}

// Load environment variables from file
const result = dotenv.config({ path: path.resolve(rootDir, envFile) });

if (result.error) {
    console.warn(`Warning: ${envFile} file not found. Using environment variables.`);
}

// Export all environment configs
export const config = {
    env: nodeEnv,
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
    isDevelopment: nodeEnv === 'development',
    isStaging: nodeEnv === 'staging',

    port: parseInt(process.env.PORT || '3000'),

    db: {
        name: process.env.DB_NAME as string,
        username: process.env.DB_USERNAME as string,
        password: process.env.DB_PASSWORD as string,
        host: process.env.DB_HOST as string,
        port: parseInt(process.env.DB_PORT || '5432'),
        schema: process.env.DB_SCHEMA || 'public',
    },

    jwt: {
        secret: process.env.JWT_SECRET as string,
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    },
};

// For convenience, export NODE_ENV environment check functions
export const isProduction = config.isProduction;
export const isTest = config.isTest;
export const isDevelopment = config.isDevelopment;
export const isStaging = config.isStaging;
