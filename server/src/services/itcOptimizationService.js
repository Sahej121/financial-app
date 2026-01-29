/**
 * ITC (Input Tax Credit) Optimization Service
 * Handles ITC reconciliation, mismatch detection, and ML-based risk prediction
 */

const { Op } = require('sequelize');
const { round } = require('./gstCalculationService');

/**
 * Reconcile ITC - Match purchase invoices with GSTR-2A/2B data
 * @param {number} gstProfileId 
 * @param {string} period - MMYYYY format
 * @param {Array} gstr2aRecords - Parsed GSTR-2A/2B records
 * @param {object} models - Sequelize models
 * @returns {object} - Reconciliation results
 */
async function reconcileITC(gstProfileId, period, gstr2aRecords, models) {
    const { GSTInvoice, ITCRecord } = models;

    // Get all purchase invoices for the period
    const purchaseInvoices = await GSTInvoice.findAll({
        where: {
            gstProfileId,
            invoiceType: 'purchase',
            filingPeriod: period,
            status: { [Op.ne]: 'cancelled' }
        }
    });

    const results = {
        matched: [],
        mismatched: [],
        notInBooks: [],
        notIn2A: [],
        summary: {
            totalInBooks: 0,
            totalIn2A: 0,
            matchedITC: { cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 },
            mismatchedITC: { cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 },
            potentialLoss: 0
        }
    };

    // Create lookup map for 2A records
    const gstr2aMap = new Map();
    gstr2aRecords.forEach(record => {
        const key = `${record.supplierGstin}_${record.invoiceNumber}`;
        gstr2aMap.set(key, record);
    });

    // Create lookup map for purchase invoices
    const purchaseMap = new Map();
    purchaseInvoices.forEach(inv => {
        const key = `${inv.counterpartyGstin}_${inv.invoiceNumber}`;
        purchaseMap.set(key, inv);
    });

    // Match 2A records with books
    for (const [key, record2a] of gstr2aMap) {
        const purchaseInv = purchaseMap.get(key);

        if (!purchaseInv) {
            // In 2A but not in books - potential missed claim
            results.notInBooks.push({
                ...record2a,
                matchStatus: 'not_in_books',
                suggestion: 'Invoice found in GSTR-2A but not in your books. Verify with supplier.'
            });
            results.summary.totalIn2A += record2a.taxableValue || 0;
            continue;
        }

        // Check for value mismatches
        const mismatchDetails = checkMismatch(purchaseInv, record2a);
        results.summary.totalIn2A += record2a.taxableValue || 0;
        results.summary.totalInBooks += purchaseInv.totalTaxableValue || 0;

        if (mismatchDetails.hasMismatch) {
            results.mismatched.push({
                invoice: purchaseInv,
                gstr2a: record2a,
                mismatchDetails,
                riskScore: calculateMismatchRisk(mismatchDetails)
            });

            results.summary.mismatchedITC.cgst += purchaseInv.totalCgst || 0;
            results.summary.mismatchedITC.sgst += purchaseInv.totalSgst || 0;
            results.summary.mismatchedITC.igst += purchaseInv.totalIgst || 0;
            results.summary.mismatchedITC.cess += purchaseInv.totalCess || 0;
        } else {
            results.matched.push({
                invoice: purchaseInv,
                gstr2a: record2a,
                matchStatus: 'matched'
            });

            results.summary.matchedITC.cgst += purchaseInv.totalCgst || 0;
            results.summary.matchedITC.sgst += purchaseInv.totalSgst || 0;
            results.summary.matchedITC.igst += purchaseInv.totalIgst || 0;
            results.summary.matchedITC.cess += purchaseInv.totalCess || 0;
        }

        // Remove from purchase map to track remaining
        purchaseMap.delete(key);
    }

    // Remaining in purchase map are not in 2A - risk of disallowance
    for (const [key, inv] of purchaseMap) {
        results.notIn2A.push({
            invoice: inv,
            matchStatus: 'not_in_2a',
            potentialITCAtRisk: round(
                (inv.totalCgst || 0) + (inv.totalSgst || 0) +
                (inv.totalIgst || 0) + (inv.totalCess || 0)
            ),
            suggestion: 'Invoice not found in GSTR-2A. Follow up with supplier to file their return.'
        });

        results.summary.potentialLoss += (inv.totalCgst || 0) + (inv.totalSgst || 0) +
            (inv.totalIgst || 0) + (inv.totalCess || 0);
    }

    // Calculate totals
    results.summary.matchedITC.total = round(
        results.summary.matchedITC.cgst + results.summary.matchedITC.sgst +
        results.summary.matchedITC.igst + results.summary.matchedITC.cess
    );
    results.summary.mismatchedITC.total = round(
        results.summary.mismatchedITC.cgst + results.summary.mismatchedITC.sgst +
        results.summary.mismatchedITC.igst + results.summary.mismatchedITC.cess
    );
    results.summary.potentialLoss = round(results.summary.potentialLoss);

    return results;
}

