export default {
    testEnvironment: 'jsdom',
    moduleDirectories: ['node_modules', 'js'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    transform: {}, // This tells Jest not to transform your files
    extensionsToTreatAsEsm: ['.js'],
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
  };