const { OpenAI } = require('openai');
const Groq = require('groq-sdk');

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
function buildPrompt(text, documentType) {
    if (documentType === 'wealth_monitor') {
        return `You are an expert Financial Strategy Consultant. 
Analyze this receipt/bill and provide financial insights for wealth monitoring.

TEXT FROM RECEIPT:
${text.substring(0, 12000)}

Return a JSON object with this structure:
{
  "extractedData": {
    "merchantName": "string",
    "amount": number,
    "category": "Food/Travel/Shopping/Luxury/Utilities/Healthcare/Other",
    "isAvoidable": boolean,
    "itrRelevance": "80C/80D/Business/None"
  },
  "summary": "1-2 sentence advice on if this purchase helps or hurts their financial goals",
  "recommendations": ["1-2 actionable steps for budgeting"],
  "confidenceScore": 0.8
}

Return ONLY valid JSON.`;
    }

    return `You are an expert Financial Analyst specializing in Indian financial documents.
Analyze the following document text and extract structured financial intelligence.

DOCUMENT CATEGORY: ${documentType}

DOCUMENT TEXT:
${text.substring(0, 12000)}

Extract and return a JSON object with this structure:
{
  "extractedData": {
    "documentType": "${documentType}",
    "accountHolder": "name if found",
    "institution": "bank/org name if found",
    "period": "date range covered",
    "totalCredits": 0,
    "totalDebits": 0,
    "avgMonthlyBalance": 0,
    "revenueTrend": "up/down/flat",
    "cashPercentage": 0,
    "gstMismatchFlags": [],
    "loanEmis": [],
    "keyTransactions": []
  },
  "summary": "string (2-3 sentence overview)",
  "redFlags": ["array of strings (concise risks)"],
  "recommendations": ["array of strings (actionable steps)"],
  "confidenceScore": 0.0
}

Guidelines:
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
 * Main extraction function
 */
exports.extractFinancialData = async (text, documentType) => {
    const provider = getActiveProvider();
    console.log(`[ExtractionService] Using provider: ${provider} for document type: ${documentType}`);

    if (provider === 'mock') {
        console.warn('[ExtractionService] No AI provider configured. Add GROQ_API_KEY or OPENAI_API_KEY to .env');
        console.warn('[ExtractionService] Get free Groq API key at: https://console.groq.com');
        return getMockAnalysis(documentType);
    }

    const prompt = buildPrompt(text, documentType);

    try {
        let result;
        if (provider === 'groq') {
            result = await callGroq(prompt);
            console.log('[ExtractionService] Groq analysis completed successfully');
        } else {
            result = await callOpenAI(prompt);
            console.log('[ExtractionService] OpenAI analysis completed successfully');
        }

        // Add metadata
        result._meta = {
            provider,
            analyzedAt: new Date().toISOString(),
            documentType
        };

        return result;
    } catch (error) {
        console.error(`[ExtractionService] ${provider} API error:`, error.message);

        // Try fallback to other provider
        if (provider === 'groq' && getOpenAIClient()) {
            console.log('[ExtractionService] Falling back to OpenAI...');
            try {
                const result = await callOpenAI(prompt);
                result._meta = { provider: 'openai_fallback', analyzedAt: new Date().toISOString() };
                return result;
            } catch (fallbackError) {
                console.error('[ExtractionService] OpenAI fallback also failed:', fallbackError.message);
            }
        }

        // Return mock as last resort
        console.warn('[ExtractionService] All providers failed. Returning mock analysis.');
        return getMockAnalysis(documentType);
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