/**
 * Check for mismatches between purchase invoice and GSTR-2A record
 */
function checkMismatch(purchaseInv, record2a) {
    const tolerancePercent = 1; // 1% tolerance for rounding differences
    const details = {
        hasMismatch: false,
        fields: [],
        severity: 'low'
    };

    // Check taxable value
    const taxableValueDiff = Math.abs(
        (purchaseInv.totalTaxableValue || 0) - (record2a.taxableValue || 0)
    );
    const taxableValuePercDiff = (purchaseInv.totalTaxableValue || 0) > 0
        ? (taxableValueDiff / purchaseInv.totalTaxableValue) * 100
        : 0;

    if (taxableValuePercDiff > tolerancePercent) {
        details.hasMismatch = true;
        details.fields.push({
            field: 'taxableValue',
            inBooks: purchaseInv.totalTaxableValue,
            in2A: record2a.taxableValue,
            difference: round(taxableValueDiff),
            percentDiff: round(taxableValuePercDiff)
        });
    }

    // Check IGST
    const igstDiff = Math.abs((purchaseInv.totalIgst || 0) - (record2a.igst || 0));
    if (igstDiff > 1) { // More than ₹1 difference
        details.hasMismatch = true;
        details.fields.push({
            field: 'igst',
            inBooks: purchaseInv.totalIgst,
            in2A: record2a.igst,
            difference: round(igstDiff)
        });
    }

    // Check CGST
    const cgstDiff = Math.abs((purchaseInv.totalCgst || 0) - (record2a.cgst || 0));
    if (cgstDiff > 1) {
        details.hasMismatch = true;
        details.fields.push({
            field: 'cgst',
            inBooks: purchaseInv.totalCgst,
            in2A: record2a.cgst,
            difference: round(cgstDiff)
        });
    }

    // Check SGST
    const sgstDiff = Math.abs((purchaseInv.totalSgst || 0) - (record2a.sgst || 0));
    if (sgstDiff > 1) {
        details.hasMismatch = true;
        details.fields.push({
            field: 'sgst',
            inBooks: purchaseInv.totalSgst,
            in2A: record2a.sgst,
            difference: round(sgstDiff)
        });
    }

    // Determine severity
    if (details.hasMismatch) {
        const totalTaxDiff = igstDiff + cgstDiff + sgstDiff;
        if (totalTaxDiff > 10000) {
            details.severity = 'high';
        } else if (totalTaxDiff > 1000) {
            details.severity = 'medium';
        }
    }

    return details;
}

/**
 * Calculate risk score for mismatched records
 */
function calculateMismatchRisk(mismatchDetails) {
    let riskScore = 0;

    if (mismatchDetails.severity === 'high') riskScore = 0.8;
    else if (mismatchDetails.severity === 'medium') riskScore = 0.5;
    else riskScore = 0.2;

    // Increase risk if multiple fields mismatch
    riskScore += Math.min(mismatchDetails.fields.length * 0.1, 0.2);

    return Math.min(round(riskScore), 1);
}

/**
 * Predict ITC risk using ML-like heuristics
 * (Since we don't have actual ML, using rule-based risk scoring)
 */
