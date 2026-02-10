const { OpenAI } = require('openai');
const Groq = require('groq-sdk');
const logger = require('../utils/logger');
const systemExtractionService = require('./systemExtractionService');
const vectorStoreService = require('./vectorStoreService');
const piiScrubber = require('../utils/piiScrubber');
const { DocumentInsight, FinancialPlanningSubmission, User } = require('../models');

const PROMPT_VERSION = 'V2.0-LOGIC-TRACE';

/**
 * Multi-Provider Financial Data Extraction Service
 * Supports: Groq (free tier available) and OpenAI
 * Priority: Groq > OpenAI > Mock fallback
 */

// Initialize providers lazily
let openaiClient = null;
let groqClient = null;

function getOpenAIClient() {
    if (!openaiClient && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openaiClient;
}

function getGroqClient() {
    if (!groqClient && process.env.GROQ_API_KEY) {
        groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groqClient;
}

/**
 * Determine which AI provider to use
 */
function getActiveProvider() {
    if (getGroqClient()) return 'groq';
    if (getOpenAIClient()) return 'openai';
    return 'mock';
}

/**
 * Build the analysis prompt
 */
function buildPrompt(text, documentType, context = '') {
    const contextPrompt = context ? `\n\nRELEVANT CONTEXT FROM OTHER DOCUMENTS OR GUIDELINES:\n${context}` : '';

    if (documentType === 'wealth_monitor') {
        return `You are an expert Financial Strategy Consultant. 
Analyze this receipt/bill and provide financial insights for wealth monitoring.
${contextPrompt}

TEXT FROM RECEIPT:
${text.substring(0, 12000)}

Return a JSON object with this structure:
{
  "extractedData": {
    "merchantName": "string",
    "amount": { "value": number, "evidence_snippet": "exact text from receipt" },
    "category": { "value": "Food/...", "evidence_snippet": "reasoning text" },
    "isAvoidable": boolean,
    "itrRelevance": "80C/80D/Business/None"
  },
  "summary": "1-2 sentence advice...",
  "recommendations": ["1-2 actionable steps"],
  "confidenceScore": 0.8
}

CRITICAL: All monetary values MUST use Indian Rupees (₹). Do NOT use dollars ($).
Return ONLY valid JSON.`;
    }

    return `You are an expert Financial Analyst specializing in Indian financial documents.
Analyze the following document text and extract structured financial intelligence.
${contextPrompt}

DOCUMENT CATEGORY: ${documentType}

DOCUMENT TEXT:
${text.substring(0, 12000)}

Extract and return a JSON object with this structure:
{
  "extractedData": {
    "documentType": "${documentType}",
    "accountHolder": { "value": "name", "evidence_snippet": "snippet" },
    "institution": { "value": "bank", "evidence_snippet": "snippet" },
    "period": { "value": "range", "evidence_snippet": "snippet" },
    "totalCredits": { "value": 0, "evidence_snippet": "snippet" },
    "totalDebits": { "value": 0, "evidence_snippet": "snippet" },
    "avgMonthlyBalance": { "value": 0, "evidence_snippet": "snippet" },
    "revenueTrend": "up/down/flat",
    "cashPercentage": 0,
    "gstMismatchFlags": [],
    "loanEmis": [ { "amount": 0, "lender": "bank", "evidence_snippet": "snippet" } ],
    "keyTransactions": []
  },
  "summary": "string (2-3 sentence overview)",
  "redFlags": ["array of strings (concise risks)"],
  "recommendations": ["array of strings (actionable steps)"],
  "confidenceScore": 0.0
}

CRITICAL: For every field in extractedData (except ID strings), you MUST provide an "evidence_snippet" which is the EXACT verbatim text from the document that supports the value. If no evidence exists, set snippet to null.

Guidelines:
- All monetary values MUST use Indian Rupees (₹). Do NOT use dollars ($).
- Set confidenceScore between 0.0-1.0 based on data clarity
- Identify any red flags like unusual transactions, mismatches, or compliance issues
- For bank statements: focus on cash flow patterns and EMI obligations
- For tax documents: focus on compliance and filing status
- For GST returns: check for 2A vs 3B mismatches

Return ONLY valid JSON, no additional text.`;
}

/**
 * Helper to safely parse JSON from LLM responses
 * Handles potential markdown code blocks
 */
function parseLLMResponse(content) {
    try {
        // Try direct parse first
        return JSON.parse(content);
    } catch (e) {
        // Try extracting from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch (innerError) {
                console.error('Failed to parse JSON inside markdown block:', innerError);
            }
        }

        // Final attempt: find the first { and last }
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            try {
                return JSON.parse(content.substring(start, end + 1));
            } catch (bracketError) {
                console.error('Failed to parse JSON between brackets:', bracketError);
            }
        }

        throw new Error('Could not extract valid JSON from AI response');
    }
}

