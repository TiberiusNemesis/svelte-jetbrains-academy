export default {
  testEnvironment: 'jsdom',
  // Load Svelte's browser build, not its server build.
  testEnvironmentOptions: { customExportConditions: ['browser'] },
  testMatch: ['**/test/*.js'],
  transform: { '\\.svelte(\\.js)?$': '<rootDir>/utils/svelte-jest.js' },
  // @testing-library/svelte ships uncompiled .svelte files.
  transformIgnorePatterns: ['/node_modules/(?!@testing-library/svelte-core)'],
  moduleFileExtensions: ['js', 'svelte'],
  extensionsToTreatAsEsm: ['.svelte'],
  moduleNameMapper: { '^#utils/(.*)$': '<rootDir>/utils/$1' },
  setupFilesAfterEnv: ['@testing-library/jest-dom/jest-globals'],
};
