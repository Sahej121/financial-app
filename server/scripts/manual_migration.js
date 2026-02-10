const { sequelize } = require('../src/models');

async function manualMigration() {
    console.log('🛠 Starting Manual Migration for Marketplace...');

    try {
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        const queryInterface = sequelize.getQueryInterface();

        // 1. Update FinancialPlanners
        console.log('Running migration for FinancialPlanners...');
        const fpTable = 'FinancialPlanners';

        // Check key columns
        const fpCols = await queryInterface.describeTable(fpTable);

        if (!fpCols.trustScore) {
            await queryInterface.addColumn(fpTable, 'trustScore', { type: 'FLOAT', defaultValue: 50 });
        }
        if (!fpCols.competenceScore) {
            await queryInterface.addColumn(fpTable, 'competenceScore', { type: 'FLOAT', defaultValue: 0 });
        }
        if (!fpCols.responsivenessScore) {
            await queryInterface.addColumn(fpTable, 'responsivenessScore', { type: 'FLOAT', defaultValue: 0 });
        }
        if (!fpCols.outcomeScore) {
            await queryInterface.addColumn(fpTable, 'outcomeScore', { type: 'FLOAT', defaultValue: 0 });
        }
        if (!fpCols.verifiedSpecializations) {
            console.log('Adding verifiedSpecializations to FinancialPlanners...');
            // Using raw query to avoid Sequelize JSON B issue with defaults
            await sequelize.query(`ALTER TABLE "${fpTable}" ADD COLUMN "verifiedSpecializations" JSONB DEFAULT '{}'::jsonb`);
        }
        if (!fpCols.totalCompletedCases) {
            await queryInterface.addColumn(fpTable, 'totalCompletedCases', { type: 'INTEGER', defaultValue: 0 });
        }
        if (!fpCols.consistencyScore) {
            await queryInterface.addColumn(fpTable, 'consistencyScore', { type: 'FLOAT', defaultValue: 0 });
        }


        // 2. Update CAs
        console.log('Running migration for CAs...');
        const caTable = 'CAs';
        try {
            const caCols = await queryInterface.describeTable(caTable);
            if (!caCols.trustScore) {
                await queryInterface.addColumn(caTable, 'trustScore', { type: 'FLOAT', defaultValue: 50 });
            }
            if (!caCols.verifiedSpecializations) {
                console.log('Adding verifiedSpecializations to CAs...');
                await sequelize.query(`ALTER TABLE "${caTable}" ADD COLUMN "verifiedSpecializations" JSONB DEFAULT '{}'::jsonb`);
            }
            if (!caCols.competenceScore) await queryInterface.addColumn(caTable, 'competenceScore', { type: 'FLOAT', defaultValue: 0 });
            if (!caCols.responsivenessScore) await queryInterface.addColumn(caTable, 'responsivenessScore', { type: 'FLOAT', defaultValue: 0 });
            if (!caCols.outcomeScore) await queryInterface.addColumn(caTable, 'outcomeScore', { type: 'FLOAT', defaultValue: 0 });
            if (!caCols.totalCompletedCases) await queryInterface.addColumn(caTable, 'totalCompletedCases', { type: 'INTEGER', defaultValue: 0 });
            if (!caCols.consistencyScore) await queryInterface.addColumn(caTable, 'consistencyScore', { type: 'FLOAT', defaultValue: 0 });

        } catch (e) {
            console.warn('CAs table issue:', e.message);
        }

        // 3. Create OutcomeRecords Table
        console.log('Creating OutcomeRecords table if not exists...');

        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "OutcomeRecords" (
        "id" SERIAL PRIMARY KEY,
        "analystId" INTEGER,
        "clientId" INTEGER,
        "meetingId" INTEGER,
        "submissionId" INTEGER,
        "adviceType" VARCHAR(255),
        "adviceSummary" TEXT,
        "clientConfirmed" BOOLEAN DEFAULT false,
        "outcomeScore" FLOAT,
        "financialImpact" FLOAT,
        "status" VARCHAR(255) DEFAULT 'pending',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

        console.log('✅ Manual Migration Completed Successfully.');

    } catch (error) {
        console.error('❌ Manual Migration Failed:', error);
    } finally {
        process.exit();
    }
}

manualMigration();