/**
 * Call Groq API
 */
async function callGroq(prompt) {
    const client = getGroqClient();
    if (!client) throw new Error('Groq client not initialized');

    const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
    });

    return parseLLMResponse(response.choices[0].message.content);
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt) {
    const client = getOpenAIClient();
    if (!client) throw new Error('OpenAI client not initialized');

    const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });

    return parseLLMResponse(response.choices[0].message.content);
}

/**
 * Local Heuristic Parsing
 * Uses regex and keyword matching to extract data without AI
 */
/**
 * Local Heuristic Parsing - Now uses systemExtractionService
 */
async function localHeuristicParse(text, documentType) {
    try {
        return await systemExtractionService.extractBasicData(text, documentType);
    } catch (error) {
        console.error('Error in system extraction:', error);
        return {
            extractedData: { documentType },
            confidenceScore: 0.0,
            _error: error.message
        };
    }
}

/**
 * Main extraction function - Gated by Confidence
 */
exports.extractFinancialData = async (text, documentType, submissionId = null) => {
    logger.info('Starting extraction', { documentType, submissionId });

    // 1. Try Local Heuristic Parse First (Deterministic Core)
    const heuristicResult = await localHeuristicParse(text, documentType);
    logger.info('Heuristic confidence score', { score: heuristicResult.confidenceScore });

    // GATE 1: Extreme Confidence (>0.95) -> FULLY DETERMINISTIC, NO LLM
    if (heuristicResult.confidenceScore >= 0.95) {
        logger.info('DETERMINISTIC HIGH CONFIDENCE: Skipping LLM (Authority Layer 1)');
        heuristicResult._meta = {
            provider: 'local_heuristic',
            analyzedAt: new Date().toISOString(),
            documentType,
            gating: 'High confidence bypass (Authority: 1)'
        };
        return heuristicResult;
    }

    // GATE 2: Low/Critical Uncertainty (<0.40) -> ANALYST ONLY, NO LLM
    if (heuristicResult.confidenceScore < 0.40) {
        console.log('[ExtractionService] LOW CONFIDENCE: Escalating directly to analyst. LLM PROHIBITED.');
        const mock = getMockAnalysis(documentType);
        mock.confidenceScore = heuristicResult.confidenceScore;
        mock.summary = "ESCALATED TO ANALYST: Confidence below 0.40. LLM usage blocked for safety.";
        mock._meta = {
            provider: 'none',
            analyzedAt: new Date().toISOString(),
            gating: 'Low confidence escalation (Analyst required)'
        };
        return mock;
    }

    // GATE 3: Medium Confidence (0.40 - 0.85) -> LIMITED LLM for clarification/explanation
    const provider = getActiveProvider();
    console.log(`[ExtractionService] MEDIUM CONFIDENCE range: Using ${provider} for read-only UX assistance.`);

    if (provider === 'mock') {
        const mock = getMockAnalysis(documentType);
        if (heuristicResult.confidenceScore > 0) {
            mock.extractedData = { ...mock.extractedData, ...heuristicResult.extractedData };
        }
        return mock;
    }

    // 2. RETRIEVE RAG CONTEXT
    let context = '';
    if (submissionId) {
        try {
            const chunks = await vectorStoreService.findContextForAnalysis(text, submissionId);
            context = chunks.map(c => `[Context from ${c.metadata?.fileName || 'Knowledge Base'}]: ${c.content}`).join('\n\n');
            logger.info('RAG context retrieved', { chunkCount: chunks.length });
        } catch (ragError) {
            logger.error('Failed to retrieve RAG context', { error: ragError.message });
        }
    }

    // 3. PII SCRUB — remove sensitive identifiers before sending to external LLM
    const { scrubbed: scrubbedText, restore: restorePII, piiFound } = piiScrubber.scrub(text);
    if (piiFound.length > 0) {
        logger.info('PII scrubbed before LLM call', { count: piiFound.length, types: piiFound.map(p => p.type) });
    }

    const prompt = buildPrompt(scrubbedText, documentType, context);

    try {
        let result;
        if (provider === 'groq') {
            result = await callGroq(prompt);
        } else {
            result = await callOpenAI(prompt);
        }

        // Restore PII tokens in the result
        if (result.summary) result.summary = restorePII(result.summary);
        if (result.extractedData) {
            // Restore PII in string values within extractedData
            for (const [key, val] of Object.entries(result.extractedData)) {
                if (typeof val === 'string') {
                    result.extractedData[key] = restorePII(val);
                } else if (val && typeof val === 'object' && 'value' in val && typeof val.value === 'string') {
                    val.value = restorePII(val.value);
                }
            }
        }

        // Add Gating Metadata and ensure confidence reflects deterministic inputs
        result._meta = {
            provider,
            analyzedAt: new Date().toISOString(),
            documentType,
            promptVersion: PROMPT_VERSION,
            inputLength: text.length,
            heuristicConfidence: heuristicResult.confidenceScore,
            gating: heuristicResult.confidenceScore >= 0.65 ? 'Limited LLM Explanation' : 'Analyst Required - Summarization only',
            hasRagContext: !!context,
            piiScrubbed: piiFound.length > 0,
            piiCount: piiFound.length
        };

        return result;
    } catch (error) {
        console.error(`[ExtractionService] ${provider} API error:`, error.message);
        return heuristicResult;
    }
};

