/**
 * Currency Helper
 * Handles parsing of Indian currency strings (Lakh, Crore) into numbers
 */

/**
 * Parses a string containing Indian currency suffixes and returns a number.
 * Supports: Lakh, L, Cr, Crore, K, Thousand
 * @param {string|number} input 
 * @returns {number|null}
 */
const parseIndianCurrency = (input) => {
    if (input === null || input === undefined || input === '') return null;
    if (typeof input === 'number') return input;

    // Remove commas and common currency symbols/prefixes
    let cleaned = input.toString()
        .replace(/,/g, '')
        .replace(/[₹$]/g, '')
        .replace(/\b(rs|inr|usd|ps)\b\.?/gi, '')
        .trim()
        .toLowerCase();

    // Extract numeric part and suffix
    const match = cleaned.match(/^([\d.]+)\s*([a-z]*)$/);

    if (!match) {
        // If it's just a raw number after cleaning
        const val = parseFloat(cleaned);
        return isNaN(val) ? null : val;
    }

    const value = parseFloat(match[1]);
    const suffix = match[2];

    if (isNaN(value)) return null;

    switch (suffix) {
        case 'lakh':
        case 'lakhs':
        case 'l':
            return value * 100000;
        case 'cr':
        case 'crore':
        case 'crores':
            return value * 10000000;
        case 'k':
        case 'thousand':
        case 'thousands':
            return value * 1000;
        default:
            return value;
    }
};

module.exports = {
    parseIndianCurrency
};
