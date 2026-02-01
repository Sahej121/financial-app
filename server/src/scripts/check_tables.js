const { sequelize } = require('../models');

async function checkTables() {
    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL.');

        const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

        console.log('Existing tables:');
        results.forEach(r => console.log(' - ' + r.table_name));

        process.exit(0);
    } catch (error) {
        console.error('Failed to check tables:', error);
        process.exit(1);
    }
}

checkTables();
