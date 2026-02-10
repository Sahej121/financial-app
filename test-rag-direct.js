const vectorStoreService = require('./server/src/services/vectorStoreService');
const { sequelize } = require('./server/src/models');

async function test() {
    try {
        console.log('Connecting to DB...');
        await sequelize.authenticate();
        console.log('Connected.');

        const submissionId = 1; // Replace with a valid ID if needed, or just 1 to test SQL syntax
        const query = "What is the income?";

        console.log('Testing Search...');
        const results = await vectorStoreService.search(query, submissionId);
        console.log('Search Results:', results);

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await sequelize.close();
    }
}

test();
