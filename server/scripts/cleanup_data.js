const fs = require('fs');
const path = require('path');
const {
    sequelize,
    Document,
    DocumentInsight,
    FinancialPlanningSubmission,
    CA,
    FinancialPlanner,
    Meeting,
    User
} = require('../src/models');

async function cleanup() {
    try {
        console.log('Starting cleanup...');

        // 1. Clear Uploads Directory
        const uploadsDir = path.join(__dirname, '../uploads');
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            for (const file of files) {
                if (file === '.gitkeep') continue; // Keep .gitkeep if exists
                fs.unlinkSync(path.join(uploadsDir, file));
            }
            console.log(`Cleared ${files.length} files from uploads directory.`);
        }

        // 2. Clear Database Tables (Truncate)
        console.log('Clearing DocumentInsights...');
        await DocumentInsight.destroy({ where: {}, truncate: false });

        console.log('Clearing Documents...');
        await Document.destroy({ where: {}, truncate: false });

        console.log('Clearing FinancialPlanningSubmissions...');
        await FinancialPlanningSubmission.destroy({ where: {}, truncate: false });

        console.log('Clearing CAs...');
        await CA.destroy({ where: {}, truncate: false });

        console.log('Clearing FinancialPlanners...');
        await FinancialPlanner.destroy({ where: {}, truncate: false });

        console.log('Clearing Meetings...');
        await Meeting.destroy({ where: {}, truncate: false });

        console.log('Clearing Users...');
        await User.destroy({ where: {}, truncate: false });

        console.log('Cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
