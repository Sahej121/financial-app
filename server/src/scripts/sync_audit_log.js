const { sequelize } = require('../models');

async function syncAuditLog() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Connected to database.');

        console.log('Syncing DecisionAuditLog model...');
        const DecisionAuditLog = sequelize.models.DecisionAuditLog;

        if (!DecisionAuditLog) {
            console.error('❌ DecisionAuditLog model not found in sequelize.models');
            process.exit(1);
        }

        // Sync specifically this model with alter: true
        await DecisionAuditLog.sync({ alter: true });

        console.log('✅ DecisionAuditLog synced successfully (schema updated)!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncAuditLog();
