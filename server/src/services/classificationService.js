/**
 * Document Classification Service
 * Identifies the type of document (Bank Statement, ITR, GST, etc.)
 */

exports.classifyDocument = async (text, fileName) => {
    console.log(`Classifying document: ${fileName}`);

    const lowerText = text.toLowerCase();
    const lowerFileName = fileName.toLowerCase();

    // Default
    let type = 'other';
    let confidence = 0.5;
    let metadata = {};

    // Rule-based Classification
    if (lowerText.includes('savings account') || lowerText.includes('current account') ||
        lowerText.includes('statement of account') || lowerText.includes('withdrawal') ||
        lowerText.includes('deposit') || lowerFileName.includes('statement')) {

        type = 'bank_statements';
        confidence = 0.9;

        // Try to extract bank name
        if (lowerText.includes('hdfc')) metadata.bankName = 'HDFC Bank';
        else if (lowerText.includes('icici')) metadata.bankName = 'ICICI Bank';
        else if (lowerText.includes('sbi') || lowerText.includes('state bank of india')) metadata.bankName = 'SBI';
        else if (lowerText.includes('axis')) metadata.bankName = 'Axis Bank';
    }
    else if (lowerText.includes('income tax return') || lowerText.includes('itr-v') ||
        lowerText.includes('form 16') || lowerText.includes('assessment year')) {
        type = 'tax_documents'; // Maps to 'itr' in insight
        confidence = 0.95;
    }
    else if (lowerText.includes('gst') || lowerText.includes('goods and services tax')) {
        type = 'tax_documents';
        confidence = 0.9;
        metadata.subType = 'GST';
    }
    else if (lowerText.includes('payslip') || lowerText.includes('salary slip') ||
        lowerText.includes('earnings') && lowerText.includes('deductions')) {
        type = 'financial_statements'; // Salary slips / Income proof
        confidence = 0.85;
    }

    return {
        type,
        confidence,
        metadata
    };
};
