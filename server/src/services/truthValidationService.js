/**
 * Truth Validation Service - Financial Data Cross-Validation
 * 
 * Cross-validates user-declared data against extracted document data.
 * Generates validation flags (warnings/red flags) for the MOAT Decision Pack.
 */

const { DocumentInsight, FinancialPlanningSubmission, Document } = require('../models');

class TruthValidationService {
    /**
     * Parse monetary string to number
     */
    parseMoney(value) {
        if (!value) return 0;
        if (typeof value === 'number') return value;

        const str = String(value).toLowerCase().replace(/[₹,\s]/g, '');
        let multiplier = 1;

        if (str.includes('cr')) {
            multiplier = 10000000;
        } else if (str.includes('lakh')) {
            multiplier = 100000;
        } else if (str.includes('k')) {
            multiplier = 1000;
        }

        const num = parseFloat(str.replace(/[^\d.]/g, ''));
        return isNaN(num) ? 0 : num * multiplier;
    }

    /**
     * Check if two values are within acceptable tolerance
     */
    withinTolerance(declared, actual, tolerancePercent = 15) {
        if (!declared || !actual) return true; // Can't validate without both values
        const diff = Math.abs(declared - actual);
        const tolerance = declared * (tolerancePercent / 100);
        return diff <= tolerance;
    }

    /**
     * Extract a specific value from document insights
     */
    extractFromInsights(insights, insightType, fieldPath) {
        const insight = insights.find(i => i.insightType === insightType);
        if (!insight || !insight.extractedData) return null;

        const data = insight.extractedData;
        const pathParts = fieldPath.split('.');
        let value = data;

        for (const part of pathParts) {
            if (value && typeof value === 'object') {
                value = value[part];
            } else {
                return null;
            }
        }

        return value;
    }

    /**
     * Validate income consistency
     */
    validateIncome(submission, insights) {
        const flags = [];
        const declaredIncome = this.parseMoney(submission.monthlyIncome);

        // Check against bank statement credits
        const bankCredits = this.extractFromInsights(insights, 'bank_statement', 'avgMonthlyCredits');
        if (bankCredits) {
            const actualCredits = this.parseMoney(bankCredits);
            if (!this.withinTolerance(declaredIncome, actualCredits, 20)) {
                flags.push({
                    type: 'INCOME_MISMATCH',
                    severity: declaredIncome > actualCredits * 1.3 ? 'high' : 'medium',
                    message: `Declared income (₹${declaredIncome.toLocaleString()}) differs significantly from bank credits (₹${actualCredits.toLocaleString()})`,
                    declared: declaredIncome,
                    actual: actualCredits,
                    source: 'bank_statement'
                });
            }
        }

        return flags;
    }

    /**
     * Validate expense/EMI consistency
     */
    validateExpenses(submission, insights) {
        const flags = [];
        const declaredEMI = this.parseMoney(submission.monthlyEMI);
        const declaredExpenses = this.parseMoney(submission.monthlyExpenses);
        const monthlyIncome = this.parseMoney(submission.monthlyIncome);

        // Check if EMI + Expenses > Income (red flag)
        if (declaredEMI && declaredExpenses && monthlyIncome) {
            const totalOutflow = declaredEMI + declaredExpenses;
            if (totalOutflow > monthlyIncome * 0.95) {
                flags.push({
                    type: 'OUTFLOW_EXCEEDS_INCOME',
                    severity: 'high',
                    message: `Monthly outflow (₹${totalOutflow.toLocaleString()}) exceeds or nearly equals income (₹${monthlyIncome.toLocaleString()})`,
                    declared: { emi: declaredEMI, expenses: declaredExpenses, income: monthlyIncome }
                });
            }
        }

        // Check against bank debits
        const bankDebits = this.extractFromInsights(insights, 'bank_statement', 'avgMonthlyDebits');
        if (bankDebits) {
            const actualDebits = this.parseMoney(bankDebits);
            const declaredTotal = declaredEMI + declaredExpenses;
            if (declaredTotal > 0 && !this.withinTolerance(declaredTotal, actualDebits, 25)) {
                flags.push({
                    type: 'EXPENSE_MISMATCH',
                    severity: 'medium',
                    message: `Declared expenses (₹${declaredTotal.toLocaleString()}) differ from bank debits (₹${actualDebits.toLocaleString()})`,
                    declared: declaredTotal,
                    actual: actualDebits
                });
            }
        }

        return flags;
    }

