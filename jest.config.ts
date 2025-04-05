import type { Config } from 'jest';

export default async (): Promise<Config> => {
    return {
        verbose: true,
        moduleFileExtensions: ['js', 'json', 'ts'],
        rootDir: './',
        testEnvironment: 'node',
        testRegex: '(/tests/.*|(\.|/)(test|spec))\.ts$',
        transform: {
            '^.+\.(t|j)s$': 'ts-jest'
        },
        collectCoverage: true,
        coverageDirectory: '../coverage',
        coverageProvider: 'v8',
        coverageReporters: ['html', 'text-summary', 'lcov'],
        coveragePathIgnorePatterns: [
            '/node_modules/',
            '/dist/',
            '/coverage/',
        ]
    };
};