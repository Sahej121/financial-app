const { sequelize, User, CA, FinancialPlanner } = require('../models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        console.log('🔌 Connecting to Database...');
        await sequelize.authenticate();
        console.log('✅ Database connected.');

        // NUCLEAR RESET: Drop the public schema and recreate it
        console.log('☢️  Resetting database (dropping schema public)...');
        await sequelize.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
        console.log('✅ Public schema reset.');

        // Re-sync schema to create all tables
        console.log('🏗️  Syncing schema...');
        await sequelize.sync();
        console.log('✅ Schema synchronization complete.');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        console.log('👤 Seeding 5 Analysts...');
        for (let i = 1; i <= 5; i++) {
            const email = `analyst${i}@test.com`;
            const user = await User.create({
                name: `Analyst ${i}`,
                email: email,
                password: hashedPassword,
                role: 'financial_planner',
                phone: `900000010${i}`,
                isVerified: true
            });

            await FinancialPlanner.create({
                userId: user.id,
                name: user.name,
                email: user.email,
                phone: `900000010${i}`,
                experience: 5 + i,
                qualifications: ["CFP", "MBA"],
                specializations: ["Wealth Management", "Tax Planning"],
                description: `Expert analyst ${i} with 10+ years of experience in market analysis and goal-based planning.`,
                languages: ["English", "Hindi"],
                availability: "Mon-Fri, 9AM-6PM",
                rating: 4.8,
                aum: 1000000 * i,
                clientsManaged: 20 + i
            });
            console.log(`   - Created Analyst: ${email}`);
        }

        console.log('👨‍💼 Seeding 5 CAs...');
        for (let i = 1; i <= 5; i++) {
            const email = `ca${i}@test.com`;
            const user = await User.create({
                name: `CA ${i}`,
                email: email,
                password: hashedPassword,
                role: 'ca',
                phone: `900000020${i}`,
                isVerified: true
            });

            await CA.create({
                userId: user.id,
                name: user.name,
                email: user.email,
                caNumber: `CANUM${1000 + i}`,
                phone: `900000020${i}`,
                experience: 4 + i,
                consultationFee: 1500,
                specializations: ["GST Compliance", "Statutory Audit"],
                description: `Professional Chartered Accountant ${i} specializing in tax optimization and corporate compliance.`,
                qualifications: ["CA", "ICWA"],
                languages: ["English", "Hindi", "Gujarati"],
                availability: "Currently Online"
            });
            console.log(`   - Created CA: ${email}`);
        }

        console.log('👥 Seeding 2 Users...');
        for (let i = 1; i <= 2; i++) {
            const email = `user${i}@test.com`;
            await User.create({
                name: `Test User ${i}`,
                email: email,
                password: hashedPassword,
                role: 'user',
                phone: `900000030${i}`,
                isVerified: true
            });
            console.log(`   - Created User: ${email}`);
        }

        console.log('✨ Seeding complete successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedData();
