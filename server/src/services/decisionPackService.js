/**
 * Decision Pack Service - Generates Analyst-Ready Decision Packs
 * 
 * Combines all MOAT components into a comprehensive Decision Pack:
 * - Financial Snapshot
 * - Decision Readiness Scores
 * - Validation Flags (Red Flags)
 * - Risk Analysis
 * - Recommended Analyst Questions
 */

const { DocumentInsight, FinancialPlanningSubmission, Document, User } = require('../models');
const scoringService = require('./scoringService');
const truthValidationService = require('./truthValidationService');
const demandIntelligenceService = require('./demandIntelligenceService');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

class DecisionPackService {
    /**
     * Parse monetary string to number
     */
    parseMoney(value) {
        if (!value) return 0;
        if (typeof value === 'number') return value;

        const str = String(value).toLowerCase().replace(/[₹,\s]/g, '');
        let multiplier = 1;

        if (str.includes('cr')) multiplier = 10000000;
        else if (str.includes('lakh')) multiplier = 100000;
        else if (str.includes('k')) multiplier = 1000;

        const num = parseFloat(str.replace(/[^\d.]/g, ''));
        return isNaN(num) ? 0 : num * multiplier;
    }

    /**
     * Build financial snapshot from submission
     */
    buildSnapshot(submission) {
        const monthlyIncome = this.parseMoney(submission.monthlyIncome);
        const monthlySavings = this.parseMoney(submission.monthlySavings);
        const monthlyEMI = this.parseMoney(submission.monthlyEMI);
        const monthlyExpenses = this.parseMoney(submission.monthlyExpenses);
        const totalLiabilities = this.parseMoney(submission.totalLiabilityAmount);
        const totalDebt = this.parseMoney(submission.totalDebtAmount);

        // Calculate derived metrics
        const savingsRate = monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100).toFixed(1) : 0;
        const emiToIncomeRatio = monthlyIncome > 0 ? ((monthlyEMI / monthlyIncome) * 100).toFixed(1) : 0;
        const expenseRatio = monthlyIncome > 0 ? ((monthlyExpenses / monthlyIncome) * 100).toFixed(1) : 0;

