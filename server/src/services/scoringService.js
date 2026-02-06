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
const { parseIndianCurrency } = require('../utils/currencyHelper');

class ScoringService {
    /**
     * Calculate weighted average from an array of {weight, score} objects
     */
    weightedAverage(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight === 0) return 0;
        const weightedSum = items.reduce((sum, item) => sum + (item.weight * item.score), 0);
        return Math.round(weightedSum / totalWeight);
    }

    /**
     * Parse monetary string to number
     */
    parseMoney(value) {
        return parseIndianCurrency(value) || 0;
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
     * BUSINESS EXPANSION READINESS SCORE (0-100)
     * Weights: Cash Flow (30%), Revenue (25%), Margin (20%), Working Capital (15%), Debt (10%)
     */
    calculateExpansionReadiness(submission, insights = []) {
        const scores = [];

        // 1. Cash Flow Strength (30%) - Based on Cash Reserves
        const cashReserves = submission.cashReserves;
        let cashScore = 50;
        if (cashReserves === '6+') cashScore = 100;
        else if (cashReserves === '3-6') cashScore = 70;
        else if (cashReserves === '1-3') cashScore = 40;
        else if (cashReserves === '<1') cashScore = 10;
        scores.push({ weight: 0.30, score: cashScore });

        // 2. Revenue Stability (25%) - Normalized Annual Revenue
        const revenue = this.parseMoney(submission.annualRevenue);
        const revenueScore = this.normalize(revenue, 0, 100000000); // Up to 10Cr
        scores.push({ weight: 0.25, score: revenueScore });

        // 3. Margin Quality (20%) - Profit Margin
        const profitMargin = submission.profitMargin;
        let profitScore = 50;
        if (profitMargin === '30+') profitScore = 100;
        else if (profitMargin === '15-30') profitScore = 80;
        else if (profitMargin === '5-15') profitScore = 60;
        else if (profitMargin === '0-5') profitScore = 30;
        else if (profitMargin === 'negative') profitScore = 0;
        scores.push({ weight: 0.20, score: profitScore });

        // 4. Working Capital Health (15%) - Employee Scale proxy
        const employees = submission.employeeCount;
        let employeeScore = 50;
        if (employees === '200+') employeeScore = 100;
        else if (employees === '51-200') employeeScore = 80;
        else if (employees === '11-50') employeeScore = 60;
        else if (employees === '1-10') employeeScore = 40;
        scores.push({ weight: 0.15, score: employeeScore });

        // 5. Debt Headroom (10%) - Existing Loan Burden
        const existingLoans = submission.existingLoans || [];
        const loanBurden = existingLoans.length;
        const loanScore = this.normalize(loanBurden, 0, 3, true);
        scores.push({ weight: 0.10, score: loanScore });

        return this.weightedAverage(scores);
    }

    /**
     * LOAN SAFETY SCORE (0-100)
     * Weights: DSCR (35%), EMI Burden (25%), Credit (20%), Income (10%), Liquidity (10%)
     */
    calculateLoanSafety(submission, insights = []) {
        const scores = [];

        // 1. DSCR (35%) - Simplified proxy: (Monthly Income - Expenses) / EMI
        const monthlyIncome = this.parseMoney(submission.monthlyIncome);
        const monthlyEMI = this.parseMoney(submission.monthlyEMI);
        const monthlyExpenses = this.parseMoney(submission.monthlyExpenses);
        const surplus = monthlyIncome - monthlyExpenses;
        const dscr = monthlyEMI > 0 ? (surplus / monthlyEMI) : 2.0;
        const dscrScore = this.normalize(dscr, 1.0, 2.5); // DSCR 1.0 = 0, 2.5 = 100
        scores.push({ weight: 0.35, score: dscrScore });

        // 2. EMI Burden (25%) - EMI to Income Ratio
        const emiRatio = monthlyIncome > 0 ? (monthlyEMI / monthlyIncome) * 100 : 100;
        const emiScore = this.normalize(emiRatio, 30, 60, true);
        scores.push({ weight: 0.25, score: emiScore });

        // 3. Credit History (20%) - Debt Types Complexity
        const debtTypes = submission.debtTypes || [];
        const debtComplexity = debtTypes.length;
        const creditScore = this.normalize(debtComplexity, 0, 4, true);
        scores.push({ weight: 0.20, score: creditScore });

        // 4. Income Stability (10%)
        const stability = submission.incomeStability;
        let stabilityScore = 50;
        if (stability === 'very_stable') stabilityScore = 100;
        else if (stability === 'stable') stabilityScore = 75;
        else if (stability === 'variable') stabilityScore = 40;
        else if (stability === 'unstable') stabilityScore = 10;
        scores.push({ weight: 0.10, score: stabilityScore });

        // 5. Liquidity Buffer (10%) - Savings Rate
        const monthlySavings = this.parseMoney(submission.monthlySavings);
        const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
        const liquidityScore = this.normalize(savingsRate, 5, 30);
        scores.push({ weight: 0.10, score: liquidityScore });

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
        const purpose = (submission.planningPurpose || 'investment').toLowerCase();

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

        const score = Math.round((filledCount / fields.length) * 100);
        console.log(`SCORING: Purpose=${purpose}, Filled=${filledCount}/${fields.length}, Score=${score}`);
        return score;
    }

    /**
     * GET MISSING FIELDS FOR FEEDBACK
     */
    getMissingFields(submission) {
        const purpose = submission.planningPurpose || 'investment';
        const requiredFields = {
            investment: [
                { id: 'monthlyIncome', label: 'Monthly Income' },
                { id: 'monthlySavings', label: 'Monthly Savings' },
                { id: 'riskPreference', label: 'Risk Preference' },
                { id: 'investmentExperience', label: 'Investment Experience' },
                { id: 'hasHealthInsurance', label: 'Health Insurance Status' },
                { id: 'hasLifeInsurance', label: 'Life Insurance Status' }
            ],
            comprehensive: [
                { id: 'monthlyIncome', label: 'Monthly Income' },
                { id: 'monthlySavings', label: 'Monthly Savings' },
                { id: 'totalLiabilityAmount', label: 'Total Liabilities' },
                { id: 'riskPreference', label: 'Risk Preference' },
                { id: 'hasHealthInsurance', label: 'Health Insurance Status' },
                { id: 'hasLifeInsurance', label: 'Life Insurance Status' }
            ],
            tax_planning: [
                { id: 'monthlyIncome', label: 'Monthly Income' },
                { id: 'investment80C', label: '80C Investments' },
                { id: 'healthInsurancePremium', label: 'Health Insurance Premium' }
            ],
            business_expansion: [
                { id: 'fundingRequired', label: 'Funding Required' },
                { id: 'annualRevenue', label: 'Annual Revenue' },
                { id: 'profitMargin', label: 'Profit Margin' },
                { id: 'cashReserves', label: 'Cash Reserves' }
            ],
            loan_settlement: [
                { id: 'totalDebtAmount', label: 'Total Debt' },
                { id: 'monthlyEMI', label: 'Monthly EMI' },
                { id: 'settlementGoal', label: 'Settlement Goal' }
            ]
        };

        const fields = requiredFields[purpose] || requiredFields.investment;
        const missing = [];

        for (const field of fields) {
            const value = submission[field.id];
            const isFilled = value !== null && value !== undefined && value !== '' &&
                (Array.isArray(value) ? value.length > 0 : true) &&
                (typeof value === 'object' && !Array.isArray(value) ? Object.keys(value).length > 0 : true);

            if (!isFilled) {
                missing.push(field.label);
            }
        }

        return missing;
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

        // INTEGRATION: Call Rule Engine for high-level evaluation
        const ruleEngineService = require('./RuleEngineService');
        const ruleEvaluation = await ruleEngineService.evaluateRules(submissionId);

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
                : null,
            systemConfidenceScore: ruleEvaluation.confidenceScore,
            executionPath: ruleEvaluation.executionPath,
            riskLevel: ruleEvaluation.isHardBlocked ? 'critical' : (ruleEvaluation.rulePenalty > 0.5 ? 'high' : 'medium')
        };

        // RULE AUTHORITY: Hard blocks cap the related score to 30
        if (ruleEvaluation.isHardBlocked) {
            if (scores.expansionReadinessScore) scores.expansionReadinessScore = Math.min(scores.expansionReadinessScore, 30);
            if (scores.loanSafetyScore) scores.loanSafetyScore = Math.min(scores.loanSafetyScore, 30);
            if (scores.investmentCapacityScore) scores.investmentCapacityScore = Math.min(scores.investmentCapacityScore, 30);
        }

        // Update submission with scores
        await submission.update(scores);

        return {
            ...scores,
            primaryScore: scores.expansionReadinessScore || scores.loanSafetyScore || scores.investmentCapacityScore,
            purpose,
            rules: ruleEvaluation.rules,
            missingFields: this.getMissingFields(submission)
        };
    }
}

module.exports = new ScoringService();
