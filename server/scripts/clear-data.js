const fs = require('fs');
const path = require('path');
const { Document, DocumentInsight, ActivityLog, sequelize } = require('../src/models');

/**
 * Script to clear all user uploads and related database entries.
 * CAUTION: This action is irreversible.
 */
async function clearData() {
    const uploadsDir = path.join(__dirname, '../uploads');

    console.log('--- STARTING DATA CLEARING PROCESS ---');

    try {
        // 1. Clear Database Records
        console.log('1. Clearing database records...');

        // Clear DocumentInsights
        const insightsCount = await DocumentInsight.destroy({ where: {}, truncate: false });
        console.log(`   - Deleted ${insightsCount} document insights.`);

        // Clear Document Records
        const docsCount = await Document.destroy({ where: {}, truncate: false });
        console.log(`   - Deleted ${docsCount} document records.`);

        // Clear relevant Activity Logs
        const activitiesCount = await ActivityLog.destroy({
            where: {
                action: ['DOCUMENT_UPLOAD', 'DOCUMENT_ANALYSIS', 'DOCUMENT_STATUS_UPDATE']
            },
            truncate: false
        });
        console.log(`   - Deleted ${activitiesCount} related activity logs.`);

        // 2. Clear Physical Files
        console.log('2. Clearing physical files in uploads directory...');

        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            let deletedFilesCount = 0;

            for (const file of files) {
                if (file === '.gitkeep' || file === '.DS_Store') continue;

                const filePath = path.join(uploadsDir, file);
                if (fs.statSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                    deletedFilesCount++;
                }
            }
            console.log(`   - Deleted ${deletedFilesCount} files.`);
        } else {
            console.log('   - Uploads directory does not exist. Skipping.');
        }

        console.log('--- DATA CLEARING COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (error) {
        console.error('--- ERROR DURING DATA CLEARING ---');
        console.error(error);
        process.exit(1);
    }
}

clearData();
