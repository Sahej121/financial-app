/**
 * PII Scrubber — Privacy-Preserving Text Sanitizer
 * 
 * Replaces PAN, Aadhaar, bank account numbers, and phone numbers
 * with tokenized placeholders before sending text to external LLMs.
 * Provides a restore function to map tokens back to originals.
 * 
 * Usage:
 *   const { scrubbed, restore } = piiScrubber.scrub(text);
 *   // Send `scrubbed` to LLM
 *   const answer = restore(llmResponse); // Re-insert original values
 */

const logger = require('./logger');

const PII_PATTERNS = [
    { name: 'PAN', regex: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g, prefix: 'PAN' },
    { name: 'AADHAAR', regex: /\d{4}\s\d{4}\s\d{4}/g, prefix: 'AADHAAR' },
    { name: 'GSTIN', regex: /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}/g, prefix: 'GSTIN' },
    { name: 'ACCOUNT', regex: /\b\d{9,18}\b/g, prefix: 'ACCT' },
    { name: 'PHONE', regex: /(?:\+91[\s-]?)?[6-9]\d{9}\b/g, prefix: 'PHONE' },
    { name: 'IFSC', regex: /[A-Z]{4}0[A-Z0-9]{6}/g, prefix: 'IFSC' },
    { name: 'EMAIL', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, prefix: 'EMAIL' },
];

class PIIScrubber {
    /**
     * Scrub PII from text, returning sanitized text + restore function
     * @param {string} text - Raw text containing PII
     * @returns {{ scrubbed: string, restore: (text: string) => string, piiFound: object[] }}
     */
    scrub(text) {
        if (!text || typeof text !== 'string') {
            return { scrubbed: text || '', restore: (t) => t, piiFound: [] };
        }

        const piiMap = new Map(); // token → original
        let scrubbed = text;
        const piiFound = [];
        const counters = {};

        for (const pattern of PII_PATTERNS) {
            counters[pattern.prefix] = counters[pattern.prefix] || 0;

            scrubbed = scrubbed.replace(pattern.regex, (match) => {
                counters[pattern.prefix]++;
                const token = `[${pattern.prefix}_${counters[pattern.prefix]}]`;

                // Avoid replacing the same value with multiple tokens
                for (const [existingToken, existingValue] of piiMap.entries()) {
                    if (existingValue === match) return existingToken;
                }

                piiMap.set(token, match);
                piiFound.push({
                    type: pattern.name,
                    token,
                    // Store only the type, not the actual value, in logs
                    redactedPreview: match.substring(0, 2) + '***' + match.substring(match.length - 2)
                });
                return token;
            });
        }

        if (piiFound.length > 0) {
            logger.info(`[PIIScrubber] Scrubbed ${piiFound.length} PII items`, {
                types: piiFound.map(p => p.type)
            });
        }

        // Create restore function that maps tokens back to originals
        const restore = (outputText) => {
            if (!outputText || typeof outputText !== 'string') return outputText;
            let restored = outputText;
            for (const [token, original] of piiMap.entries()) {
                restored = restored.split(token).join(original);
            }
            return restored;
        };

        return { scrubbed, restore, piiFound };
    }
}

module.exports = new PIIScrubber();
