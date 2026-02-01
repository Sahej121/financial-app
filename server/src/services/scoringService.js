/**
 * Scoring Service - Decision Readiness Algorithms
 * 
 * Calculates 3 key scores (0-100) for the MOAT:
 * 1. Expansion Readiness Score (business expansion)
 * 2. Loan Safety Score (loan settlement)
 * 3. Investment Capacity Score (investment)
 * 
 * Also calculates Data Completeness Score.
 */

const { DocumentInsight, FinancialPlanningSubmission } = require('../models');

class ScoringService {
    /**
     * Calculate weighted average from an array of {weight, score} objects
     */
    weightedAverage(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        const weightedSum = items.reduce((sum, item) => sum + (item.weight * item.score), 0);
        return Math.round(weightedSum / totalWeight);
    }

    /**
     * Parse monetary string to number (handles "₹", "Lakhs", "Cr", etc.)
     */
    parseMoney(value) {
        if (!value) return 0;
        if (typeof value === 'number') return value;

        const str = String(value).toLowerCase().replace(/[₹,\s]/g, '');
        let multiplier = 1;

        if (str.includes('cr')) {
            multiplier = 10000000;
        } else if (str.includes('lakh')) {
            multiplier = 100000;
        } else if (str.includes('k')) {
            multiplier = 1000;
        }

        const num = parseFloat(str.replace(/[^\d.]/g, ''));
        return isNaN(num) ? 0 : num * multiplier;
    }

    /**
     * Normalize a value to 0-100 score based on thresholds
     */
    normalize(value, min, max, invert = false) {
        if (value <= min) return invert ? 100 : 0;
        if (value >= max) return invert ? 0 : 100;
        const score = ((value - min) / (max - min)) * 100;
        return Math.round(invert ? 100 - score : score);
    }

    /**
     * EXPANSION READINESS SCORE (0-100)
     * For users interested in business expansion
     */
    calculateExpansionReadiness(submission, insights = []) {
        const scores = [];

        // 1. Profit Margin Score (25%)
        const profitMargin = submission.profitMargin;
        let profitScore = 50;
        if (profitMargin === '30+') profitScore = 100;
        else if (profitMargin === '15-30') profitScore = 80;
        else if (profitMargin === '5-15') profitScore = 60;
        else if (profitMargin === '0-5') profitScore = 30;
        else if (profitMargin === 'negative') profitScore = 0;
        scores.push({ weight: 0.25, score: profitScore });

        // 2. Cash Reserves Score (20%)
        const cashReserves = submission.cashReserves;
        let cashScore = 50;
        if (cashReserves === '6+') cashScore = 100;
        else if (cashReserves === '3-6') cashScore = 70;
        else if (cashReserves === '1-3') cashScore = 40;
        else if (cashReserves === '<1') cashScore = 10;
        scores.push({ weight: 0.20, score: cashScore });

        // 3. Revenue Score (20%)
        const revenue = this.parseMoney(submission.annualRevenue);
        const revenueScore = this.normalize(revenue, 0, 100000000); // 0 to 10Cr
        scores.push({ weight: 0.20, score: revenueScore });

        // 4. Employee Count / Scale Score (15%)
        const employees = submission.employeeCount;
        let employeeScore = 50;
        if (employees === '200+') employeeScore = 100;
        else if (employees === '51-200') employeeScore = 80;
        else if (employees === '11-50') employeeScore = 60;
        else if (employees === '1-10') employeeScore = 40;
        scores.push({ weight: 0.15, score: employeeScore });

        // 5. Existing Loan Burden Score (20%)
        const existingLoans = submission.existingLoans || [];
        const loanBurden = existingLoans.length;
        const loanScore = this.normalize(loanBurden, 0, 3, true); // Fewer loans = higher score
        scores.push({ weight: 0.20, score: loanScore });

        return this.weightedAverage(scores);
    }

    /**
     * LOAN SAFETY SCORE (0-100)
     * For users seeking loan settlement/consolidation
     */
    calculateLoanSafety(submission, insights = []) {
        const scores = [];

        // 1. EMI to Income Ratio (30%)
        const monthlyIncome = this.parseMoney(submission.monthlyIncome);
        const monthlyEMI = this.parseMoney(submission.monthlyEMI);
        const emiRatio = monthlyIncome > 0 ? (monthlyEMI / monthlyIncome) * 100 : 100;
        // EMI < 30% = 100, EMI > 60% = 0
        const emiScore = this.normalize(emiRatio, 30, 60, true);
        scores.push({ weight: 0.30, score: emiScore });

        // 2. Income Stability Score (25%)
        const stability = submission.incomeStability;
        let stabilityScore = 50;
        if (stability === 'very_stable') stabilityScore = 100;
        else if (stability === 'stable') stabilityScore = 75;
        else if (stability === 'variable') stabilityScore = 40;
        else if (stability === 'unstable') stabilityScore = 10;
        scores.push({ weight: 0.25, score: stabilityScore });

        // 3. Expense to Income Ratio (20%)
        const monthlyExpenses = this.parseMoney(submission.monthlyExpenses);
        const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 100;
        const expenseScore = this.normalize(expenseRatio, 30, 70, true);
        scores.push({ weight: 0.20, score: expenseScore });

        // 4. Debt Complexity (15%)
        const debtTypes = submission.debtTypes || [];
        const debtComplexity = debtTypes.length;
        const complexityScore = this.normalize(debtComplexity, 0, 4, true);
        scores.push({ weight: 0.15, score: complexityScore });

        // 5. Settlement Goal Clarity (10%)
        const hasGoal = submission.settlementGoal ? 100 : 0;
        scores.push({ weight: 0.10, score: hasGoal });

        return this.weightedAverage(scores);
    }

