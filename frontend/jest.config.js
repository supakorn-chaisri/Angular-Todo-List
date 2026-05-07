const { createCjsPreset } = require('jest-preset-angular/presets');

module.exports = {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/cypress/'
  ],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^app/(.*)$': '<rootDir>/src/app/$1'
  }
};
