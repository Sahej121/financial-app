/**
 * Template Extraction Service (Tier 2)
 * 
 * Structured, deterministic extraction for well-known Indian bank statement
 * and financial document formats. Sits between regex (Tier 1) and LLM (Tier 3).
 * 
 * Uses positional/tabular parsing patterns for standard bank statement layouts:
 *   - SBI, HDFC, ICICI, Axis, Kotak, YES Bank
 *   - Structured line-by-line transaction parsing
 *   - Header-based column detection
 * 
 * When this tier succeeds (confidence ≥ 0.75), LLM calls are skipped entirely.
 */

const logger = require('../utils/logger');

// Line patterns for structured bank statement table rows
// Format: Date | Description | Withdrawal | Deposit | Balance
const TRANSACTION_LINE_PATTERNS = [
    // DD/MM/YYYY or DD-MM-YYYY followed by description and amounts
    /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\s+(.{10,60}?)\s+([\d,]+(?:\.\d{2})?)\s+([\d,]+(?:\.\d{2})?)\s+([\d,]+(?:\.\d{2})?)/g,
    // Date at start, then narration, then Cr/Dr amounts
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{2,4})\s+(.{10,60}?)\s+([\d,]+(?:\.\d{2})?)\s+([\d,]+(?:\.\d{2})?)/g,
];

// Salary patterns
const SALARY_PATTERNS = [
    /(?:salary|sal|neft.*salary|cms.*salary|(?:company|employer)\s+(?:name|credit))\s*[:\-]?\s*(.+)/gi,
    /(?:ecs|nach|neft|rtgs).*(?:salary|sal)\s*/gi,
];

// EMI / Loan patterns
const EMI_PATTERNS = [
    /(?:emi|loan|instalment|installment)\s*(?:payment|debit|deduction)?\s*(?:for|of|to)?\s*(.+?)(?:\s+(?:rs|inr|₹)?\.?\s*([\d,]+(?:\.\d{2})?))?$/gim,
    /(?:nach|ecs).*(?:emi|loan|hdfc\s*ltd|bajaj|tata|lic|icici\s*bank)/gi,
];

// UPI patterns
const UPI_PATTERN = /(?:upi[-\/])([\w.@]+)[-\/](.+?)[-\/](\d+)/gi;

class TemplateExtractionService {
    /**
     * Attempt structured extraction using template patterns
     * @param {string} text - OCR/parsed text
     * @param {string} documentType - Classified document type
     * @param {object} tier1Data - Data already extracted by systemExtractionService (Tier 1)
     * @returns {{ extractedData, confidence, transactions, canSkipAI }}
     */
    async extract(text, documentType, tier1Data = {}) {
        const result = {
            extractedData: { ...tier1Data.extractedData },
            transactions: [],
            salaryCredits: [],
            emiDebits: [],
            upiTransactions: [],
            summary: '',
            confidenceScore: tier1Data.confidenceScore || 0.1,
            canSkipAI: false,
            tier: 'template_extraction'
        };

        if (!text || text.length < 100) return result;

        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        // 1. Parse structured transactions
        if (documentType === 'bank_statements') {
            this._parseTransactions(text, result);
            this._parseSalaryCredits(text, result);
            this._parseEMIDebits(text, result);
            this._parseUPITransactions(text, result);

            // Calculate aggregates from parsed transactions
            if (result.transactions.length > 0) {
                this._calculateAggregates(result);
                result.confidenceScore += 0.3;
            }
        }

        // 2. Parse structured summary sections (Opening/Closing Balance, Account Number)
        this._parseStatementSummary(text, result);

        // 3. Parse structured ITR / Form 16 tables
        if (documentType === 'tax_documents') {
            this._parseTaxSections(text, result);
        }

        // 4. Determine if we can skip AI
        const hasTransactions = result.transactions.length >= 3;
        const hasAggregates = result.extractedData.totalCredits > 0 || result.extractedData.totalDebits > 0;
        const hasPeriod = !!result.extractedData.period;

        if (result.confidenceScore >= 0.75 && (hasTransactions || hasAggregates) && hasPeriod) {
            result.canSkipAI = true;
            result.summary = this._generateDeterministicSummary(result);
            logger.info('[TemplateExtraction] High confidence — LLM skipped', {
                confidence: result.confidenceScore,
                transactionCount: result.transactions.length
            });
        }

        return result;
    }