    /**
     * INVESTMENT CAPACITY SCORE (0-100)
     * For users interested in investment planning
     */
    calculateInvestmentCapacity(submission, insights = []) {
        const scores = [];

        // 1. Savings Rate (30%)
        const monthlyIncome = this.parseMoney(submission.monthlyIncome);
        const monthlySavings = this.parseMoney(submission.monthlySavings);
        const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
        // Savings > 30% = 100, Savings < 5% = 0
        const savingsScore = this.normalize(savingsRate, 5, 40);
        scores.push({ weight: 0.30, score: savingsScore });

        // 2. Income Stability (20%)
        const stability = submission.incomeStability;
        let stabilityScore = 50;
        if (stability === 'very_stable') stabilityScore = 100;
        else if (stability === 'stable') stabilityScore = 75;
        else if (stability === 'variable') stabilityScore = 40;
        else if (stability === 'unstable') stabilityScore = 10;
        scores.push({ weight: 0.20, score: stabilityScore });

        // 3. Risk Tolerance Alignment (20%)
        const riskPref = submission.riskPreference;
        const experience = submission.investmentExperience;
        let riskScore = 50;
        if (riskPref === 'aggressive' && experience === 'experienced') riskScore = 100;
        else if (riskPref === 'balanced') riskScore = 70;
        else if (riskPref === 'stability' && experience !== 'none') riskScore = 60;
        else if (experience === 'none') riskScore = 30;
        scores.push({ weight: 0.20, score: riskScore });

        // 4. Insurance Coverage (15%)
        const hasHealth = submission.hasHealthInsurance;
        const hasLife = submission.hasLifeInsurance;
        let insuranceScore = 0;
        if (hasHealth && hasLife) insuranceScore = 100;
        else if (hasHealth || hasLife) insuranceScore = 50;
        scores.push({ weight: 0.15, score: insuranceScore });

        // 5. Liability Burden (15%)
        const totalLiabilities = this.parseMoney(submission.totalLiabilityAmount);
        const assets = submission.assets || {};
        const totalAssets = Object.values(assets).reduce((sum, val) => sum + this.parseMoney(val), 0);
        const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 100;
        const debtScore = this.normalize(debtToAssetRatio, 20, 80, true);
        scores.push({ weight: 0.15, score: debtScore });

        return this.weightedAverage(scores);
    }

    /**
     * DATA COMPLETENESS SCORE (0-100)
     * How much of the required data has been provided
     */
    calculateDataCompleteness(submission) {
        const purpose = submission.planningPurpose;

        // Define required fields per purpose
        const requiredFields = {
            investment: [
                'monthlyIncome', 'monthlySavings', 'incomeStability', 'riskPreference',
                'investmentExperience', 'hasHealthInsurance', 'hasLifeInsurance',
                'achievementTimeline', 'successPriority'
            ],
            business_expansion: [
                'expansionType', 'fundingRequired', 'expansionTimeline', 'businessType',
                'industryType', 'annualRevenue', 'employeeCount', 'profitMargin', 'cashReserves'
            ],
            loan_settlement: [
                'debtTypes', 'totalDebtAmount', 'monthlyEMI', 'monthlyIncome',
                'monthlyExpenses', 'incomeStability', 'settlementGoal'
            ]
        };

        const fields = requiredFields[purpose] || requiredFields.investment;
        let filledCount = 0;

        for (const field of fields) {
            const value = submission[field];
            if (value !== null && value !== undefined && value !== '' &&
                (Array.isArray(value) ? value.length > 0 : true) &&
                (typeof value === 'object' && !Array.isArray(value) ? Object.keys(value).length > 0 : true)) {
                filledCount++;
            }
        }

        return Math.round((filledCount / fields.length) * 100);
    }

    /**
     * Generate all scores for a submission
     */
    async generateAllScores(submissionId) {
        const submission = await FinancialPlanningSubmission.findByPk(submissionId);
        if (!submission) throw new Error('Submission not found');

        const insights = await DocumentInsight.findAll({
            where: { submissionId },
            raw: true
        });

        const purpose = submission.planningPurpose || 'investment';

        const scores = {
            dataCompletenessScore: this.calculateDataCompleteness(submission),
            expansionReadinessScore: purpose === 'business_expansion'
                ? this.calculateExpansionReadiness(submission, insights)
                : null,
            loanSafetyScore: purpose === 'loan_settlement'
                ? this.calculateLoanSafety(submission, insights)
                : null,
            investmentCapacityScore: purpose === 'investment'
                ? this.calculateInvestmentCapacity(submission, insights)
                : null
        };

        // Update submission with scores
        await submission.update(scores);

        return {
            ...scores,
            primaryScore: scores.expansionReadinessScore || scores.loanSafetyScore || scores.investmentCapacityScore,
            purpose
        };
    }
}

module.exports = new ScoringService();
