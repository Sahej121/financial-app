const { sequelize } = require('../src/models');

async function fixSchema() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableReq = await queryInterface.describeTable('meetings');

        if (!tableReq.transactionId) {
            console.log('Adding transactionId column to meetings table...');
            await queryInterface.addColumn('meetings', 'transactionId', {
                type: sequelize.Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'transactions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            });
            console.log('Column added successfully.');
        } else {
            console.log('transactionId column already exists in meetings table.');
        }
    } catch (error) {
        console.error('Error fixing schema:', error);
    } finally {
        await sequelize.close();
    }
}

fixSchema();
