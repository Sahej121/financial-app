/**
 * GST Calculation Service
 * Handles all GST-related calculations including tax rates, validation, and categorization
 */

// Indian State Codes for GST
const STATE_CODES = {
    '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
    '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
    '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur',
    '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal',
    '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
    '26': 'Dadra Nagar Haveli & Daman Diu', '27': 'Maharashtra', '29': 'Karnataka', '30': 'Goa',
    '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry', '35': 'Andaman & Nicobar',
    '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh', '97': 'Other Territory'
};

/**
 * Validate GSTIN format and checksum
 * @param {string} gstin - 15 character GSTIN
 * @returns {object} - { isValid: boolean, error: string|null, details: object }
 */
function validateGSTIN(gstin) {
    if (!gstin || typeof gstin !== 'string') {
        return { isValid: false, error: 'GSTIN is required' };
    }

    gstin = gstin.toUpperCase().trim();

    // Check length
    if (gstin.length !== 15) {
        return { isValid: false, error: 'GSTIN must be 15 characters' };
    }

    // Check format: 2 digits (state) + 10 char PAN + 1 char entity + Z + 1 checksum
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(gstin)) {
        return { isValid: false, error: 'Invalid GSTIN format' };
    }

    // Validate state code
    const stateCode = gstin.substring(0, 2);
    if (!STATE_CODES[stateCode]) {
        return { isValid: false, error: 'Invalid state code in GSTIN' };
    }

    // Checksum validation (Luhn mod 36 algorithm)
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let factor = 2;
    let sum = 0;

    for (let i = gstin.length - 2; i >= 0; i--) {
        let codePoint = chars.indexOf(gstin[i]);
        let addend = factor * codePoint;
        factor = factor === 2 ? 1 : 2;
        addend = Math.floor(addend / 36) + (addend % 36);
        sum += addend;
    }

    let remainder = sum % 36;
    let checkCodePoint = (36 - remainder) % 36;
    let expectedChecksum = chars[checkCodePoint];

    if (gstin[14] !== expectedChecksum) {
        return { isValid: false, error: 'Invalid GSTIN checksum' };
    }

    // Extract details
    return {
        isValid: true,
        error: null,
        details: {
            stateCode,
            stateName: STATE_CODES[stateCode],
            pan: gstin.substring(2, 12),
            entityNumber: gstin[12],
            checksum: gstin[14]
        }
    };
}

/**
 * Calculate GST for invoice items
 * @param {Array} items - Array of line items with hsnSac, quantity, rate
 * @param {string} placeOfSupply - State code of delivery
 * @param {string} sellerState - State code of seller
 * @param {object} hsnLookup - HSN code to rate mapping
 * @returns {object} - Calculated tax breakdown
 */
function calculateGST(items, placeOfSupply, sellerState, hsnLookup = {}) {
    const isInterState = placeOfSupply !== sellerState;

    let totalTaxableValue = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalCess = 0;

    const calculatedItems = items.map(item => {
        const taxableValue = parseFloat(item.quantity || 1) * parseFloat(item.rate || 0);
        const gstRate = hsnLookup[item.hsnSac]?.gstRate || item.gstRate || 18;
        const cessRate = hsnLookup[item.hsnSac]?.cessRate || item.cessRate || 0;

        let cgst = 0, sgst = 0, igst = 0, cess = 0;

        if (isInterState) {
            igst = (taxableValue * gstRate) / 100;
        } else {
            cgst = (taxableValue * gstRate) / 200; // Half of GST rate
            sgst = (taxableValue * gstRate) / 200;
        }

        if (cessRate > 0) {
            cess = (taxableValue * cessRate) / 100;
        }

        totalTaxableValue += taxableValue;
        totalCgst += cgst;
        totalSgst += sgst;
        totalIgst += igst;
        totalCess += cess;

        return {
            ...item,
            taxableValue: round(taxableValue),
            gstRate,
            cessRate,
            cgst: round(cgst),
            sgst: round(sgst),
            igst: round(igst),
            cessAmount: round(cess),
            totalItemValue: round(taxableValue + cgst + sgst + igst + cess)
        };
    });

    return {
        items: calculatedItems,
        isInterState,
        summary: {
            totalTaxableValue: round(totalTaxableValue),
            totalCgst: round(totalCgst),
            totalSgst: round(totalSgst),
            totalIgst: round(totalIgst),
            totalCess: round(totalCess),
            totalTax: round(totalCgst + totalSgst + totalIgst + totalCess),
            totalAmount: round(totalTaxableValue + totalCgst + totalSgst + totalIgst + totalCess)
        }
    };
}

