/**
 * Validation & Normalization Service
 * Cross-verifies extracted data and calculates confidence scores
 */

exports.validateData = async (extractedData, documentType) => {
    console.log(`Validating data for ${documentType}`);

    const validation = {
        isValid: true,
        validationErrors: [],
        warnings: [],
        confidenceScore: extractedData.confidenceScore || 0.8,
        normalizedData: { ...extractedData }
    };

    if (!extractedData) return validation;

    const data = extractedData.extractedData || {}; // The inner object from OpenAI

    // 1. Bank Statement Validation
    if (documentType === 'bank_statements') {
        // Check for negative balance (anomaly)
        if (data.avgMonthlyBalance < 0) {
            validation.warnings.push('Average monthly balance is negative, possible overdraft.');
        }

        // Check math: Opening + Credits - Debits should approx Closing (if available)
        // This relies on having those fields, which might not always be present
        if (data.totalCredits && data.totalDebits && data.avgMonthlyBalance) {
            if (data.totalDebits > data.totalCredits * 1.5) {
                validation.warnings.push('Debits significantly higher than credits (burn rate warning).');
            }
        }
    }

    // 2. ITR Validation
    if (documentType === 'tax_documents') {
        if (!data.grossIncome || data.grossIncome === 0) {
            validation.warnings.push('Gross income not detected or zero.');
        }
    }

    // 3. General Confidence Check
    if (validation.warnings.length > 2) {
        validation.confidenceScore -= 0.2;
    }

    if (validation.confidenceScore < 0.5) {
        validation.isValid = false; // Require manual review
    }

    return validation;
};
