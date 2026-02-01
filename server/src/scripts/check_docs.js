const { sequelize, Document } = require('../models');

async function checkDocs() {
    try {
        await sequelize.authenticate();
        const docs = await Document.findAll({
            limit: 5,
            order: [['uploadedAt', 'DESC']]
        });
        console.log('Recent Documents:');
        docs.forEach(d => {
            console.log(` - ID: ${d.id}, File: ${d.fileName}, Status: ${d.status}, AI: ${d.aiProcessingStatus}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Failed to check documents:', error);
        process.exit(1);
    }
}

checkDocs();
