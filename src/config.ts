import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Store the cached config
let cachedConfig: Config | null = null;

// Define the Config type for better type safety
interface Config {
    env: string;
    isProduction: boolean;
    isTest: boolean;
    isDevelopment: boolean;
    isStaging: boolean;
    port: number;
    db: {
        name: string;
        username: string;
        password: string;
        host: string;
        port: number;
        schema: string;
        ssl: boolean;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
}

// Function to load config on demand
function loadConfig(nodeEnv?: string): Config {
    // Return cached config if already loaded
    if (cachedConfig) {
        return cachedConfig;
    }

    // Determine which environment we're in
    const localNodeEnv = process.env.NODE_ENV ?? nodeEnv ?? 'development';
    console.log(`Running in ${localNodeEnv} environment`);

    // Load the appropriate .env file based on environment
    let envFile = '.env';
    if (localNodeEnv === 'test') {
        envFile = '.env.test';
    } else if (localNodeEnv === 'staging') {
        envFile = '.env.staging';
    }

    // Load environment variables from file
    const result = dotenv.config({ path: path.resolve(rootDir, envFile) });

    if (result.error) {
        console.warn(`Warning: ${envFile} file not found. Using environment variables.`);
    }

    // Create and cache the config object
    cachedConfig = {
        env: localNodeEnv,
        isProduction: localNodeEnv === 'production',
        isTest: localNodeEnv === 'test',
        isDevelopment: localNodeEnv === 'development',
        isStaging: localNodeEnv === 'staging',

        port: parseInt(process.env.PORT || '3000'),

        db: {
            name: process.env.DB_NAME as string,
            username: process.env.DB_USERNAME as string,
            password: process.env.DB_PASSWORD as string,
            host: process.env.DB_HOST as string,
            port: parseInt(process.env.DB_PORT || '5432'),
            schema: process.env.DB_SCHEMA || 'public',
            ssl: process.env.DB_ENABLE_SSL === 'true',
        },

        jwt: {
            secret: process.env.JWT_SECRET as string,
            expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        },
    };

    return cachedConfig;
}

export const getConfig = (nodeEnv?: string): Config => loadConfig(nodeEnv);

export const isProduction = (): boolean => getConfig().isProduction;
export const isTest = (): boolean => getConfig().isTest;
export const isDevelopment = (): boolean => getConfig().isDevelopment;
export const isStaging = (): boolean => getConfig().isStaging;