/**
 * Check if real AI is available
 */
exports.isAIAvailable = () => {
    return getActiveProvider() !== 'mock';
};

/**
 * Get current provider info
 */
exports.getProviderInfo = () => {
    const provider = getActiveProvider();
    return {
        provider,
        isConfigured: provider !== 'mock',
        message: provider === 'mock'
            ? 'No AI provider configured. Add GROQ_API_KEY (free) or OPENAI_API_KEY to server/.env'
            : `Using ${provider.toUpperCase()} for document analysis`
    };
};

/**
 * Mock analysis fallback - returns realistic sample data
 */
function getMockAnalysis(category) {
    const baseAnalysis = {
        _meta: {
            provider: 'mock',
            analyzedAt: new Date().toISOString(),
            warning: 'This is mock data. Configure GROQ_API_KEY or OPENAI_API_KEY for real AI analysis.'
        }
    };

    if (category === 'bank_statements') {
        return {
            ...baseAnalysis,
            extractedData: {
                documentType: 'bank_statements',
                accountHolder: "Account Holder Name",
                institution: "Sample Bank",
                period: "Last 6 months",
                avgMonthlyBalance: 450000,
                totalCredits: 3200000,
                totalDebits: 2850000,
                revenueTrend: "up",
                cashPercentage: 12.5,
                loanEmis: [{ amount: 45000, lender: "Sample Bank", type: "Home Loan" }],
                keyTransactions: [
                    { type: "credit", amount: 500000, description: "Salary Credit" },
                    { type: "debit", amount: 45000, description: "EMI Payment" }
                ]
            },
            summary: "This is MOCK data. Configure an AI API key for real analysis. Sample: Positive revenue trajectory with healthy cash-to-credit ratio visible in statement.",
            redFlags: ["⚠️ MOCK DATA - Configure GROQ_API_KEY for real analysis"],
            recommendations: ["Add GROQ_API_KEY to server/.env for AI-powered insights"],
            confidenceScore: 0.0
        };
    }

    if (category === 'tax_documents' || category === 'gst_return') {
        return {
            ...baseAnalysis,
            extractedData: {
                documentType: category,
                gstMismatchFlags: ["Sample: 2A vs 3B mismatch detected"],
                totalTaxPaid: 125000,
                filingFrequency: "monthly",
                period: "FY 2024-25"
            },
            summary: "This is MOCK data. Configure an AI API key for real GST/tax document analysis.",
            redFlags: ["⚠️ MOCK DATA - Configure GROQ_API_KEY for real analysis"],
            recommendations: ["Add GROQ_API_KEY to server/.env for accurate tax insights"],
            confidenceScore: 0.0
        };
    }

    return {
        ...baseAnalysis,
        extractedData: {
            documentType: category || 'other',
            totalValue: 0,
            period: "Unknown"
        },
        summary: "This is MOCK data. The document was received but not analyzed by AI. Configure GROQ_API_KEY (free) or OPENAI_API_KEY in server/.env for real analysis.",
        redFlags: ["⚠️ MOCK DATA - No AI provider configured"],
        recommendations: [
            "Get free Groq API key at https://console.groq.com",
            "Add GROQ_API_KEY=your_key to server/.env file"
        ],
        confidenceScore: 0.0
    };
}

