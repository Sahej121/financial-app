const { DecisionPackService } = require('./src/services/decisionPackService');
const { connectRedis, client } = require('./src/utils/cache');
const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');

async function regenerate(submissionId) {
    try {
        await connectRedis();
        console.log(`Clearing cache for submission ${submissionId}...`);
        await client.del(`decision_pack:${submissionId}`);

        console.log(`Regenerating pack for submission ${submissionId}...`);
        const pack = await require('./src/services/decisionPackService').generatePack(submissionId);

        console.log('Regenerated Summary Length:', pack.demandIntelligence.summary.length);
        console.log('Summary Preview:', pack.demandIntelligence.summary.substring(0, 100) + '...');

        await client.quit();
        process.exit(0);
    } catch (error) {
        console.error('Regeneration failed:', error);
        process.exit(1);
    }
}

const submissionId = process.argv[2] ? parseInt(process.argv[2]) : 28;
regenerate(submissionId);
