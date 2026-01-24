const { FinancialPlanner, User } = require('../models');

exports.createFinancialPlanner = async (req, res) => {
    try {
        const plannerData = req.body;
        console.log('Creating Financial Planner Profile:', plannerData);

        // Basic validation
        if (!plannerData.email || !plannerData.name) {
            return res.status(400).json({ error: 'Name and Email are required' });
        }

        // Check if profile already exists
        const existing = await FinancialPlanner.findOne({ where: { email: plannerData.email } });
        if (existing) {
            return res.status(400).json({ error: 'Financial Planner profile already exists for this email' });
        }

        const planner = await FinancialPlanner.create(plannerData);
        res.status(201).json(planner);
    } catch (error) {
        console.error('Error createFinancialPlanner:', error);
        res.status(400).json({ error: error.message });
    }
};

exports.getAnalystStats = async (req, res) => {
    try {
        // Mock data generation for the "Power BI" charts
        // In a real app, this would aggregate from meetings/clients tables
        const stats = {
            aum: 12500000, // 1.25 Cr
            aumGrowth: 12.5, // %
            totalClients: 48,
            activeClients: 35,
            clientSatisfaction: 4.9,
            upcomingMeetings: 8,

            // Chart Data: AUM over time
            aumHistory: [
                { month: 'Jan', value: 8500000 },
                { month: 'Feb', value: 9200000 },
                { month: 'Mar', value: 9800000 },
                { month: 'Apr', value: 10500000 },
                { month: 'May', value: 11200000 },
                { month: 'Jun', value: 12500000 },
            ],

            // Chart Data: Portfolio Allocation
            portfolioAllocation: [
                { type: 'Equity', value: 45 },
                { type: 'Debt', value: 30 },
                { type: 'Gold', value: 10 },
                { type: 'Real Estate', value: 15 },
            ],

            // Chart Data: Client Acquisition
            clientAcquisition: [
                { month: 'Jan', new: 2 },
                { month: 'Feb', new: 3 },
                { month: 'Mar', new: 5 },
                { month: 'Apr', new: 4 },
                { month: 'May', new: 6 },
                { month: 'Jun', new: 8 },
            ]
        };

        res.json(stats);
    } catch (error) {
        console.error('Error getting analyst stats:', error);
        res.status(500).json({ error: error.message });
    }
};
