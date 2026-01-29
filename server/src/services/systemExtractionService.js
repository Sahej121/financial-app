/**
 * System Extraction Service
 * Performs lightweight regex-based extraction to reduce reliance on AI APIs.
 */

exports.extractBasicData = async (text, documentType) => {
    const data = {
        extractedData: {
            documentType,
            accountHolder: null,
            institution: null,
            period: null,
            totalCredits: 0,
            totalDebits: 0,
            avgMonthlyBalance: 0,
            ids: {},
            amounts: []
        },
        summary: "Automated system extraction (No AI used)",
        redFlags: [],
        confidenceScore: 0.1, // Start low
        isSystemExtracted: true
    };

    const lines = text.split('\n');
    const lowerText = text.toLowerCase();

    // 1. Extract IDs (PAN, Aadhaar, GSTIN)
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
    const aadhaarRegex = /\d{4}\s\d{4}\s\d{4}/g;
    const gstinRegex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}/g;

    const panMatches = text.match(panRegex);
    if (panMatches) {
        data.extractedData.ids.pan = panMatches[0];
        data.confidenceScore += 0.2;
    }

    const aadhaarMatches = text.match(aadhaarRegex);
    if (aadhaarMatches) {
        data.extractedData.ids.aadhaar = aadhaarMatches[0];
        data.confidenceScore += 0.2;
    }

    const gstinMatches = text.match(gstinRegex);
    if (gstinMatches) {
        data.extractedData.ids.gstin = gstinMatches[0];
        data.confidenceScore += 0.2;
    }

    // 2. Extract Bank/Institution
    const banks = ['hdfc', 'icici', 'axis', 'sbi', 'state bank', 'kotak', 'yes bank', 'indian bank'];
    for (const bank of banks) {
        if (lowerText.includes(bank)) {
            data.extractedData.institution = bank.toUpperCase();
            data.confidenceScore += 0.1;
            break;
        }
    }

    // 3. Extract Amounts (Simple heuristic: look for balance/total/credit/debit + amount)
    // This is very basic, just to show it's doing something
    const amountRegex = /(?:rs\.?|inr|total|balance|credit|debit)\s*:?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi;
    let match;
    while ((match = amountRegex.exec(text)) !== null) {
        const val = parseFloat(match[1].replace(/,/g, ''));
        if (val > 0) data.extractedData.amounts.push(val);
    }

    if (data.extractedData.amounts.length > 0) {
        data.confidenceScore += 0.1;
    }

    // 4. Document-specific system parsing
    if (documentType === 'bank_statements') {
        const balanceMatch = lowerText.match(/(?:closing|final|available)\s+balance\s*:?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i);
        if (balanceMatch) {
            data.extractedData.avgMonthlyBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
            data.confidenceScore += 0.1;
        }
    }

    // Determine if we can skip AI
    // For IDs/simple docs, if we found them, it's pretty good
    if (data.extractedData.ids.pan || data.extractedData.ids.aadhaar || data.extractedData.ids.gstin) {
        data.canSkipAI = true;
        data.summary = "Identity document processed via system parser.";
        data.confidenceScore = Math.min(data.confidenceScore + 0.3, 0.95);
    } else {
        data.canSkipAI = false;
    }

    return data;
};
