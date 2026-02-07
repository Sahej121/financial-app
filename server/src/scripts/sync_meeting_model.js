const { sequelize, Meeting } = require('../models');

async function syncMeetingModel() {
    try {
        console.log('🔌 Connecting to PostgreSQL...');
        await sequelize.authenticate();
        console.log('✅ Connected successfully.');

        console.log('🏗️  Syncing Meeting model...');

        // Sync only the Meeting model
        await Meeting.sync({ alter: true });

        console.log('✅ Meeting model synced successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncMeetingModel();
