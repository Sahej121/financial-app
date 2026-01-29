/**
 * Invoice Extraction Service
 * Uses existing OCR + AI pipeline to extract invoice data from uploaded documents
 */

const ocrService = require('./ocrService');
const extractionService = require('./extractionService');
const { validateGSTIN, calculateGST, getGSTRCategory, getFilingPeriod } = require('./gstCalculationService');

/**
 * Extract invoice data from uploaded document
 * @param {string} filePath - Path to uploaded document
 * @param {string} mimeType - Document MIME type
 * @param {string} sellerStateCode - Seller's state code for GST calculation
 * @returns {object} - Extracted invoice data with confidence scores
 */
async function extractInvoiceFromDocument(filePath, mimeType, sellerStateCode) {
    try {
        // Step 1: OCR - Extract text from document
        console.log('[Invoice Extraction] Starting OCR...');
        const ocrResult = await ocrService.extractText(filePath, mimeType);

        if (!ocrResult.text || ocrResult.text.length < 50) {
            return {
                success: false,
                error: 'Could not extract sufficient text from document',
                confidence: 0
            };
        }

        // Step 2: AI Extraction - Parse invoice fields from text
        console.log('[Invoice Extraction] Running AI extraction...');
        const extractedData = await extractInvoiceFields(ocrResult.text);

        if (!extractedData.success) {
            return {
                success: false,
                error: extractedData.error || 'Failed to extract invoice fields',
                confidence: 0,
                rawText: ocrResult.text
            };
        }

        // Step 3: Validate and enhance data
        const enhancedData = enhanceInvoiceData(extractedData.data, sellerStateCode);

        // Step 4: Calculate confidence score
        const confidence = calculateExtractionConfidence(enhancedData);

        return {
            success: true,
            data: enhancedData,
            confidence,
            rawText: ocrResult.text,
            extractionErrors: enhancedData.validationErrors || []
        };

    } catch (error) {
        console.error('[Invoice Extraction] Error:', error);
        return {
            success: false,
            error: error.message,
            confidence: 0
        };
    }
}

/**
 * Extract invoice fields using AI (Groq/OpenAI)
 */
async function extractInvoiceFields(text) {
    const prompt = buildInvoiceExtractionPrompt(text);

    try {
        // Use existing extraction service for AI calls
        const result = await extractionService.extractFinancialData(text, 'invoice');

        // If using mock fallback, try direct parsing
        if (result.isMock) {
            return parseInvoiceDirectly(text);
        }

        return {
            success: true,
            data: normalizeExtractedInvoice(result)
        };

    } catch (error) {
        console.error('[AI Extraction] Error:', error);
        // Fallback to regex-based extraction
        return parseInvoiceDirectly(text);
    }
}

/**
 * Build AI prompt for invoice extraction
 */
function buildInvoiceExtractionPrompt(text) {
    return `Extract invoice details from the following text. Return a JSON object with these fields:
{
  "invoiceNumber": "string",
  "invoiceDate": "YYYY-MM-DD",
  "sellerName": "string",
  "sellerGstin": "15-char GSTIN",
  "buyerName": "string", 
  "buyerGstin": "15-char GSTIN or null",
  "placeOfSupply": "2-digit state code",
  "items": [
    {
      "description": "string",
      "hsnSac": "4-8 digit code",
      "quantity": number,
      "rate": number,
      "taxableValue": number,
      "gstRate": number,
      "cgst": number,
      "sgst": number,
      "igst": number
    }
  ],
  "totalTaxableValue": number,
  "totalCgst": number,
  "totalSgst": number,
  "totalIgst": number,
  "totalAmount": number,
  "isReverseCharge": boolean
}

Invoice Text:
${text}

Return ONLY the JSON object, no explanations.`;
}

/**
 * Regex-based fallback extraction
 */
