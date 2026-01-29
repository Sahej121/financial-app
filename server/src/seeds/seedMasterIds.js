const { CA, FinancialPlanner, User, sequelize } = require('../models');
const bcrypt = require('bcryptjs');

const seedMasterIds = async () => {
    try {
        await sequelize.sync();
        const password = await bcrypt.hash('123456', 10);

        const masterAccounts = [
            {
                name: "Master User",
                email: "user1@test.com",
                password: password,
                role: 'user'
            },
            {
                name: "Master Analyst",
                email: "analyst@test.com",
                password: password,
                role: 'financial_planner'
            },
            {
                name: "Master CA",
                email: "ca@test.com",
                password: password,
                role: 'ca'
            }
        ];

        for (const account of masterAccounts) {
            const [user, created] = await User.findOrCreate({
                where: { email: account.email },
                defaults: account
            });

            if (!created) {
                // Update existing user password just in case
                await user.update({ password: account.password, role: account.role });
                console.log(`Updated existing user: ${account.email}`);
            } else {
                console.log(`Created new master user: ${account.email}`);
            }

            // Create supplementary records for CA and Analyst
            if (account.role === 'ca') {
                await CA.findOrCreate({
                    where: { email: account.email },
                    defaults: {
                        name: account.name,
                        email: account.email,
                        caNumber: "MASTER-CA-001",
                        phone: "0000000000",
                        experience: 10,
                        consultationFee: 1000,
                        rating: 5.0,
                        specializations: ["Tax", "Audit"],
                        description: "Master CA Account",
                        qualifications: ["FCA"],
                        languages: ["English", "Hindi"],
                        availability: "Always",
                        isActive: true,
                        userId: user.id
                    }
                });
            } else if (account.role === 'financial_planner') {
                await FinancialPlanner.findOrCreate({
                    where: { email: account.email },
                    defaults: {
                        name: account.name,
                        email: account.email,
                        phone: "0000000000",
                        experience: 10,
                        qualifications: ["CFP"],
                        specializations: ["Wealth Management"],
                        description: "Master Analyst Account",
                        languages: ["English", "Hindi"],
                        availability: "Always",
                        rating: 5.0,
                        isActive: true,
                        userId: user.id
                    }
                });
            }
        }

        console.log('Master IDs seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding master IDs:', error);
        process.exit(1);
    }
};

seedMasterIds();