async function predictITCRisk(gstProfileId, models) {
    const { GSTInvoice, ITCRecord } = models;

    // Get all purchase invoices
    const purchases = await GSTInvoice.findAll({
        where: {
            gstProfileId,
            invoiceType: 'purchase',
            status: { [Op.ne]: 'cancelled' }
        }
    });

    const riskAnalysis = {
        highRisk: [],
        mediumRisk: [],
        lowRisk: [],
        riskFactors: {}
    };

    for (const inv of purchases) {
        const riskFactors = [];
        let riskScore = 0;

        // Factor 1: Large value transactions
        if (inv.totalAmount > 500000) {
            riskFactors.push({ factor: 'high_value', weight: 0.2 });
            riskScore += 0.2;
        }

        // Factor 2: B2C purchases (no counterparty GSTIN)
        if (!inv.counterpartyGstin) {
            riskFactors.push({ factor: 'unregistered_supplier', weight: 0.4 });
            riskScore += 0.4;
        }

        // Factor 3: Unusual HSN codes (generic ones)
        if (inv.items) {
            const hasGenericHSN = inv.items.some(item =>
                !item.hsnSac || item.hsnSac.length < 4 || item.hsnSac === '9997'
            );
            if (hasGenericHSN) {
                riskFactors.push({ factor: 'generic_hsn', weight: 0.1 });
                riskScore += 0.1;
            }
        }

        // Factor 4: Very high GST rate (potential input services)
        if (inv.items) {
            const hasHighRate = inv.items.some(item => item.gstRate >= 28);
            if (hasHighRate) {
                riskFactors.push({ factor: 'high_tax_rate', weight: 0.05 });
                riskScore += 0.05;
            }
        }

        // Factor 5: Invoice date close to filing deadline
        const invDate = new Date(inv.invoiceDate);
        const monthEnd = new Date(invDate.getFullYear(), invDate.getMonth() + 1, 0);
        const daysToMonthEnd = Math.ceil((monthEnd - invDate) / (1000 * 60 * 60 * 24));
        if (daysToMonthEnd <= 3) {
            riskFactors.push({ factor: 'month_end_invoice', weight: 0.15 });
            riskScore += 0.15;
        }

        // Factor 6: Reverse charge
        if (inv.reverseCharge) {
            riskFactors.push({ factor: 'reverse_charge', weight: 0.1 });
            riskScore += 0.1;
        }

        // Categorize by risk
        riskScore = Math.min(round(riskScore), 1);

        const riskData = {
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            counterpartyName: inv.counterpartyName,
            totalITC: round((inv.totalCgst || 0) + (inv.totalSgst || 0) + (inv.totalIgst || 0)),
            riskScore,
            riskFactors
        };

        if (riskScore >= 0.6) {
            riskAnalysis.highRisk.push(riskData);
        } else if (riskScore >= 0.3) {
            riskAnalysis.mediumRisk.push(riskData);
        } else {
            riskAnalysis.lowRisk.push(riskData);
        }
    }

    // Calculate risk factor frequencies
    const allFactors = [...riskAnalysis.highRisk, ...riskAnalysis.mediumRisk]
        .flatMap(r => r.riskFactors.map(f => f.factor));

    allFactors.forEach(factor => {
        riskAnalysis.riskFactors[factor] = (riskAnalysis.riskFactors[factor] || 0) + 1;
    });

    return riskAnalysis;
}

/**
 * Suggest ITC optimization strategies
 */
