const { sequelize } = require('../models');

async function initSchema() {
    try {
        console.log('🔌 Connecting to PostgreSQL...');
        await sequelize.authenticate();
        console.log('✅ Connected successfully.');

        console.log('🏗️  Creating database schema (Tables, Keys, Constraints)...');

        // Using { alter: true } to create tables if they don't exist
        // This will create all tables defined in your models folder
        await sequelize.sync({ alter: true });

        console.log('✅ Schema initialization complete!');
        console.log('   The following tables should now exist:');
        console.log('   - Users');
        console.log('   - FinancialPlanningSubmissions');
        console.log('   - Documents');
        console.log('   - Meetings');
        console.log('   - (and all other defined models)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Schema initialization failed:', error);
        process.exit(1);
    }
}

initSchema();
