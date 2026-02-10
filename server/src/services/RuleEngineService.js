/**
 * Rule Engine Service - Deterministic Core Intelligence
 * 
 * Handles confidence gating, hard block rules, and logic-heavy financial evaluations.
 * This service ensures that financial logic is separated from both LLMs and simple scoring formulas.
 */

const { DocumentInsight, FinancialPlanningSubmission, DecisionAuditLog, Correction } = require('../models');
const logger = require('../utils/logger');
const correctionService = require('./correctionService');

class RuleEngineService {
    /**
     * Compute system confidence score based on strict hierarchy
     * Formula: 0.25 * intake + 0.30 * parse + 0.25 * consistency + 0.20 * sanity
     */
    async calculateSystemConfidence(submissionId) {
        const submission = await FinancialPlanningSubmission.findByPk(submissionId);
        const insights = await DocumentInsight.findAll({ where: { submissionId } });
        const corrections = await correctionService.getCorrectionsBySubmission(submissionId);

        // 1. Intake Completeness (0.25 weight)
        const scoringService = require('./scoringService');
        const intakeCompleteness = scoringService.calculateDataCompleteness(submission) / 100;

        // 2. Document Parse Accuracy (0.30 weight)
        let parseAccuracy = 0;
        if (insights.length > 0) {
            parseAccuracy = insights.reduce((sum, i) => sum + (i.confidenceScore || 0), 0) / insights.length;
        }

        // 3. Cross-Document Consistency (0.25 weight)
        const truthValidationService = require('./truthValidationService');
        const validation = await truthValidationService.validate(submissionId);

        // REFINEMENT: Consistency requires both declared data AND document data.
        // If intake is 0%, we cannot be confident in "consistency" even if flags are 0.
        let consistencyScore = 0;
        if (intakeCompleteness > 0.1 && insights.length > 0) {
            consistencyScore = validation.isValid ? 1.0 : Math.max(0, 1.0 - (validation.highSeverityCount * 0.4) - (validation.mediumSeverityCount * 0.1));
        }

        // 4. Sanity and Outlier Checks (0.20 weight)
        let sanityScore = 0;
        if (intakeCompleteness > 0.1) {
            sanityScore = 1.0;
            const income = scoringService.parseMoney(submission.monthlyIncome);
            const debt = scoringService.parseMoney(submission.totalDebtAmount);
            if (income > 0 && debt > income * 120) sanityScore = 0.5; // Outlier check
        }

        const totalConfidence = (intakeCompleteness * 0.25) +
            (parseAccuracy * 0.30) +
            (consistencyScore * 0.25) +
            (sanityScore * 0.20);

        // LOGIC TRACE: Hallucination Risk occurs if parse accuracy is high but consistency is low
        const hallucinationRisk = (parseAccuracy > 0.8 && consistencyScore < 0.5);

        return {
            score: parseFloat(totalConfidence.toFixed(2)),
            bundle: {
                intakeCompleteness,
                parseAccuracy,
                consistencyScore,
                sanityScore,
                hallucinationRisk,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Confidence-Based Execution Path (Strict Gates)
     */
    async determineExecutionPath(confidenceScore) {
        if (confidenceScore >= 0.85) return 'FULLY_DETERMINISTIC'; // NO LLM permitted
        if (confidenceScore >= 0.65) return 'LIMITED_LLM_EXPLANATION'; // Structured JSON, read-only
        if (confidenceScore >= 0.40) return 'ANALYST_REQUIRED'; // LLM optional for summarization only
        return 'ANALYST_ONLY_BLOCKED'; // LLM prohibited
    }

    /**
     * Rule Engine - Categorized Authority
     */
    async evaluateRules(submissionId) {
        const submission = await FinancialPlanningSubmission.findByPk(submissionId);
        const confidence = await this.calculateSystemConfidence(submissionId);
        const executionPath = await this.determineExecutionPath(confidence.score);
        const corrections = await correctionService.getCorrectionsBySubmission(submissionId);

        const results = {
            submissionId,
            confidenceScore: confidence.score,
            executionPath,
            rules: [],
            isHardBlocked: false,
            rulePenalty: 0 // Overall penalty to be applied to score
        };

        // RULE CLASSIFICATIONS

        // 1. HARD BLOCKS (100% weight, non-overridable)
        // Example: DSCR < 1.1 or EMI > 65%
        const scoringService = require('./scoringService');
        const income = scoringService.parseMoney(submission.monthlyIncome);
        const emi = scoringService.parseMoney(submission.monthlyEMI);

        // PRIORITY LAYER: Check for analyst corrections on critical rule fields
        const incomeCorr = corrections.find(c => c.fieldName === 'monthlyIncome');
        const emiCorr = corrections.find(c => c.fieldName === 'monthlyEMI');

        const finalIncome = incomeCorr ? scoringService.parseMoney(incomeCorr.correctedValue) : income;
        const finalEmi = emiCorr ? scoringService.parseMoney(emiCorr.correctedValue) : emi;

        const emiRatio = finalIncome > 0 ? (finalEmi / finalIncome) : 0;

        if (emiRatio > 0.65) {
            results.rules.push({
                id: 'HARD_BLOCK_EMI',
                desc: 'EMI burden exceeds 65%',
                category: 'HARD_BLOCK',
                status: 'FAILED',
                influence: 1.0
            });
            results.isHardBlocked = true;
        }

        // 2. RISK FLAGS (60% penalty influence)
        if (submission.incomeStability === 'unstable') {
            results.rules.push({
                id: 'RISK_FLAG_INCOME',
                desc: 'Unstable income pattern',
                category: 'RISK_FLAG',
                status: 'WARNING',
                influence: 0.6
            });
            results.rulePenalty += 0.6;
        }

        // 3. INFO SIGNALS (0% penalty)
        if (submission.investmentExperience === 'none') {
            results.rules.push({
                id: 'INFO_SIGNAL_EXP',
                desc: 'Novice investor profile',
                category: 'INFO_SIGNAL',
                status: 'INFO',
                influence: 0
            });
        }

        await this.logDecision(results);

        return results;
    }

    /**
     * Audit Logging
     */
    async logDecision(results) {
        try {
            if (DecisionAuditLog) {
                await DecisionAuditLog.create({
                    submissionId: results.submissionId,
                    eventType: 'SCORING_DECISION',
                    confidenceScore: results.confidenceScore,
                    executionPath: results.executionPath,
                    data: results,
                    promptVersion: 'RULE_ENGINE_V1',
                    hallucinationCheck: results.confidenceScore >= 0.85,
                    performer: 'SYSTEM'
                });
            } else {
                logger.info('Decision logged to console', { results });
            }
        } catch (e) {
            logger.warn('Audit logging failed', { error: e.message, submissionId: results.submissionId });
        }
    }
}

module.exports = new RuleEngineService();
