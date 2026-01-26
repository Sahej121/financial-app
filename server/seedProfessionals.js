const { CA, FinancialPlanner, User, sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');

const seedProfessionals = async () => {
    try {
        await sequelize.sync();
        const password = await bcrypt.hash('password123', 10);

        // Seed CAs
        const cas = [
            {
                name: "CA Rahul Sharma",
                email: "rahul.sharma@example.com",
                caNumber: "ICA12345",
                phone: "9876543210",
                experience: 8,
                consultationFee: 1500,
                rating: 4.8,
                specializations: ["Tax Planning", "Business Advisory"],
                description: "Experienced CA with expertise in tax planning and business advisory services.",
                qualifications: ["FCA", "DISA"],
                languages: ["English", "Hindi"],
                availability: "Available Now",
                isActive: true
            },
            {
                name: "CA Priya Patel",
                email: "priya.patel@example.com",
                caNumber: "ICA67890",
                phone: "9876543211",
                experience: 12,
                consultationFee: 2000,
                rating: 4.9,
                specializations: ["Corporate Finance", "Audit"],
                description: "Senior CA with focus on corporate finance and statutory audits.",
                qualifications: ["FCA", "CPA"],
                languages: ["English", "Hindi", "Gujarati"],
                availability: "Available in 1 hour",
                isActive: true
            },
            {
                name: "CA Amit Kumar",
                email: "amit.kumar@example.com",
                caNumber: "ICA11223",
                phone: "9876543212",
                experience: 15,
                consultationFee: 2500,
                rating: 4.7,
                specializations: ["GST", "International Taxation"],
                description: "GST expert with extensive experience in international taxation.",
                qualifications: ["FCA", "LLB"],
                languages: ["English", "Hindi", "Bengali"],
                availability: "Available Now",
                isActive: true
            }
        ];

        for (const caData of cas) {
            // 1. Create User account first
            const [user] = await User.findOrCreate({
                where: { email: caData.email },
                defaults: {
                    name: caData.name,
                    email: caData.email,
                    password: password,
                    role: 'ca'
                }
            });

            // 2. Create CA record linked to User
            await CA.findOrCreate({
                where: { email: caData.email },
                defaults: { ...caData, userId: user.id }
            });

            // Ensure existing CAs have the userId set if they were seeded without it
            const existingCA = await CA.findOne({ where: { email: caData.email } });
            if (existingCA && !existingCA.userId) {
                await existingCA.update({ userId: user.id });
            }
        }

        // Seed Financial Planners
        const planners = [
            {
                name: "John Doe",
                email: "john.doe@example.com",
                phone: "9876543001",
                experience: 10,
                qualifications: ["CFP", "MBA Finance"],
                specializations: ["Wealth Creation", "Retirement Planning"],
                description: "Top-rated wealth architect with over 10 years of experience.",
                languages: ["English"],
                availability: "Mon, Wed, Fri",
                rating: 4.9,
                isActive: true
            }
        ];

        for (const plannerData of planners) {
            const [user] = await User.findOrCreate({
                where: { email: plannerData.email },
                defaults: {
                    name: plannerData.name,
                    email: plannerData.email,
                    password: password,
                    role: 'financial_planner'
                }
            });

            await FinancialPlanner.findOrCreate({
                where: { email: plannerData.email },
                defaults: { ...plannerData, userId: user.id }
            });

            const existingFP = await FinancialPlanner.findOne({ where: { email: plannerData.email } });
            if (existingFP && !existingFP.userId) {
                await existingFP.update({ userId: user.id });
            }
        }

        // Seed Standard Test User
        await User.findOrCreate({
            where: { email: 'user1234@gmail.com' },
            defaults: {
                name: 'Standard User',
                email: 'user1234@gmail.com',
                password: password,
                role: 'user'
            }
        });

        console.log('Professionals and Test User accounts seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding professionals:', error);
        process.exit(1);
    }
};

seedProfessionals();
