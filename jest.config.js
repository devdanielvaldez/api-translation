module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/index.js',
      '!**/node_modules/**'
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true
  };