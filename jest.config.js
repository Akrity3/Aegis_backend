/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/globalSetup.ts'],
  // Map mongoose to our manual mock to prevent Schema.pre errors
  moduleNameMapper: {
    '^mongoose$': '<rootDir>/src/__mocks__/mongoose.ts',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html'],
  coverageThreshold: {
    global: {
      statements: 10,
      branches: 10,
      functions: 10,
      lines: 10,
    },
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
