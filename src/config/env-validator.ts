import { Logger } from '@nestjs/common';

const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USERNAME',
    'DB_PASSWORD',
    'DB_DATABASE',
    'DB_SCHEMA',
    'JWT_SECRET',
    'PORT'
];

export function validateEnvVars() {
    const logger = new Logger('EnvValidator');
    const missingVars = [];

    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            missingVars.push(envVar);
        }
    });

    if (missingVars.length > 0) {
        logger.error(`Required environment variables are missing: ${missingVars.join(', ')}`);
        throw new Error(`Required environment variables are missing: ${missingVars.join(', ')}`);
    }

    logger.log('All required environment variables are set correctly');
}

