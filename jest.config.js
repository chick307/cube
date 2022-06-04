export default {
    collectCoverage: false,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.(js|ts|tsx)',
    ],
    coverageDirectory: '<rootDir>/coverage',
    coveragePathIgnorePatterns: [
        '\\.test-helper\\.(?:js|ts|tsx)$',
    ],
    coverageReporters: ['lcov'],
    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jest-environment-jsdom',
    testMatch: ['<rootDir>/src/**/*.spec.(js|ts|tsx)'],
    transform: {
        '\\.css$': '<rootDir>/jest-css-modules-transformer.js',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!.*\\.css$)',
    ],
    setupFiles: [
        '<rootDir>/jest-setup.js',
    ],
};
