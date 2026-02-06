const { sequelize } = require('../src/models');
const redis = require('../src/utils/cache');

beforeAll(async () => {
    // Ensure we are in a test environment
    process.env.NODE_ENV = 'test';

    // Use a different DB for tests if possible, or just sync.
    // For now, we will assume the existing dev DB but handle cleanup.
    await sequelize.sync({ force: false }); // Don't wipe unless necessary for now
});

afterAll(async () => {
    // Close DB connection
    await sequelize.close();

    // Close Redis connection
    if (redis && redis.disconnect) {
        await redis.disconnect();
    } else if (redis && redis.quit) {
        await redis.quit();
    }
});
