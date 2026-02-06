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
            merchantName: null,
            amount: 0,
            category: 'Other',
            isAvoidable: false,
            ids: {},
            amounts: [],
            keyTransactions: []
        },
        summary: "Automated system extraction (No AI used)",
        redFlags: [],
        confidenceScore: 0.1,
        isSystemExtracted: true
    };

    const lowerText = text.toLowerCase();
    const cleanText = text.replace(/\s+/g, ' ');

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
    const banks = [
        { name: 'HDFC', keywords: ['hdfc bank', 'hdfc ltd'] },
        { name: 'ICICI', keywords: ['icici bank', 'icici direct'] },
        { name: 'AXIS', keywords: ['axis bank'] },
        { name: 'SBI', keywords: ['state bank of india', 'sbi bank', 's.b.i'] },
        { name: 'KOTAK', keywords: ['kotak mahindra', 'kotak bank'] },
        { name: 'YES BANK', keywords: ['yes bank'] },
        { name: 'HSBC', keywords: ['hsbc bank'] },
        { name: 'CITIBANK', keywords: ['citibank'] }
    ];
    for (const bank of banks) {
        if (bank.keywords.some(k => lowerText.includes(k))) {
            data.extractedData.institution = bank.name;
            data.confidenceScore += 0.15;
            break;
        }
    }

    // 3. Extract Period/Date Range
    const dateRangeRegex = /((?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(?:\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}))\s*(?:to|and|-)\s*((?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(?:\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}))/i;
    const dateMatch = cleanText.match(dateRangeRegex);
    if (dateMatch) {
        data.extractedData.period = `${dateMatch[1]} to ${dateMatch[2]}`;
        data.confidenceScore += 0.1;
    }

    // 4. Document-specific system parsing
    if (documentType === 'bank_statements') {
        // Balance extraction
        const balanceRegex = /(?:closing|final|available|current|clear)\s+balance\s*:?\s*(?:rs\.?|inr)?\s*([\d,]+(?:\.\d{2})?)/i;
        const balanceMatch = cleanText.match(balanceRegex);
        if (balanceMatch) {
            data.extractedData.avgMonthlyBalance = parseFloat(balanceMatch[1].replace(/,/g, ''));
            data.confidenceScore += 0.2;
        }

        // Total Credits/Debits
        const creditRegex = /(?:total|sum\s+of)\s+credits?\s*:?\s*(?:rs\.?|inr)?\s*([\d,]+(?:\.\d{2})?)/i;
        const debitRegex = /(?:total|sum\s+of)\s+debits?\s*:?\s*(?:rs\.?|inr)?\s*([\d,]+(?:\.\d{2})?)/i;

        const creditMatch = cleanText.match(creditRegex);
        if (creditMatch) data.extractedData.totalCredits = parseFloat(creditMatch[1].replace(/,/g, ''));

        const debitMatch = cleanText.match(debitRegex);
        if (debitMatch) data.extractedData.totalDebits = parseFloat(debitMatch[1].replace(/,/g, ''));

        if (creditMatch || debitMatch) data.confidenceScore += 0.15;
    }
    else if (documentType === 'wealth_monitor' || documentType === 'receipts') {
        // Merchant name extraction
        const merchantRegex = /(?:from|merchant|store|seller|vendor|billed\s+by|paid\s+to)\s*:?\s*([A-Z0-9\s,&.-]{3,40}?)(?=\s+(?:total|amount|balance|date|paid|rs|inr|sum|$))/i;
        const merchantMatch = cleanText.match(merchantRegex);
        if (merchantMatch) {
            data.extractedData.merchantName = merchantMatch[1].trim();
            data.confidenceScore += 0.25;
        }

        // Amount extraction
        const amountRegex = /(?:total|amount|net\s+payable|grand\s+total|paid)\s*:?\s*(?:rs\.?|inr)?\s*([\d,]+(?:\.\d{2})?)/i;
        const amountMatch = cleanText.match(amountRegex);
        if (amountMatch) {
            data.extractedData.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
            data.confidenceScore += 0.3;
        }

        // Categorization heuristics
        if (lowerText.match(/restaurant|food|cafe|dinner|lunch|order|swiggy|zomato|pizza|burger/i)) {
            data.extractedData.category = 'Food';
            data.extractedData.isAvoidable = true;
        } else if (lowerText.match(/uber|ola|travel|flight|indigo|air|rail|train|irctc/i)) {
            data.extractedData.category = 'Travel';
        } else if (lowerText.match(/amazon|flipkart|myntra|reliance|jiomart|shopping/i)) {
            data.extractedData.category = 'Shopping';
        }
    }

    // Determine if we can skip AI
    if (data.confidenceScore >= 0.7) {
        data.canSkipAI = true;
        data.summary = "High-confidence deterministic extraction completed.";
    } else if (data.extractedData.ids.pan || data.extractedData.ids.aadhaar || data.extractedData.ids.gstin) {
        data.canSkipAI = true;
        data.summary = "Identity document verified via ID numbers.";
        data.confidenceScore = Math.max(data.confidenceScore, 0.85);
    } else {
        data.canSkipAI = false;
    }

    return data;
};
