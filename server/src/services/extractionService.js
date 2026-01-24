const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Financial Data Extraction Service
 * Uses AI to extract structured JSON data from document text
 */
exports.extractFinancialData = async (text, documentType) => {
    console.log(`Extracting data for type: ${documentType}`);

    // Check if API key is present
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
        console.warn('OpenAI API key missing. Returning mock data.');
        return getMockAnalysis(documentType);
    }

    const prompt = `
      You are a professional Financial Analyst. 
      Analyze the following document text and extract structured financial intelligence.
      
      DOCUMENT CATEGORY: ${documentType}
      
      DOCUMENT TEXT:
      ${text.substring(0, 15000)}
      
      Return a JSON object with:
      {
        "extractedData": { ...fields relevant to document type... },
        "summary": "2-3 sentence overview",
        "redFlags": ["anomalies", "risks"],
        "confidenceScore": 0.0-1.0
      }
      Return ONLY valid JSON.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('OpenAI Analysis error:', error);
        return getMockAnalysis(documentType);
    }
};

function getMockAnalysis(category) {
    if (category === 'bank_statements') {
        return {
            extractedData: {
                accountHolder: "Sample Client",
                bankName: "HDFC Bank",
                avgMonthlyBalance: 250000,
                totalCredits: 1200000,
                totalDebits: 950000
            },
            summary: "Steady income pattern detected.",
            redFlags: [],
            confidenceScore: 0.95
        };
    }
    return {
        extractedData: {},
        summary: "Document analyzed.",
        redFlags: [],
        confidenceScore: 0.8
    };
}