function parseInvoiceDirectly(text) {
    const data = {
        invoiceNumber: null,
        invoiceDate: null,
        sellerGstin: null,
        buyerGstin: null,
        items: [],
        totalAmount: null,
        validationErrors: []
    };

    // Extract GSTIN (15 character pattern)
    const gstinPattern = /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/g;
    const gstinMatches = text.match(gstinPattern);
    if (gstinMatches && gstinMatches.length >= 1) {
        data.sellerGstin = gstinMatches[0];
        if (gstinMatches.length >= 2) {
            data.buyerGstin = gstinMatches[1];
        }
    }

    // Extract Invoice Number
    const invNumPatterns = [
        /Invoice\s*(?:No|Number|#)[:\s]*([A-Za-z0-9/-]+)/i,
        /Inv\s*(?:No|#)[:\s]*([A-Za-z0-9/-]+)/i,
        /Bill\s*(?:No|Number)[:\s]*([A-Za-z0-9/-]+)/i
    ];
    for (const pattern of invNumPatterns) {
        const match = text.match(pattern);
        if (match) {
            data.invoiceNumber = match[1].trim();
            break;
        }
    }

    // Extract Date
    const datePatterns = [
        /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
        /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i
    ];
    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            data.invoiceDate = parseDate(match[1]);
            break;
        }
    }

    // Extract Total Amount
    const amountPatterns = [
        /(?:Total|Grand\s*Total|Amount\s*Payable)[:\s]*₹?\s*([\d,]+\.?\d*)/i,
        /₹\s*([\d,]+\.?\d*)\s*(?:only)?$/im
    ];
    for (const pattern of amountPatterns) {
        const match = text.match(pattern);
        if (match) {
            data.totalAmount = parseFloat(match[1].replace(/,/g, ''));
            break;
        }
    }

    // Extract HSN Codes
    const hsnPattern = /\b(\d{4,8})\b/g;
    const hsnMatches = text.match(hsnPattern);
    if (hsnMatches) {
        data.potentialHsnCodes = [...new Set(hsnMatches.filter(h => h.length >= 4 && h.length <= 8))];
    }

    // Add validation errors for missing fields
    if (!data.invoiceNumber) data.validationErrors.push('Invoice number not found');
    if (!data.invoiceDate) data.validationErrors.push('Invoice date not found');
    if (!data.sellerGstin) data.validationErrors.push('Seller GSTIN not found');
    if (!data.totalAmount) data.validationErrors.push('Total amount not found');

    return {
        success: true,
        data,
        extractionMethod: 'regex'
    };
}

/**
 * Parse date string to standard format
 */