    /**
     * Parse tabular transaction lines
     */
    _parseTransactions(text, result) {
        for (const pattern of TRANSACTION_LINE_PATTERNS) {
            let match;
            // Reset regex state
            pattern.lastIndex = 0;
            while ((match = pattern.exec(text)) !== null) {
                const [, date, description, amount1, amount2, balance] = match;
                const withdrawal = parseFloat((amount1 || '0').replace(/,/g, ''));
                const deposit = parseFloat((amount2 || '0').replace(/,/g, ''));

                result.transactions.push({
                    date: date.trim(),
                    description: description.trim(),
                    withdrawal: withdrawal > 0 ? withdrawal : 0,
                    deposit: deposit > 0 ? deposit : 0,
                    balance: balance ? parseFloat(balance.replace(/,/g, '')) : null,
                    source: 'template_parse'
                });
            }
        }
    }

    /**
     * Identify salary credit entries
     */
    _parseSalaryCredits(text, result) {
        for (const pattern of SALARY_PATTERNS) {
            let match;
            pattern.lastIndex = 0;
            while ((match = pattern.exec(text)) !== null) {
                result.salaryCredits.push({
                    raw: match[0].trim(),
                    employer: match[1] ? match[1].trim() : null,
                    source: 'template_parse'
                });
            }
        }
        if (result.salaryCredits.length > 0) {
            result.confidenceScore += 0.1;
        }
    }

    /**
     * Identify EMI/loan debit entries
     */
    _parseEMIDebits(text, result) {
        for (const pattern of EMI_PATTERNS) {
            let match;
            pattern.lastIndex = 0;
            while ((match = pattern.exec(text)) !== null) {
                result.emiDebits.push({
                    raw: match[0].trim(),
                    lender: match[1] ? match[1].trim() : null,
                    amount: match[2] ? parseFloat(match[2].replace(/,/g, '')) : null,
                    source: 'template_parse'
                });
            }
        }
        if (result.emiDebits.length > 0) {
            result.extractedData.loanEmis = result.emiDebits.map(e => ({
                lender: e.lender,
                amount: e.amount,
                evidence_snippet: e.raw
            }));
            result.confidenceScore += 0.1;
        }
    }

    /**
     * Parse UPI transaction metadata
     */
    _parseUPITransactions(text, result) {
        let match;
        UPI_PATTERN.lastIndex = 0;
        while ((match = UPI_PATTERN.exec(text)) !== null) {
            result.upiTransactions.push({
                upiId: match[1],
                description: match[2],
                refNumber: match[3]
            });
        }
    }

