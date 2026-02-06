const logger = require('../utils/logger');
const { FinancialPlanningSubmission, DocumentInsight } = require('../models');
const aiProvider = require('../utils/aiProvider');

/**
 * Demand Intelligence Service
 * 
 * Specialized AI logic to understand the 'Nuance' of user financial demands.
 * Uses specialized LLM calls (via AIProvider) to extract intent, urgency, and complexity.
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

        // 1. Prepare Context for AI
        const context = this._buildContext(submission, insights);

        // 2. Call AI Provider
        let aiResult = null;
        try {
            const prompt = this._buildPrompt(context);
            aiResult = await aiProvider.generateJSON(prompt);
        } catch (error) {
            logger.error('AI Analysis failed, falling back to heuristics', error);
        }

        // 3. Fallback or Merge
        if (!aiResult) {
            return this._heuristicFallback(submission, insights);
        }

        logger.info('Demand analysis complete', { submissionId, intent: aiResult });
        return aiResult;
    }

    _buildContext(submission, insights) {
        const docsSummary = insights.map(i => `${i.insightType}: ${i.summary}`).join('; ');

        return {
            purpose: submission.planningPurpose,
            notes: [
                submission.expansionDetails,
                submission.settlementGoal,
                submission.otherNotes,
                submission.medicalConditions,
                submission.ethicalPreferences
            ].filter(Boolean).join('. '),
            financials: {
                income: submission.monthlyIncome,
                debt: submission.totalDebtAmount,
                assets: JSON.stringify(submission.assets || {}),
                liabilities: JSON.stringify(submission.liabilities || [])
            },
            documents: docsSummary
        };
    }

    _buildPrompt(context) {
        return `You are a Senior Financial Analyst. Analyze this client profile and return a strictly formatted JSON object.
        
        CLIENT CONTEXT:
        - Purpose: ${context.purpose}
        - Notes: ${context.notes}
        - Financials: Income ${context.financials.income}, Debt ${context.financials.debt}
        - Documents: ${context.documents}

        TASK:
        Classify the client's situation into these categories:
        1. nuances: Array of strings (e.g., "TAX_OPTIMIZATION", "DEBT_DISTRESS", "SCALING_OPPORTUNITY", "LIQUIDITY_CRUNCH", "CAPITAL_PRESERVATION", "HIGH_GROWTH", "FAMILY_ESTATE").
        2. urgency: "HIGH", "MEDIUM", or "LOW".
        3. complexityLevel: "SIMPLE", "MODERATE", or "COMPLEX".
        4. suggestedExpertise: Array of strings (e.g. "TAX_SPECIALIST", "DEBT_RESTRUCTURING_EXPERT", "WEALTH_MANAGER", "LEGAL_ADVISOR").
        5. summary: A 1-sentence executive summary of their core need.

        JSON FORMAT:
        {
            "nuances": [],
            "urgency": "",
            "complexityLevel": "",
            "suggestedExpertise": [],
            "summary": ""
        }`;
    }

    _heuristicFallback(submission, insights) {
        // ... (Keep original heuristic logic as fallback)
        const userNotes = [
            submission.expansionDetails,
            submission.settlementGoal,
            submission.otherNotes
        ].filter(Boolean).join(' ').toLowerCase();

        return {
            primaryCategory: submission.planningPurpose,
            nuances: this._extractNuances(userNotes),
            urgency: this._assessUrgency(userNotes, submission),
            complexityLevel: this._calculateComplexity(submission, insights),
            suggestedExpertise: this._mapExpertise({ nuances: this._extractNuances(userNotes), complexityLevel: 'MODERATE' }),
            summary: "AI Service unavailable. Heuristic analysis applied."
        };
    }

    // ... (Keep original helper methods _extractNuances, _assessUrgency, etc. for fallback)
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
            if (keywords.some(k => text.includes(k))) nuances.push(key);
        }
        return nuances;
    }

    _assessUrgency(text, submission) {
        if (['urgent', 'immediately', 'deadline', 'default'].some(k => text.includes(k))) return 'HIGH';
        return 'MEDIUM';
    }

    _calculateComplexity(submission, insights) {
        return (insights.length > 3 || (submission.totalDebtAmount && parseFloat(submission.totalDebtAmount) > 5000000)) ? 'COMPLEX' : 'MODERATE';
    }

    _mapExpertise(intent) {
        const experts = [];
        if (intent.nuances && intent.nuances.includes('TAX_OPTIMIZATION')) experts.push('TAX_SPECIALIST');
        if (intent.nuances && intent.nuances.includes('DEBT_DISTRESS')) experts.push('DEBT_RESTRUCTURING_EXPERT');
        if (experts.length === 0) experts.push('GENERALIST_PLANNER');
        return experts;
    }
}

module.exports = new DemandIntelligenceService();
