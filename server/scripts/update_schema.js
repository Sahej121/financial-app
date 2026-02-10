const { sequelize } = require('../src/models');

async function updateSchema() {
    console.log('🔄 Starting Database Schema Update...');
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        console.log('⏳ Syncing schema with { alter: true }...');
        await sequelize.sync({ alter: true });

        console.log('✅ Schema updated successfully!');
    } catch (error) {
        console.error('❌ Schema update failed:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

updateSchema();
