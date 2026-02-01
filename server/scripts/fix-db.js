const { sequelize } = require('../src/models');
const { QueryInterface, DataTypes } = require('sequelize');

async function fixDatabase() {
    console.log('--- STARTING DATABASE FIX SCRIPT ---');
    const queryInterface = sequelize.getQueryInterface();
    const tableName = 'Users';

    try {
        // Check what columns exist
        const tableInfo = await queryInterface.describeTable(tableName);
        const existingColumns = Object.keys(tableInfo);
        console.log('Existing columns:', existingColumns.join(', '));

        const columnsToAdd = [
            { name: 'otpCode', type: DataTypes.STRING, options: { allowNull: true } },
            { name: 'otpExpire', type: DataTypes.DATE, options: { allowNull: true } },
            { name: 'isVerified', type: DataTypes.BOOLEAN, options: { defaultValue: false, allowNull: false } }
        ];

        for (const col of columnsToAdd) {
            if (!existingColumns.includes(col.name)) {
                console.log(`Adding column: ${col.name}...`);
                await queryInterface.addColumn(tableName, col.name, {
                    type: col.type,
                    ...col.options
                });
                console.log(`   - Column ${col.name} added.`);
            } else {
                console.log(`Column ${col.name} already exists. Skipping.`);
            }
        }

        console.log('--- DATABASE FIX COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (error) {
        console.error('--- ERROR DURING DATABASE FIX ---');
        console.error(error);
        process.exit(1);
    }
}

fixDatabase();
