module.exports = {
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./test/setup.js'],
    verbose: true,
    testMatch: ['**/*.test.js'],
    transform: {}, // Disable transforms for now as we are using CommonJS
};
