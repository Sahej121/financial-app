const { sequelize } = require('../models');

async function syncModel() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Connected to database.');

        console.log('Syncing FinancialPlanningSubmission model...');
        const FinancialPlanningSubmission = sequelize.models.FinancialPlanningSubmission;

        // Sync specifically this model with alter: true
        await FinancialPlanningSubmission.sync({ alter: true });

        console.log('✅ FinancialPlanningSubmission synced successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync failed:', error);
        process.exit(1);
    }
}

syncModel();
