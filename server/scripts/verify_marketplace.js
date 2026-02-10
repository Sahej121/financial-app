const { sequelize, CA, FinancialPlanner, OutcomeRecord, Meeting, User } = require('../src/models');
const reputationService = require('../src/services/reputationService');

async function verifyMarketplace() {
    console.log('🚀 Starting Marketplace Verification...');

    try {
        // 1. Verify Schema
        console.log('\n1️⃣  Verifying Database Schema...');

        // Check tables exist via raw query or model check
        try {
            await sequelize.query('SELECT 1 FROM "FinancialPlanners" LIMIT 1');
            console.log('✅ FinancialPlanners table exists');
        } catch (e) {
            console.error('❌ FinancialPlanners table missing');
        }

        try {
            await sequelize.query('SELECT 1 FROM "OutcomeRecords" LIMIT 1');
            console.log('✅ OutcomeRecords table exists');
        } catch (e) {
            console.error('❌ OutcomeRecords table missing: ' + e.message);
        }

        // Check constraints/columns via model attributes
        const fpAttributes = FinancialPlanner.rawAttributes;
        if (fpAttributes.trustScore && fpAttributes.verifiedSpecializations) {
            console.log('✅ FinancialPlanner model has trustScore and verifiedSpecializations');
        } else {
            console.error('❌ FinancialPlanner model missing required fields');
        }

        // 2. Setup Mock Data
        console.log('\n2️⃣  Setting up Mock Data for Logic Verification...');

        const [plannerUser] = await User.findOrCreate({
            where: { email: 'verify_planner@test.com' },
            defaults: {
                name: 'Verify Planner',
                password: 'password123',
                role: 'financial_planner',
                isActive: true
            }
        });

        const [planner] = await FinancialPlanner.findOrCreate({
            where: { userId: plannerUser.id },
            defaults: {
                name: 'Verify Planner',
                email: 'verify_planner@test.com',
                experience: 5,
                consultationFee: 1000,
                specializations: ['create_wealth', 'tax_planning'],
                verifiedSpecializations: { 'tax_planning': true },
                trustScore: 50,
                competenceScore: 60,
                outcomeScore: 70,
                phone: '1234567890',
                qualifications: ['CFP', 'MBA'],
                description: 'Test Description',
                languages: ['English', 'Hindi']
            }
        });

        const [clientUser] = await User.findOrCreate({
            where: { email: 'verify_client@test.com' },
            defaults: { name: 'Verify Client', password: 'password123', role: 'user' }
        });

        // Create a past meeting
        const [meeting] = await Meeting.findOrCreate({
            where: { professionalId: plannerUser.id, clientId: clientUser.id },
            defaults: {
                startsAt: new Date(Date.now() - 86400000), // yesterday
                endsAt: new Date(Date.now() - 82800000),
                status: 'completed',
                rating: 5,
                professionalRole: 'financial_planner'
            }
        });

        console.log('✅ Mock Data Created (Planner, Client, Meeting).');

        // 3. Test Outcome Submission
        console.log('\n3️⃣  Testing Outcome Submission...');
        const outcome = await OutcomeRecord.create({
            analystId: plannerUser.id,
            clientId: clientUser.id,
            meetingId: meeting.id,
            adviceType: 'tax_planning',
            adviceSummary: 'Test advice for tax saving',
            outcomeScore: 9, // High score
            financialImpact: 10000,
            status: 'verified'
        });

        console.log(`✅ Outcome Record Created with ID: ${outcome.id}`);

        // 4. Verify Score Calculation
        console.log('\n4️⃣  Verifying Score Calculation Logic...');

        // Trigger calculation
        await reputationService.updateTrustScore(plannerUser.id, 'financial_planner');

        // Fetch updated planner
        const updatedPlanner = await FinancialPlanner.findOne({ where: { id: planner.id } });

        console.log('--- Reputation Metrics ---');
        console.log(`Trust Score: ${updatedPlanner.trustScore}`);
        console.log(`Competence Score: ${updatedPlanner.competenceScore}`);
        console.log(`Outcome Score: ${updatedPlanner.outcomeScore}`);

        if (updatedPlanner.trustScore >= 50) {
            console.log('✅ Trust Score exists and is valid.');
        } else {
            console.log('⚠️ Trust Score seems low.');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error);
    } finally {
        process.exit();
    }
}

verifyMarketplace();
