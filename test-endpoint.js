const { User, Meeting, FinancialPlanningSubmission, sequelize } = require('./server/src/models');

async function testEndpoint() {
    try {
        const prof = await User.findOne({ where: { role: 'financial_planner' } });
        if (!prof) {
            console.log('No financial planner found');
            return;
        }
        console.log('Testing with professional:', prof.email);

        const meetings = await Meeting.findAll({
            where: { professionalId: prof.id },
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: FinancialPlanningSubmission,
                    as: 'submission'
                }
            ]
        });

        console.log('Found meetings:', meetings.length);
        console.log('Meetings:', JSON.stringify(meetings, null, 2));
    } catch (error) {
        console.error('Error in test script:', error);
    } finally {
        await sequelize.close();
    }
}

testEndpoint();
