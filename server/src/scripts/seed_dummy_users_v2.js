const { sequelize, User, CA, FinancialPlanner } = require('../models');
const bcrypt = require('bcryptjs');

const seedDummyUsers = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Hash default password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        console.log('Seeding Analysts (Financial Planners)...');
        for (let i = 1; i <= 10; i++) {
            const email = `analyst${i}@financialapp.com`;

            // Check if exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                console.log(`Analyst ${i} already exists, skipping.`);
                continue;
            }

            // Create User
            const user = await User.create({
                name: `Analyst Dummy ${i}`,
                email: email,
                password: hashedPassword,
                role: 'financial_planner',
                phone: `98765432${i.toString().padStart(2, '0')}`,
                isVerified: true
            });

            // Create Financial Planner Profile
            await FinancialPlanner.create({
                userId: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                experience: 5 + i,
                qualifications: ["CFP", "MBA"],
                specializations: i % 2 === 0 ? ["Retirement Planning", "Tax"] : ["Investment", "Wealth Management"],
                description: `Experienced analyst number ${i} specialized in strategic financial planning.`,
                languages: ["English", "Hindi"],
                availability: "Mon-Fri, 9AM - 5PM",
                rating: 4.5 + (i * 0.04),
                aum: 10000000 * i,
                clientsManaged: 10 * i
            });
            console.log(`Created Analyst ${i}`);
        }

        console.log('Seeding Chartered Accountants (CAs)...');
        for (let i = 1; i <= 10; i++) {
            const email = `ca${i}@financialapp.com`;

            // Check if exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                console.log(`CA ${i} already exists, skipping.`);
                continue;
            }

            // Create User
            const user = await User.create({
                name: `CA Dummy ${i}`,
                email: email,
                password: hashedPassword,
                role: 'ca',
                phone: `91234567${i.toString().padStart(2, '0')}`,
                isVerified: true
            });

            // Create CA Profile
            await CA.create({
                userId: user.id,
                name: user.name,
                email: user.email,
                caNumber: `CA${202400 + i}`,
                phone: user.phone,
                experience: 3 + i,
                consultationFee: 1000 + (i * 100),
                specializations: ["GST", "Auditing", "Corporate Tax"],
                description: `Certified CA number ${i} with extensive experience in GST and corporate compliance.`,
                qualifications: ["CA", "B.Com"],
                languages: ["English", "Hindi", "Marathi"],
                availability: "Available Now"
            });
            console.log(`Created CA ${i}`);
        }

        // Create a Standard Client for testing
        const clientEmail = 'client_test@financialapp.com';
        const existingClient = await User.findOne({ where: { email: clientEmail } });
        if (!existingClient) {
            await User.create({
                name: 'Test Client User',
                email: clientEmail,
                password: hashedPassword,
                role: 'user',
                phone: '9988776655',
                isVerified: true
            });
            console.log('Created Test Client User');
        }

        console.log('Seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDummyUsers();
