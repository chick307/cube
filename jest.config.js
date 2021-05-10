module.exports = {
    collectCoverage: false,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.(js|ts|tsx)',
    ],
    coverageDirectory: '<rootDir>/coverage',
    coveragePathIgnorePatterns: [],
    coverageReporters: ['lcov'],
    preset: 'ts-jest/presets/js-with-ts',
    testMatch: ['<rootDir>/src/**/*.spec.(js|ts|tsx)'],
    transform: {
        '\\.(css)$': '<rootDir>/jest-css-modules-transformer.js',
    },
};
