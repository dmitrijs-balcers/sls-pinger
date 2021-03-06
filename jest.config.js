module.exports = {
  moduleNameMapper: {
    '__fixtures__(.*)': '<rootDir>/__fixtures__/$1',
  },
  modulePathIgnorePatterns: ['/.serverless/'],
  setupFiles: ['jest-canvas-mock', './jest.setup.js'],
};
