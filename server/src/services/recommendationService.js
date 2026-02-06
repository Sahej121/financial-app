const { CA, FinancialPlanner } = require('../models');

class RecommendationService {

    /**
     * Recommend CAs based on User Mission (Planning Purpose)
     * Strategy:
     * - 'tax_planning': Prioritize 'Tax', 'GST', 'Audit'
     * - 'business_expansion': Prioritize 'Compliance', 'Audit', 'Company Law'
     * - 'loan_settlement': Prioritize 'Debt', 'Legal', 'Forensic'
     */
    async recommendCAs(userProfile) {
        const CAs = await CA.findAll({ where: { isActive: true } });
        const purpose = userProfile.planningPurpose || 'general';

        // Define keywords for scoring
        const keywords = {
            tax_planning: ['Tax', 'GST', 'Audit', 'Returns', 'ITR'],
            business_expansion: ['Compliance', 'Audit', 'Company Law', 'Legal', 'Startup'],
            loan_settlement: ['Debt', 'Legal', 'Forensic', 'Restructuring', 'Insolvency'],
            general: []
        };
        const targetKeywords = keywords[purpose] || [];

        // Score CAs
        const scoredCAs = CAs.map(ca => {
            const caJson = ca.toJSON ? ca.toJSON() : ca;
            let score = 0;

            // 1. Specialization Match (High Weight)
            const specs = Array.isArray(caJson.specializations) ? caJson.specializations : [];
            const matches = specs.filter(s => targetKeywords.some(k => s.includes(k)));
            score += matches.length * 10;

            // 2. Rating Boost
            score += (parseFloat(caJson.rating) || 0) * 2;

            // 3. Experience Boost (0.5 per year)
            score += (caJson.experience || 0) * 0.5;

            return { ...caJson, matchScore: score };
        });

        // Sort by Score Descending
        return scoredCAs.sort((a, b) => b.matchScore - a.matchScore);
    }

    /**
     * Recommend Financial Planners
     * Strategy:
     * - Income Tier Matching (High income -> High AUM/Experience planners)
     * - Purpose Matching: 'investment' -> 'Wealth', 'retirement' -> 'Retirement'
     */
    async recommendPlanners(userProfile) {
        const planners = await FinancialPlanner.findAll({ where: { isActive: true } });
        const purpose = userProfile.planningPurpose || 'investment';
        const income = parseFloat(userProfile.monthlyIncome || 0);

        const keywords = {
            investment: ['Wealth', 'Portfolio', 'Mutual Funds', 'Stocks'],
            retirement: ['Retirement', 'Pension', 'Estate'],
            tax_planning: ['Tax', 'Savings'],
            business_expansion: ['Business', 'Growth']
        };
        const targetKeywords = keywords[purpose] || [];

        const scoredPlanners = planners.map(planner => {
            const pJson = planner.toJSON ? planner.toJSON() : planner;
            let score = 0;

            // 1. Specialization Match
            const specs = Array.isArray(pJson.specializations) ? pJson.specializations : [];
            const matches = specs.filter(s => targetKeywords.some(k => s.includes(k)));
            score += matches.length * 10;

            // 2. Income/AUM Tier Matching
            // If user is HNI (Income > 2L), boost planners with 'Wealth Management' or High AUM experience
            if (income > 200000) {
                if (specs.some(s => s.includes('Wealth') || s.includes('HNI'))) {
                    score += 20;
                }
            }
            // 3. Rating & Experience
            score += (parseFloat(pJson.rating) || 0) * 2;
            score += (pJson.experience || 0) * 0.5;

            return { ...pJson, matchScore: score };
        });

        return scoredPlanners.sort((a, b) => b.matchScore - a.matchScore);
    }
}

module.exports = new RecommendationService();
