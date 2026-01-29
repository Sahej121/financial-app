const models = require('./src/models');
const { hsnCodes } = require('./src/seeds/hsnCodes');
const { seedHSNCodes } = require('./src/seeds/seedHSNCodes');

async function runSeeder() {
    try {
        await models.sequelize.authenticate();
        console.log('Connected to database');

        await seedHSNCodes(models);

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

runSeeder();