    /**
     * Validate business data (for expansion purpose)
     */
    validateBusinessData(submission, insights) {
        const flags = [];

        if (submission.planningPurpose !== 'business_expansion') return flags;

        const declaredRevenue = this.parseMoney(submission.annualRevenue);

        // Check GST return vs declared revenue
        const gstTurnover = this.extractFromInsights(insights, 'gst_return', 'annualTurnover');
        if (gstTurnover) {
            const actualTurnover = this.parseMoney(gstTurnover);
            if (!this.withinTolerance(declaredRevenue, actualTurnover, 10)) {
                flags.push({
                    type: 'REVENUE_GST_MISMATCH',
                    severity: 'high',
                    message: `Declared revenue (₹${declaredRevenue.toLocaleString()}) differs from GST turnover (₹${actualTurnover.toLocaleString()})`,
                    declared: declaredRevenue,
                    actual: actualTurnover,
                    source: 'gst_return'
                });
            }
        }

        // Validate profit margin claims vs ITR
        const itrProfit = this.extractFromInsights(insights, 'itr', 'netProfit');
        const itrRevenue = this.extractFromInsights(insights, 'itr', 'grossRevenue');
        if (itrProfit && itrRevenue) {
            const actualMargin = (this.parseMoney(itrProfit) / this.parseMoney(itrRevenue)) * 100;
            const declaredMargin = this.parseMarginRange(submission.profitMargin);

            if (Math.abs(actualMargin - declaredMargin) > 10) {
                flags.push({
                    type: 'PROFIT_MARGIN_MISMATCH',
                    severity: 'medium',
                    message: `Declared profit margin (~${declaredMargin}%) differs from ITR (~${actualMargin.toFixed(1)}%)`,
                    declared: declaredMargin,
                    actual: actualMargin
                });
            }
        }

        return flags;
    }

    /**
     * Parse margin range to midpoint number
     */
    parseMarginRange(margin) {
        const ranges = {
            'negative': -5,
            '0-5': 2.5,
            '5-15': 10,
            '15-30': 22.5,
            '30+': 35
        };
        return ranges[margin] || 10;
    }

    /**
     * Validate debt/liability data
     */
    validateDebtData(submission, insights) {
        const flags = [];

        const declaredDebt = this.parseMoney(submission.totalDebtAmount);
        const declaredEMI = this.parseMoney(submission.monthlyEMI);

        // Check debt vs EMI consistency (rough check based on typical tenure)
        if (declaredDebt && declaredEMI) {
            const impliedTenure = declaredDebt / (declaredEMI * 12);
            if (impliedTenure > 30 || impliedTenure < 0.5) {
                flags.push({
                    type: 'DEBT_EMI_INCONSISTENT',
                    severity: 'medium',
                    message: `Debt (₹${declaredDebt.toLocaleString()}) and EMI (₹${declaredEMI.toLocaleString()}) imply unusual tenure (~${impliedTenure.toFixed(1)} years)`,
                    impliedTenure
                });
            }
        }

        // Check if high interest debt but claiming low EMI burden
        const hasHighInterestDebt = (submission.debtTypes || []).some(d =>
            ['credit_card', 'personal_loan'].includes(d)
        );
        const monthlyIncome = this.parseMoney(submission.monthlyIncome);
        const emiRatio = monthlyIncome > 0 ? (declaredEMI / monthlyIncome) * 100 : 0;

        if (hasHighInterestDebt && emiRatio < 20) {
            flags.push({
                type: 'HIGH_INTEREST_LOW_EMI',
                severity: 'low',
                message: 'Has high-interest debt (credit card/personal loan) but EMI ratio is low. Verify if debt is fully disclosed.',
                emiRatio: emiRatio.toFixed(1)
            });
        }

        return flags;
    }

    /**
     * Check document coverage for purpose
     */
    validateDocumentCoverage(submission, documents) {
        const flags = [];
        const purpose = submission.planningPurpose;

        // Required documents per purpose
        const requiredDocs = {
            investment: ['bank_statements'],
            business_expansion: ['bank_statements', 'financial_statements', 'tax_documents'],
            loan_settlement: ['bank_statements']
        };

        const required = requiredDocs[purpose] || requiredDocs.investment;
        const uploadedCategories = documents.map(d => d.category);

        for (const docType of required) {
            if (!uploadedCategories.includes(docType)) {
                flags.push({
                    type: 'MISSING_DOCUMENT',
                    severity: 'medium',
                    message: `Recommended document not uploaded: ${docType.replace(/_/g, ' ')}`,
                    missingType: docType
                });
            }
        }

        return flags;
    }

    /**
     * Main validation function
     */
    async validate(submissionId) {
        const submission = await FinancialPlanningSubmission.findByPk(submissionId);
        if (!submission) throw new Error('Submission not found');

        const insights = await DocumentInsight.findAll({
            where: { submissionId },
            raw: true
        });

        const documents = await Document.findAll({
            where: { submissionId },
            raw: true
        });

        // Collect all flags
        const allFlags = [
            ...this.validateIncome(submission, insights),
            ...this.validateExpenses(submission, insights),
            ...this.validateBusinessData(submission, insights),
            ...this.validateDebtData(submission, insights),
            ...this.validateDocumentCoverage(submission, documents)
        ];

        // Determine overall validity
        const highSeverityCount = allFlags.filter(f => f.severity === 'high').length;
        const isValid = highSeverityCount === 0;

        // Update submission with validation results
        await submission.update({
            isDataVerified: isValid,
            validationFlags: allFlags
        });

        return {
            isValid,
            flagCount: allFlags.length,
            highSeverityCount,
            mediumSeverityCount: allFlags.filter(f => f.severity === 'medium').length,
            lowSeverityCount: allFlags.filter(f => f.severity === 'low').length,
            flags: allFlags
        };
    }
}

module.exports = new TruthValidationService();