    /**
     * Parse structured summary blocks (opening/closing balance, account number)
     */
    _parseStatementSummary(text, result) {
        const cleanText = text.replace(/\s+/g, ' ');

        // Opening Balance
        const openingMatch = cleanText.match(
            /(?:opening|op(?:en)?\.?\s*)(?:balance|bal)\s*[:\-]?\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{2})?)/i
        );
        if (openingMatch) {
            result.extractedData.openingBalance = parseFloat(openingMatch[1].replace(/,/g, ''));
            result.confidenceScore += 0.05;
        }

        // Closing Balance
        const closingMatch = cleanText.match(
            /(?:closing|cl(?:os)?\.?\s*)(?:balance|bal)\s*[:\-]?\s*(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d{2})?)/i
        );
        if (closingMatch) {
            result.extractedData.closingBalance = parseFloat(closingMatch[1].replace(/,/g, ''));
            result.confidenceScore += 0.05;
        }

        // Account Number
        const accountMatch = cleanText.match(
            /(?:a\/c|account)\s*(?:no|number|#)\s*[:\-]?\s*(\d{9,18})/i
        );
        if (accountMatch) {
            result.extractedData.accountNumber = accountMatch[1];
            result.confidenceScore += 0.05;
        }
    }

    /**
     * Parse structured tax document sections
     */
    _parseTaxSections(text, result) {
        const cleanText = text.replace(/\s+/g, ' ');

        // Gross Total Income
        const grossIncomeMatch = cleanText.match(
            /(?:gross\s+total\s+income|total\s+income)\s*[:\-]?\s*(?:rs\.?|inr|₹)?\s*([\d,]+)/i
        );
        if (grossIncomeMatch) {
            result.extractedData.grossIncome = parseFloat(grossIncomeMatch[1].replace(/,/g, ''));
            result.confidenceScore += 0.15;
        }

        // Total Tax Paid
        const taxPaidMatch = cleanText.match(
            /(?:total\s+tax\s+(?:paid|payable)|tax\s+deducted)\s*[:\-]?\s*(?:rs\.?|inr|₹)?\s*([\d,]+)/i
        );
        if (taxPaidMatch) {
            result.extractedData.totalTaxPaid = parseFloat(taxPaidMatch[1].replace(/,/g, ''));
            result.confidenceScore += 0.1;
        }

        // Assessment Year
        const ayMatch = cleanText.match(/(?:assessment\s+year|a\.?y\.?)\s*[:\-]?\s*(\d{4}[-\s]?\d{2,4})/i);
        if (ayMatch) {
            result.extractedData.assessmentYear = ayMatch[1];
            result.confidenceScore += 0.05;
        }
    }

    /**
     * Aggregate transaction data into summary fields
     */
    _calculateAggregates(result) {
        let totalCredits = 0;
        let totalDebits = 0;
        const balances = [];

        for (const txn of result.transactions) {
            totalCredits += txn.deposit;
            totalDebits += txn.withdrawal;
            if (txn.balance) balances.push(txn.balance);
        }

        if (totalCredits > 0) result.extractedData.totalCredits = totalCredits;
        if (totalDebits > 0) result.extractedData.totalDebits = totalDebits;

        if (balances.length > 0) {
            result.extractedData.avgMonthlyBalance = Math.round(
                balances.reduce((sum, b) => sum + b, 0) / balances.length
            );
        }

        // Key transactions (top 5 by amount)
        result.extractedData.keyTransactions = result.transactions
            .sort((a, b) => Math.max(b.deposit, b.withdrawal) - Math.max(a.deposit, a.withdrawal))
            .slice(0, 5)
            .map(t => ({
                date: t.date,
                type: t.deposit > t.withdrawal ? 'credit' : 'debit',
                amount: Math.max(t.deposit, t.withdrawal),
                description: t.description,
                evidence_snippet: `${t.date} ${t.description}`
            }));
    }

    /**
     * Generate a deterministic human-readable summary
     */
    _generateDeterministicSummary(result) {
        const data = result.extractedData;
        const parts = [];

        if (data.institution) parts.push(`${data.institution} statement`);
        if (data.period) parts.push(`for period ${data.period}`);
        if (data.totalCredits) parts.push(`Total credits: ₹${data.totalCredits.toLocaleString('en-IN')}`);
        if (data.totalDebits) parts.push(`Total debits: ₹${data.totalDebits.toLocaleString('en-IN')}`);
        if (data.avgMonthlyBalance) parts.push(`Avg balance: ₹${data.avgMonthlyBalance.toLocaleString('en-IN')}`);
        if (result.salaryCredits.length > 0) parts.push(`${result.salaryCredits.length} salary credits detected`);
        if (result.emiDebits.length > 0) parts.push(`${result.emiDebits.length} EMI debits detected`);
        parts.push(`(${result.transactions.length} transactions parsed deterministically)`);

        return parts.join('. ') + '.';
    }
}

module.exports = new TemplateExtractionService();