function parseDate(dateStr) {
    try {
        // Try various formats
        const formats = [
            /(\d{2})[-/](\d{2})[-/](\d{4})/,  // DD-MM-YYYY
            /(\d{2})[-/](\d{2})[-/](\d{2})/,   // DD-MM-YY
            /(\d{4})[-/](\d{2})[-/](\d{2})/    // YYYY-MM-DD
        ];

        for (const format of formats) {
            const match = dateStr.match(format);
            if (match) {
                if (match[1].length === 4) {
                    // YYYY-MM-DD
                    return `${match[1]}-${match[2]}-${match[3]}`;
                } else if (match[3].length === 4) {
                    // DD-MM-YYYY
                    return `${match[3]}-${match[2]}-${match[1]}`;
                } else {
                    // DD-MM-YY
                    const year = parseInt(match[3]) > 50 ? '19' + match[3] : '20' + match[3];
                    return `${year}-${match[2]}-${match[1]}`;
                }
            }
        }

        // Try natural language date
        const d = new Date(dateStr);
        if (!isNaN(d)) {
            return d.toISOString().split('T')[0];
        }

        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Normalize AI-extracted invoice data
 */
function normalizeExtractedInvoice(extracted) {
    return {
        invoiceNumber: extracted.invoiceNumber || extracted.invoice_number || null,
        invoiceDate: extracted.invoiceDate || extracted.invoice_date || null,
        sellerName: extracted.sellerName || extracted.seller_name || null,
        sellerGstin: extracted.sellerGstin || extracted.seller_gstin || null,
        buyerName: extracted.buyerName || extracted.buyer_name || null,
        buyerGstin: extracted.buyerGstin || extracted.buyer_gstin || null,
        placeOfSupply: extracted.placeOfSupply || extracted.place_of_supply || null,
        items: (extracted.items || []).map(item => ({
            description: item.description || '',
            hsnSac: item.hsnSac || item.hsn_sac || item.hsn || '',
            quantity: parseFloat(item.quantity) || 1,
            rate: parseFloat(item.rate) || 0,
            taxableValue: parseFloat(item.taxableValue || item.taxable_value) || 0,
            gstRate: parseFloat(item.gstRate || item.gst_rate) || 18,
            cgst: parseFloat(item.cgst) || 0,
            sgst: parseFloat(item.sgst) || 0,
            igst: parseFloat(item.igst) || 0
        })),
        totalTaxableValue: parseFloat(extracted.totalTaxableValue || extracted.total_taxable_value) || 0,
        totalCgst: parseFloat(extracted.totalCgst || extracted.total_cgst) || 0,
        totalSgst: parseFloat(extracted.totalSgst || extracted.total_sgst) || 0,
        totalIgst: parseFloat(extracted.totalIgst || extracted.total_igst) || 0,
        totalAmount: parseFloat(extracted.totalAmount || extracted.total_amount) || 0,
        reverseCharge: extracted.isReverseCharge || extracted.reverse_charge || false
    };
}

/**
 * Enhance extracted data with validations and calculations
 */
function enhanceInvoiceData(data, sellerStateCode) {
    const enhanced = { ...data };
    enhanced.validationErrors = enhanced.validationErrors || [];

    // Validate GSTINs
    if (enhanced.sellerGstin) {
        const validation = validateGSTIN(enhanced.sellerGstin);
        if (!validation.isValid) {
            enhanced.validationErrors.push(`Seller GSTIN: ${validation.error}`);
        } else {
            enhanced.sellerStateCode = validation.details.stateCode;
        }
    }

    if (enhanced.buyerGstin) {
        const validation = validateGSTIN(enhanced.buyerGstin);
        if (!validation.isValid) {
            enhanced.validationErrors.push(`Buyer GSTIN: ${validation.error}`);
        } else {
            enhanced.buyerStateCode = validation.details.stateCode;
        }
    }

    // Determine invoice type and category
    if (data.invoiceType === 'sales' || !data.invoiceType) {
        enhanced.invoiceType = 'sales';
        enhanced.counterpartyGstin = enhanced.buyerGstin;
        enhanced.counterpartyName = enhanced.buyerName;
    } else {
        enhanced.invoiceType = 'purchase';
        enhanced.counterpartyGstin = enhanced.sellerGstin;
        enhanced.counterpartyName = enhanced.sellerName;
    }

    // Determine place of supply
    if (!enhanced.placeOfSupply && enhanced.buyerStateCode) {
        enhanced.placeOfSupply = enhanced.buyerStateCode;
    }

    // Calculate filing period
    if (enhanced.invoiceDate) {
        enhanced.filingPeriod = getFilingPeriod(enhanced.invoiceDate);
    }

    // Determine GSTR category
    enhanced.gstrCategory = getGSTRCategory({
        counterpartyGstin: enhanced.counterpartyGstin,
        totalAmount: enhanced.totalAmount,
        invoiceType: enhanced.invoiceType,
        isInterState: enhanced.placeOfSupply !== sellerStateCode
    });

    return enhanced;
}

/**
 * Calculate confidence score based on extracted data quality
 */
function calculateExtractionConfidence(data) {
    let score = 0;
    const weights = {
        invoiceNumber: 15,
        invoiceDate: 15,
        sellerGstin: 10,
        buyerGstin: 10,
        placeOfSupply: 5,
        items: 20,
        totalTaxableValue: 10,
        totalAmount: 15
    };

    if (data.invoiceNumber) score += weights.invoiceNumber;
    if (data.invoiceDate) score += weights.invoiceDate;
    if (data.sellerGstin && validateGSTIN(data.sellerGstin).isValid) score += weights.sellerGstin;
    if (data.buyerGstin && validateGSTIN(data.buyerGstin).isValid) score += weights.buyerGstin;
    if (data.placeOfSupply) score += weights.placeOfSupply;
    if (data.items && data.items.length > 0) {
        const itemScore = Math.min(data.items.length * 5, weights.items);
        score += itemScore;
    }
    if (data.totalTaxableValue > 0) score += weights.totalTaxableValue;
    if (data.totalAmount > 0) score += weights.totalAmount;

    // Reduce score for validation errors
    const errorPenalty = (data.validationErrors?.length || 0) * 5;
    score = Math.max(0, score - errorPenalty);

    return Math.round(score) / 100;
}

module.exports = {
    extractInvoiceFromDocument,
    extractInvoiceFields,
    parseInvoiceDirectly,
    enhanceInvoiceData,
    calculateExtractionConfidence
};