        return {
            income: {
                monthly: monthlyIncome,
                type: submission.incomeType,
                stability: submission.incomeStability
            },
            savings: {
                monthly: monthlySavings,
                rate: `${savingsRate}%`
            },
            expenses: {
                monthly: monthlyExpenses,
                emi: monthlyEMI,
                emiToIncomeRatio: `${emiToIncomeRatio}%`,
                expenseRatio: `${expenseRatio}%`
            },
            liabilities: {
                total: totalLiabilities || totalDebt,
                types: submission.debtTypes || submission.liabilities || []
            },
            assets: submission.assets || {},
            insurance: {
                hasHealth: submission.hasHealthInsurance,
                hasLife: submission.hasLifeInsurance
            },
            riskProfile: {
                preference: submission.riskPreference,
                experience: submission.investmentExperience,
                score: submission.riskScore
            }
        };
    }

    /**
     * Identify strengths from submission and scores
     */
    identifyStrengths(submission, scores) {
        const strengths = [];

        // Income stability
        if (submission.incomeStability === 'very_stable') {
            strengths.push({ category: 'Income', point: 'Very stable income source' });
        }

        // Savings rate
        const savingsRate = this.parseMoney(submission.monthlySavings) / this.parseMoney(submission.monthlyIncome) * 100;
        if (savingsRate > 30) {
            strengths.push({ category: 'Savings', point: `Strong savings rate (${savingsRate.toFixed(0)}%)` });
        }

        // Insurance coverage
        if (submission.hasHealthInsurance && submission.hasLifeInsurance) {
            strengths.push({ category: 'Protection', point: 'Complete insurance coverage (health + life)' });
        }

        // Business metrics
        if (submission.profitMargin === '30+') {
            strengths.push({ category: 'Business', point: 'Excellent profit margins (30%+)' });
        }
        if (submission.cashReserves === '6+') {
            strengths.push({ category: 'Business', point: 'Strong cash reserves (6+ months)' });
        }

        // Low debt
        if (!submission.debtTypes || submission.debtTypes.length === 0) {
            strengths.push({ category: 'Debt', point: 'Debt-free or minimal debt' });
        }

        // High scores
        if (scores.primaryScore >= 80) {
            strengths.push({ category: 'Overall', point: `Strong readiness score (${scores.primaryScore}/100)` });
        }

        return strengths;
    }

    /**
     * Analyze risk concentration areas
     */
    analyzeRiskConcentration(submission) {
        const risks = [];
        const monthlyIncome = this.parseMoney(submission.monthlyIncome);
        const monthlyEMI = this.parseMoney(submission.monthlyEMI);
        const monthlyExpenses = this.parseMoney(submission.monthlyExpenses);

        // EMI concentration
        if (monthlyIncome > 0) {
            const emiRatio = (monthlyEMI / monthlyIncome) * 100;
            if (emiRatio > 50) {
                risks.push({ area: 'EMI Burden', level: 'high', detail: `EMI consumes ${emiRatio.toFixed(0)}% of income` });
            } else if (emiRatio > 40) {
                risks.push({ area: 'EMI Burden', level: 'medium', detail: `EMI at ${emiRatio.toFixed(0)}% of income` });
            }
        }

        // Cash flow risk
        if (monthlyIncome > 0) {
            const totalOutflow = monthlyEMI + monthlyExpenses;
            const cushion = ((monthlyIncome - totalOutflow) / monthlyIncome) * 100;
            if (cushion < 10) {
                risks.push({ area: 'Cash Flow', level: 'high', detail: `Only ${cushion.toFixed(0)}% cushion after expenses` });
            }
        }

        // No insurance
        if (!submission.hasHealthInsurance) {
            risks.push({ area: 'Protection', level: 'medium', detail: 'No health insurance coverage' });
        }
        if (!submission.hasLifeInsurance && submission.dependents > 0) {
            risks.push({ area: 'Protection', level: 'high', detail: 'No life insurance with dependents' });
        }

        // High-interest debt
        const hasHighInterestDebt = (submission.debtTypes || []).some(d =>
            ['credit_card', 'personal_loan'].includes(d)
        );
        if (hasHighInterestDebt) {
            risks.push({ area: 'Debt Quality', level: 'medium', detail: 'Has high-interest debt (credit card/personal loan)' });
        }

        // Single income
        if (submission.incomeType === 'salaried' && submission.dependents > 2) {
            risks.push({ area: 'Income', level: 'medium', detail: 'Single income supporting multiple dependents' });
        }

        return risks;
    }

    /**
     * Generate analyst-oriented questions based on data gaps and flags
     */
    generateAnalystQuestions(submission, validation, scores) {
        const questions = [];

        // Questions based on validation flags
        for (const flag of validation.flags) {
            if (flag.severity === 'high') {
                if (flag.type === 'INCOME_MISMATCH') {
                    questions.push({
                        priority: 'high',
                        topic: 'Income Verification',
                        question: 'Please ask client to explain the difference between declared income and bank statements. Are there cash transactions or other income sources?'
                    });
                } else if (flag.type === 'REVENUE_GST_MISMATCH') {
                    questions.push({
                        priority: 'high',
                        topic: 'Revenue Verification',
                        question: 'GST turnover differs from declared revenue. Probe for cash sales or B2C transactions not captured in GST.'
                    });
                }
            }
        }

        // Questions based on purpose
        if (submission.planningPurpose === 'business_expansion') {
            questions.push({
                priority: 'medium',
                topic: 'Expansion Readiness',
                question: 'What is the expected ROI and payback period for this expansion?'
            });
            questions.push({
                priority: 'medium',
                topic: 'Working Capital',
                question: 'How will the expansion affect working capital requirements?'
            });
        } else if (submission.planningPurpose === 'loan_settlement') {
            questions.push({
                priority: 'medium',
                topic: 'Debt Strategy',
                question: 'Which loans should be prioritized for settlement - highest interest or lowest balance?'
            });
        } else {
            questions.push({
                priority: 'medium',
                topic: 'Investment Goals',
                question: 'What are the specific financial goals this investment should achieve?'
            });
        }

        // Questions based on low scores
        if (scores.dataCompletenessScore < 70) {
            questions.push({
                priority: 'low',
                topic: 'Data Gaps',
                question: 'Profile is incomplete. Ask client about missing financial details.'
            });
        }

        return questions;
    }

    /**
     * Generate the complete Decision Pack
     */
    async generatePack(submissionId) {
        const submission = await FinancialPlanningSubmission.findByPk(submissionId, {
            include: [{ model: User, as: 'user' }]
        });

        if (!submission) throw new Error('Submission not found');

        // Update status to generating
        await submission.update({ decisionPackStatus: 'generating' });

        try {
            // Generate scores
            const scores = await scoringService.generateAllScores(submissionId);

            // Run validation
            const validation = await truthValidationService.validate(submissionId);

            // Run Demand Intelligence Analysis (New Layer)
            const demandIntelligence = await demandIntelligenceService.analyzeDemandIntent(submissionId);

            // Build the pack
            const pack = {
                meta: {
                    submissionId,
                    generatedAt: new Date().toISOString(),
                    version: '1.0',
                    purpose: submission.planningPurpose || 'investment'
                },
                user: {
                    name: submission.fullName,
                    email: submission.email,
                    phone: submission.phone
                },
                scores: {
                    primary: scores.primaryScore,
                    dataCompleteness: scores.dataCompletenessScore,
                    expansionReadiness: scores.expansionReadinessScore,
                    loanSafety: scores.loanSafetyScore,
                    investmentCapacity: scores.investmentCapacityScore
                },
                financialSnapshot: this.buildSnapshot(submission),
                strengths: this.identifyStrengths(submission, scores),
                redFlags: validation.flags.filter(f => f.severity === 'high'),
                warnings: validation.flags.filter(f => f.severity === 'medium'),
                riskConcentration: this.analyzeRiskConcentration(submission),
                recommendedQuestions: this.generateAnalystQuestions(submission, validation, scores),
                validation: {
                    isValid: validation.isValid,
                    flagCount: validation.flagCount,
                    coverage: scores.dataCompletenessScore
                },
                demandIntelligence: demandIntelligence
            };

            // Save pack to submission
            await submission.update({
                decisionPackData: pack,
                decisionPackGeneratedAt: new Date(),
                decisionPackStatus: 'ready'
            });

            // Cache the result for 1 hour
            await cache.setCache(`decision_pack:${submissionId}`, pack, 3600);

            return pack;

        } catch (error) {
            await submission.update({ decisionPackStatus: 'failed' });
            throw error;
        }
    }

    /**
     * Get existing pack or generate new one
     */
    async getPack(submissionId) {
        // Try cache first
        const cachedPack = await cache.getCache(`decision_pack:${submissionId}`);
        if (cachedPack) {
            logger.info('Serving decision pack from cache', { submissionId });
            return cachedPack;
        }

        const submission = await FinancialPlanningSubmission.findByPk(submissionId);
        if (!submission) throw new Error('Submission not found');

        if (submission.decisionPackStatus === 'ready' && submission.decisionPackData) {
            return submission.decisionPackData;
        }

        return this.generatePack(submissionId);
    }
}

module.exports = new DecisionPackService();