/**
 * Determine GSTR-1 category for a transaction
 * @param {object} invoice - Invoice details
 * @returns {string} - GSTR category (B2B, B2CS, B2CL, etc.)
 */
function getGSTRCategory(invoice) {
    const { counterpartyGstin, totalAmount, invoiceType, isExport, reverseCharge } = invoice;

    if (invoiceType === 'purchase') {
        return 'PURCHASE';
    }

    // Export invoice
    if (isExport) {
        return 'EXP';
    }

    // Credit/Debit Note
    if (invoice.documentType === 'credit_note' || invoice.documentType === 'debit_note') {
        return 'CDNR';
    }

    // B2B - Business to Business (Registered)
    if (counterpartyGstin && counterpartyGstin.length === 15) {
        return 'B2B';
    }

    // B2CL - Business to Consumer Large (> ₹2.5 lakh inter-state)
    if (!counterpartyGstin && totalAmount > 250000 && invoice.isInterState) {
        return 'B2CL';
    }

    // B2CS - Business to Consumer Small
    return 'B2CS';
}

/**
 * Get filing period from date
 * @param {Date|string} date 
 * @returns {string} - MMYYYY format
 */
function getFilingPeriod(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}${year}`;
}

/**
 * Get financial year from date
 * @param {Date|string} date 
 * @returns {string} - YYYY-YYYY format
 */
function getFinancialYear(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;

    if (month >= 4) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
}

/**
 * Calculate late filing penalty
 * @param {Date} dueDate 
 * @param {Date} filingDate 
 * @param {object} taxLiability - { cgst, sgst, igst }
 * @returns {object} - { lateFee, interest, total }
 */
function calculatePenalty(dueDate, filingDate, taxLiability) {
    const due = new Date(dueDate);
    const filed = new Date(filingDate);

    if (filed <= due) {
        return { lateFee: 0, interest: 0, total: 0, daysLate: 0 };
    }

    const diffTime = Math.abs(filed - due);
    const daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Late fee: ₹50/day CGST + ₹50/day SGST (max ₹10,000 total)
    // For nil returns: ₹20/day each (max ₹500 total)
    const totalTax = (taxLiability.cgst || 0) + (taxLiability.sgst || 0) + (taxLiability.igst || 0);

    let lateFee;
    if (totalTax === 0) {
        lateFee = Math.min(daysLate * 40, 500); // Nil return
    } else {
        lateFee = Math.min(daysLate * 100, 10000); // Regular return
    }

    // Interest: 18% p.a. on outstanding tax
    const interestRate = 18;
    const interest = (totalTax * interestRate * daysLate) / (365 * 100);

    return {
        daysLate,
        lateFee: round(lateFee),
        interest: round(interest),
        total: round(lateFee + interest)
    };
}

/**
 * Get due dates for GST filings
 * @param {string} filingFrequency - 'monthly' or 'quarterly'
 * @param {string} period - MMYYYY
 * @returns {object} - Due dates for different returns
 */
function getFilingDueDates(filingFrequency, period) {
    const month = parseInt(period.substring(0, 2));
    const year = parseInt(period.substring(2));

    // GSTR-1: 11th of next month (monthly) or 13th of month after quarter (quarterly)
    // GSTR-3B: 20th of next month (monthly) or 22nd-24th of month after quarter (quarterly)

    let gstr1Due, gstr3bDue;

    if (filingFrequency === 'monthly') {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        gstr1Due = new Date(nextYear, nextMonth - 1, 11);
        gstr3bDue = new Date(nextYear, nextMonth - 1, 20);
    } else {
        // Quarterly - Q1 (Apr-Jun), Q2 (Jul-Sep), Q3 (Oct-Dec), Q4 (Jan-Mar)
        const quarterEndMonth = Math.ceil(month / 3) * 3;
        const dueMonth = quarterEndMonth === 12 ? 1 : quarterEndMonth + 1;
        const dueYear = quarterEndMonth === 12 ? year + 1 : year;
        gstr1Due = new Date(dueYear, dueMonth - 1, 13);
        gstr3bDue = new Date(dueYear, dueMonth - 1, 22);
    }

    return {
        gstr1: gstr1Due.toISOString().split('T')[0],
        gstr3b: gstr3bDue.toISOString().split('T')[0]
    };
}

// Helper function to round to 2 decimal places
function round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

module.exports = {
    STATE_CODES,
    validateGSTIN,
    calculateGST,
    getGSTRCategory,
    getFilingPeriod,
    getFinancialYear,
    calculatePenalty,
    getFilingDueDates,
    round
};
