const { OpenAI } = require('openai');
const Groq = require('groq-sdk');
const { DocumentInsight, FinancialPlanningSubmission, User } = require('../models');
const systemBriefingService = require('./systemBriefingService');

/**
 * Professional AI Briefing Service
 * Synthesizes multiple data sources (submission + document insights) into a unified briefing.
 */
class BriefingService {
    constructor() {
        this.openaiClient = null;
        this.groqClient = null;
    }

    _getOpenAIClient() {
        if (!this.openaiClient && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
            this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        return this.openaiClient;
    }

    _getGroqClient() {
        if (!this.groqClient && process.env.GROQ_API_KEY) {
            this.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
        return this.groqClient;
    }

    _getActiveProvider() {
        if (this._getGroqClient()) return 'groq';
        if (this._getOpenAIClient()) return 'openai';
        return 'mock';
    }

    /**
     * Generate a unified briefing for a professional
     */
    async generateBriefing(submissionId) {
        const submission = await FinancialPlanningSubmission.findByPk(submissionId, {
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        });

        if (!submission) throw new Error('Submission not found');

        const insights = await DocumentInsight.findAll({
            where: { submissionId }
        });

        // 1. Try system-based synthesis first
        const systemBriefing = systemBriefingService.generateSystemBriefing(submission, insights);

        // Logic to determine if we need AI
        // If we have red flags from insights or complex liabilities, we might still want AI
        const needsAISynthesis = insights.some(i => i.redFlags && i.redFlags.length > 0) ||
            (submission.liabilities && Object.keys(submission.liabilities).length > 2);

        if (!needsAISynthesis) {
            console.log(`[BriefingService] System briefing sufficient for ${submissionId}, skipping AI.`);
            return systemBriefing;
        }

        console.log(`[BriefingService] System briefing requires AI enhancement for ${submissionId}...`);

        const provider = this._getActiveProvider();

        if (provider === 'mock') {
            return systemBriefing; // Better than the old mock
        }

        const prompt = this._buildBriefingPrompt(submission, insights);

        try {
            if (provider === 'groq') {
                return await this._callGroq(prompt);
            } else {
                return await this._callOpenAI(prompt);
            }
        } catch (error) {
            console.error('Briefing API error:', error);
            return this._getMockBriefing(submission, insights, true);
        }
    }

    _buildBriefingPrompt(submission, insights) {
        const docSummaries = insights.map(i => `- ${i.insightType}: ${i.summary}`).join('\n');

        return `You are a Senior Financial Strategy Consultant. Your task is to provide a concise, high-impact briefing for a Financial Analyst who is about to meet this client.

CLIENT PROFILE:
- Risk Score: ${submission.riskScore}/100
- Monthly Income: ${submission.monthlyIncome}
- Assets: ${JSON.stringify(submission.assets)}
- Liabilities: ${JSON.stringify(submission.liabilities)}
- Success Priority: ${submission.successPriority}

AI DOCUMENT INSIGHTS:
${docSummaries || 'No documents analyzed yet.'}

BASED ON THIS CONTEXT, PROVIDE:
1. KEY DATA: (Exact numbers for Net Worth, Debt-to-Income, and Surplus)
2. CRITICAL RISKS: (Top 3 items the analyst must address)
3. STRATEGY OUTLINE: (Recommended approach for the call)
4. QUESTIONS TO ASK: (3 specific questions to clarify data gaps)

Return a structured JSON object with these EXACT keys and data types: 
"keyMetrics": { "netWorth": string, "debtToIncome": string, "monthlySurplus": string }, 
"criticalRisks": array of strings, 
"strategyOutline": string (DO NOT return an object here, must be a plain description), 
"actionPlan": array of strings. 

Maintain professional tone. Return ONLY valid JSON.`;
    }

    async _callGroq(prompt) {
        const client = this._getGroqClient();
        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            response_format: { type: "json_object" }
        });
        return JSON.parse(response.choices[0].message.content);
    }

    async _callOpenAI(prompt) {
        const client = this._getOpenAIClient();
        const response = await client.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        return JSON.parse(response.choices[0].message.content);
    }

    _getMockBriefing(submission, insights, isError = false) {
        return {
            keyMetrics: {
                netWorth: "Calculated from assets/liabilities",
                debtToIncome: "Calculating...",
                monthlySurplus: submission.monthlySavings || "Unknown"
            },
            criticalRisks: [
                isError ? "AI Service temporarily unavailable. Review documents manually." : "Needs comprehensive risk assessment.",
                "Verify debt-to-income ratio based on bank statements.",
                "Check for protection gaps in life/health insurance."
            ],
            strategyOutline: `Focus on financial strategy based on target timeline and risk score. Align existing assets with the target timeline.`,
            actionPlan: [
                "Review bank statements for EMI consistency",
                "Validate tax residency status",
                "Prepare investment reallocation plan"
            ],
            _isMock: true
        };
    }
}

module.exports = new BriefingService();
