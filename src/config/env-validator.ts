import { Logger } from '@nestjs/common';

const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
    'DB_SCHEMA',
    'JWT_SECRET',
    'PORT',
    'CORS_ORIGINS'
];

/**
 * Validates that all required environment variables are set.
 * Throws an error if any required variable is missing.
 */
export function validateEnvVars() {
    const logger = new Logger('EnvValidator');
    const missingVars = [];

    // Check if any required environment variable is missing
    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            missingVars.push(envVar);
        }
    });

    // If any required variable is missing, throw an error
    if (missingVars.length > 0) {
        logger.error(`Required environment variables are missing: ${missingVars.join(', ')}`);
        throw new Error(`Required environment variables are missing: ${missingVars.join(', ')}`);
    }

    logger.log('All required environment variables are set correctly');
}

