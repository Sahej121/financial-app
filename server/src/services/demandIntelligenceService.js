const logger = require('../utils/logger');
const { FinancialPlanningSubmission, DocumentInsight } = require('../models');

/**
 * Demand Intelligence Service
 * 
 * Specialized AI logic to understand the 'Nuance' of user financial demands.
 * Transitions from generic LLM prompts to domain-specific feature extraction.
 */
class DemandIntelligenceService {

    /**
     * Analyze user demand intent
     * @param {string} submissionId 
     */
    async analyzeDemandIntent(submissionId) {
        const submission = await FinancialPlanningSubmission.findByPk(submissionId);
        if (!submission) throw new Error('Submission not found');

        logger.info('Starting demand intent analysis', { submissionId, purpose: submission.planningPurpose });

        const insights = await DocumentInsight.findAll({ where: { submissionId } });

        // 1. Feature Extraction (User Notes + Purpose)
        const userNotes = [
            submission.expansionDetails,
            submission.settlementGoal,
            submission.otherNotes
        ].filter(Boolean).join(' ').toLowerCase();

        // 2. Multi-Layer Intent Classification
        const intent = {
            primaryCategory: submission.planningPurpose,
            nuances: this._extractNuances(userNotes),
            urgency: this._assessUrgency(userNotes, submission),
            complexityLevel: this._calculateComplexity(submission, insights),
            suggestedExpertise: []
        };

        // 3. Expertise Mapping
        intent.suggestedExpertise = this._mapExpertise(intent);

        logger.info('Demand analysis complete', { submissionId, intent });

        return intent;
    }

    /**
     * Layer 1: Heuristic Nuance Extraction (To be replaced by Custom ML Classifier)
     */
    _extractNuances(text) {
        const nuances = [];
        const keywordMap = {
            'TAX_OPTIMIZATION': ['tax', 'saving', 'itr', 'gst', 'deduction'],
            'DEBT_DISTRESS': ['overdue', 'collection', 'harassment', 'default', 'struggling'],
            'SCALING_OPPORTUNITY': ['expansion', 'growth', 'new branch', 'machinery', 'scale'],
            'LIQUIDITY_CRUNCH': ['cash flow', 'working capital', 'salary', 'vendor payment'],
            'CAPITAL_PRESERVATION': ['safe', 'low risk', 'protect', 'conservative']
        };

        for (const [key, keywords] of Object.entries(keywordMap)) {
            if (keywords.some(k => text.includes(k))) {
                nuances.push(key);
            }
        }
        return nuances;
    }

    /**
     * Layer 2: Urgency Assessment
     */
    _assessUrgency(text, submission) {
        const urgencyKeywords = ['urgent', 'immediately', 'asap', 'within 2 days', 'deadline'];
        const hasUrgentKeyword = urgencyKeywords.some(k => text.includes(k));

        // Business logic flags
        const isDefaulting = text.includes('default') || text.includes('late');

        if (hasUrgentKeyword || isDefaulting) return 'HIGH';
        return 'MEDIUM';
    }

    /**
     * Layer 3: Structural Complexity Calculation
     */
    _calculateComplexity(submission, insights) {
        let score = 0;

        // Data density
        if (insights.length > 3) score += 2;
        if (submission.totalDebtAmount > 5000000) score += 3; // 50L+ debt is complex
        if (submission.planningPurpose === 'business_expansion') score += 2;

        if (score >= 5) return 'COMPLEX';
        if (score >= 2) return 'MODERATE';
        return 'SIMPLE';
    }

    /**
     * Layer 4: Specialist Recommendation Engine
     */
    _mapExpertise(intent) {
        const experts = [];

        if (intent.nuances.includes('TAX_OPTIMIZATION')) experts.push('TAX_SPECIALIST');
        if (intent.nuances.includes('DEBT_DISTRESS')) experts.push('DEBT_RESTRUCTURING_EXPERT');
        if (intent.complexityLevel === 'COMPLEX') experts.push('SENIOR_STRATEGIST');

        if (experts.length === 0) experts.push('GENERALIST_PLANNER');

        return [...new Set(experts)];
    }

    /**
     * ML Model Interface (Placeholder for future FastAPI/SageMaker integration)
     * For production, this would call a real inference endpoint.
     */
    async callExternalMLInference(data) {
        // [TODO] Implement AWS SageMaker / Vertex AI call
        // const response = await axios.post(process.env.ML_ENDPOINT, data);
        return null;
    }
}

module.exports = new DemandIntelligenceService();
