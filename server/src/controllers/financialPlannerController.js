const { FinancialPlanner, User, Meeting, FinancialPlanningSubmission, sequelize } = require('../models');
const { Op } = require('sequelize');

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

exports.getFinancialPlanners = async (req, res) => {
    try {
        const planners = await FinancialPlanner.findAll({
            where: { isActive: true },
            order: [['rating', 'DESC']]
        });
        res.json(planners);
    } catch (error) {
        console.error('Error getting financial planners:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAnalystStats = async (req, res) => {
    try {
        const professionalId = req.user?.id;
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        // Helper function to get month name
        const getMonthName = (date) => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months[date.getMonth()];
        };

        // 1. Get all meetings for this professional (or all if admin)
        const meetingWhere = professionalId ? { professionalId } : {};

        // Total unique clients from meetings
        const clientMeetings = await Meeting.findAll({
            where: meetingWhere,
            attributes: ['clientId'],
            group: ['clientId'],
            raw: true
        });
        const totalClients = clientMeetings.length;

        // Active clients (had meeting in last 3 months)
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const activeClientMeetings = await Meeting.findAll({
            where: {
                ...meetingWhere,
                startsAt: { [Op.gte]: threeMonthsAgo }
            },
            attributes: ['clientId'],
            group: ['clientId'],
            raw: true
        });
        const activeClients = activeClientMeetings.length;

        // Upcoming meetings (scheduled, future)
        const upcomingMeetingsCount = await Meeting.count({
            where: {
                ...meetingWhere,
                startsAt: { [Op.gt]: now },
                status: { [Op.in]: ['scheduled', 'confirmed'] }
            }
        });

        // Client satisfaction (average meeting rating)
        const ratingResult = await Meeting.findOne({
            where: {
                ...meetingWhere,
                rating: { [Op.ne]: null }
            },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
                [sequelize.fn('COUNT', sequelize.col('rating')), 'ratingCount']
            ],
            raw: true
        });
        const clientSatisfaction = ratingResult?.avgRating
            ? parseFloat(parseFloat(ratingResult.avgRating).toFixed(1))
            : 4.5; // Default if no ratings yet

        // 2. AUM Calculation - sum of targetAmount from financial planning submissions
        // linked to meetings for this professional
        const submissionIds = await Meeting.findAll({
            where: {
                ...meetingWhere,
                submissionId: { [Op.ne]: null }
            },
            attributes: ['submissionId'],
            raw: true
        });

        let aum = 0;
        if (submissionIds.length > 0) {
            const aumResult = await FinancialPlanningSubmission.findOne({
                where: {
                    id: { [Op.in]: submissionIds.map(s => s.submissionId) }
                },
                attributes: [[sequelize.fn('SUM', sequelize.col('targetAmount')), 'totalAum']],
                raw: true
            });
            aum = parseFloat(aumResult?.totalAum) || 0;
        }

        // If no AUM from submissions, try to get from FinancialPlanner profile
        if (aum === 0 && professionalId) {
            const plannerProfile = await FinancialPlanner.findOne({
                where: { userId: professionalId }
            });
            aum = parseFloat(plannerProfile?.aum) || 0;
        }

        // 3. AUM History - aggregate submissions by month for last 6 months
        const aumHistory = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

            const monthAum = await FinancialPlanningSubmission.findOne({
                where: {
                    createdAt: { [Op.between]: [sixMonthsAgo, monthEnd] }
                },
                attributes: [[sequelize.fn('SUM', sequelize.col('targetAmount')), 'cumulative']],
                raw: true
            });

            aumHistory.push({
                month: getMonthName(monthStart),
                value: parseFloat(monthAum?.cumulative) || 0
            });
        }

        // 4. Portfolio Allocation (Legacy primaryGoal breakdown removed)
        const portfolioAllocation = [
            { type: 'Wealth Growth', value: 40 },
            { type: 'Retirement', value: 30 },
            { type: 'Tax Planning', value: 20 },
            { type: 'Real Estate', value: 10 }
        ];

        // If no data, provide default allocation
        if (portfolioAllocation.length === 0) {
            portfolioAllocation.push(
                { type: 'Equity', value: 40 },
                { type: 'Debt', value: 30 },
                { type: 'Tax Planning', value: 20 },
                { type: 'Other', value: 10 }
            );
        }

        // 5. Client Acquisition - new clients per month
        const clientAcquisition = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

            const newClients = await Meeting.count({
                where: {
                    ...meetingWhere,
                    createdAt: { [Op.between]: [monthStart, monthEnd] }
                },
                distinct: true,
                col: 'clientId'
            });

            clientAcquisition.push({
                month: getMonthName(monthStart),
                new: newClients
            });
        }

        // 6. Calculate AUM Growth (compare current month to previous)
        const currentMonthAum = aumHistory[aumHistory.length - 1]?.value || 0;
        const previousMonthAum = aumHistory[aumHistory.length - 2]?.value || 1; // Avoid division by zero
        const aumGrowth = previousMonthAum > 0
            ? parseFloat(((currentMonthAum - previousMonthAum) / previousMonthAum * 100).toFixed(1))
            : 0;

        const stats = {
            aum,
            aumGrowth,
            totalClients,
            activeClients,
            clientSatisfaction,
            upcomingMeetings: upcomingMeetingsCount,
            aumHistory,
            portfolioAllocation,
            clientAcquisition
        };

        res.json(stats);
    } catch (error) {
        console.error('Error getting analyst stats:', error);
        res.status(500).json({ error: error.message });
    }
};