function suggestITCOptimization(reconciliationResults, riskAnalysis) {
    const suggestions = [];

    // Suggestion 1: Follow up on missing invoices
    if (reconciliationResults.notIn2A.length > 0) {
        const totalAtRisk = reconciliationResults.notIn2A.reduce(
            (sum, item) => sum + (item.potentialITCAtRisk || 0), 0
        );
        suggestions.push({
            priority: 'high',
            category: 'follow_up',
            title: 'Follow up with suppliers for missing invoices',
            description: `${reconciliationResults.notIn2A.length} invoices worth ₹${round(totalAtRisk).toLocaleString('en-IN')} ITC are not reflected in GSTR-2A/2B.`,
            action: 'Contact suppliers and request them to file their GSTR-1 with correct details.',
            impactAmount: totalAtRisk
        });
    }

    // Suggestion 2: Resolve mismatches
    if (reconciliationResults.mismatched.length > 0) {
        suggestions.push({
            priority: 'medium',
            category: 'resolve_mismatch',
            title: 'Resolve value mismatches with suppliers',
            description: `${reconciliationResults.mismatched.length} invoices have value/tax mismatches with GSTR-2A/2B.`,
            action: 'Review each mismatch P, contact supplier if their filing is incorrect, or correct your books if the error is on your side.',
            impactAmount: reconciliationResults.summary.mismatchedITC.total
        });
    }

    // Suggestion 3: Skip high-risk claims temporarily
    if (riskAnalysis.highRisk.length > 0) {
        const highRiskITC = riskAnalysis.highRisk.reduce((sum, r) => sum + r.totalITC, 0);
        suggestions.push({
            priority: 'medium',
            category: 'risk_management',
            title: 'Review high-risk ITC claims',
            description: `${riskAnalysis.highRisk.length} invoices are flagged as high-risk totaling ₹${round(highRiskITC).toLocaleString('en-IN')} ITC.`,
            action: 'Verify these invoices thoroughly before claiming ITC. Consider deferring claim if documentation is incomplete.',
            impactAmount: highRiskITC
        });
    }

    // Suggestion 4: Claim eligible ITC from notInBooks
    if (reconciliationResults.notInBooks.length > 0) {
        const notInBooksTotal = reconciliationResults.notInBooks.reduce(
            (sum, r) => sum + (r.cgst || 0) + (r.sgst || 0) + (r.igst || 0), 0
        );
        suggestions.push({
            priority: 'medium',
            category: 'missed_claim',
            title: 'Potential ITC available but not in books',
            description: `${reconciliationResults.notInBooks.length} invoices appear in GSTR-2A but not in your purchase register.`,
            action: 'Review if these are legitimate purchases. If yes, book them and claim ITC. If not, ignore.',
            impactAmount: notInBooksTotal
        });
    }

    // Suggestion 5: General optimization
    suggestions.push({
        priority: 'low',
        category: 'general',
        title: 'Regular reconciliation recommended',
        description: 'Perform ITC reconciliation before every GSTR-3B filing to maximize eligible claims.',
        action: 'Upload GSTR-2B on 12th of every month and reconcile before 20th.',
        impactAmount: 0
    });

    return suggestions.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

/**
 * Detect anomalies in invoice data
 */
async function detectAnomalies(gstProfileId, models) {
    const { GSTInvoice } = models;

    const invoices = await GSTInvoice.findAll({
        where: { gstProfileId },
        order: [['invoiceDate', 'DESC']]
    });

    const anomalies = [];

    // Anomaly 1: Duplicate invoice numbers
    const invoiceNumberCounts = {};
    invoices.forEach(inv => {
        const key = `${inv.counterpartyGstin}_${inv.invoiceNumber}`;
        invoiceNumberCounts[key] = (invoiceNumberCounts[key] || 0) + 1;
    });

    Object.entries(invoiceNumberCounts)
        .filter(([_, count]) => count > 1)
        .forEach(([key, count]) => {
            anomalies.push({
                type: 'duplicate_invoice',
                severity: 'high',
                description: `Invoice ${key.split('_')[1]} appears ${count} times`,
                affectedRecords: invoices.filter(i =>
                    `${i.counterpartyGstin}_${i.invoiceNumber}` === key
                ).map(i => i.id)
            });
        });

    // Anomaly 2: Round number amounts (potential fake invoices)
    invoices.forEach(inv => {
        if (inv.totalAmount % 1000 === 0 && inv.totalAmount >= 10000) {
            anomalies.push({
                type: 'round_amount',
                severity: 'low',
                description: `Invoice ${inv.invoiceNumber} has suspiciously round amount: ₹${inv.totalAmount}`,
                affectedRecords: [inv.id]
            });
        }
    });

    // Anomaly 3: Future dated invoices
    const today = new Date();
    invoices.forEach(inv => {
        if (new Date(inv.invoiceDate) > today) {
            anomalies.push({
                type: 'future_date',
                severity: 'medium',
                description: `Invoice ${inv.invoiceNumber} has future date: ${inv.invoiceDate}`,
                affectedRecords: [inv.id]
            });
        }
    });

    return anomalies;
}

/**
 * Generate comprehensive ITC health report
 */
async function generateITCReport(gstProfileId, period, models) {
    const { GSTInvoice, ITCRecord, GSTProfile } = models;

    const profile = await GSTProfile.findByPk(gstProfileId);

    const purchases = await GSTInvoice.findAll({
        where: {
            gstProfileId,
            invoiceType: 'purchase',
            filingPeriod: period
        }
    });

    // Calculate totals
    const totalITC = purchases.reduce((sum, inv) => ({
        cgst: sum.cgst + (inv.totalCgst || 0),
        sgst: sum.sgst + (inv.totalSgst || 0),
        igst: sum.igst + (inv.totalIgst || 0),
        cess: sum.cess + (inv.totalCess || 0)
    }), { cgst: 0, sgst: 0, igst: 0, cess: 0 });

    totalITC.total = round(totalITC.cgst + totalITC.sgst + totalITC.igst + totalITC.cess);

    return {
        profile: {
            gstin: profile?.gstin,
            businessName: profile?.businessName
        },
        period,
        summary: {
            totalPurchaseInvoices: purchases.length,
            totalITCAvailable: totalITC,
            b2bInvoices: purchases.filter(p => p.counterpartyGstin).length,
            unregisteredPurchases: purchases.filter(p => !p.counterpartyGstin).length
        },
        recommendations: [
            'Ensure all purchase invoices are booked before GSTR-3B filing',
            'Reconcile with GSTR-2B before claiming ITC',
            'Keep documentation for all high-value purchases'
        ]
    };
}

module.exports = {
    reconcileITC,
    checkMismatch,
    predictITCRisk,
    suggestITCOptimization,
    detectAnomalies,
    generateITCReport
};
