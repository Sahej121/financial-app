const { sequelize } = require('../models');

async function dropTable() {
    try {
        console.log('🔌 Connecting to PostgreSQL...');
        await sequelize.authenticate();

        console.log('🗑️  Dropping table "financial_planning_submissions" with CASCADE...');
        // Use raw query for CASCADE drop
        await sequelize.query('DROP TABLE IF EXISTS "financial_planning_submissions" CASCADE;');

        console.log('✅ Table dropped. Restart server to recreate it.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to drop table:', error);
        process.exit(1);
    }
}

dropTable();
