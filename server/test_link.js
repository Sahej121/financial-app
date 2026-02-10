const { Document } = require('./src/models');
const { Op } = require('sequelize');

async function testLink() {
    const documentIds = [48, 50, 52];
    const submissionId = 30;
    const userId = 23;

    try {
        console.log(`Linking documents ${documentIds} to submission ${submissionId} for user ${userId}`);
        const [updatedCount] = await Document.update(
            { submissionId: submissionId },
            {
                where: {
                    id: { [Op.in]: documentIds },
                    userId: userId
                }
            }
        );
        console.log(`Updated ${updatedCount} documents`);

        const docs = await Document.findAll({ where: { id: { [Op.in]: documentIds } } });
        docs.forEach(d => console.log(`Doc ${d.id} submissionId: ${d.submissionId}`));
    } catch (err) {
        console.error('Test link failed:', err);
    }
}

testLink();
