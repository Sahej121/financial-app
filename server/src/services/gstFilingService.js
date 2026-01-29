/**
 * GST Filing Service
 * Manages GSTR filing workflows, CA verification, and filing tracking
 */

const { Op } = require('sequelize');
const { getFilingDueDates, getFilingPeriod, getFinancialYear, calculatePenalty, round } = require('./gstCalculationService');
const { generateGSTR1JSON, generateGSTR3BJSON } = require('./gstExportService');

/**
 * Generate GSTR-1 data for a period
 */
async function generateGSTR1(gstProfileId, period, models) {
    const { GSTProfile, GSTInvoice, GSTFiling } = models;

    const profile = await GSTProfile.findByPk(gstProfileId);
    if (!profile) {
        throw new Error('GST Profile not found');
    }

    // Get all finalized sales invoices for the period
    const invoices = await GSTInvoice.findAll({
        where: {
            gstProfileId,
            invoiceType: 'sales',
            filingPeriod: period,
            status: { [Op.in]: ['verified', 'finalized'] }
        }
    });

    if (invoices.length === 0) {
        console.log(`[GSTR-1] No invoices found for period ${period}`);
    }

    // Generate GSTR-1 JSON
    const jsonData = generateGSTR1JSON(invoices, profile, period);

    // Calculate summary
    const summary = calculateGSTR1Summary(invoices);

    // Get due date
    const dueDates = getFilingDueDates(profile.filingFrequency, period);

    // Create or update filing record
    const [filing, created] = await GSTFiling.findOrCreate({
        where: {
            gstProfileId,
            returnType: 'GSTR1',
            period
        },
        defaults: {
            gstProfileId,
            returnType: 'GSTR1',
            period,
            financialYear: getFinancialYear(new Date()),
            status: 'generated',
            dueDate: dueDates.gstr1,
            generatedAt: new Date(),
            jsonData,
            invoiceCount: invoices.length,
            totalInvoiceValue: summary.totalValue,
            taxLiability: summary.taxLiability,
            b2bSummary: summary.b2b,
            b2csSummary: summary.b2cs,
            b2clSummary: summary.b2cl,
            cdnrSummary: summary.cdnr,
            exportSummary: summary.exp
        }
    });

    if (!created) {
        await filing.update({
            status: 'generated',
            generatedAt: new Date(),
            jsonData,
            invoiceCount: invoices.length,
            totalInvoiceValue: summary.totalValue,
            taxLiability: summary.taxLiability,
            b2bSummary: summary.b2b,
            b2csSummary: summary.b2cs,
            b2clSummary: summary.b2cl,
            cdnrSummary: summary.cdnr,
            exportSummary: summary.exp
        });
    }

    return {
        filing,
        jsonData,
        summary,
        invoiceCount: invoices.length
    };
}

/**
 * Generate GSTR-3B data for a period
 */
async function generateGSTR3B(gstProfileId, period, models) {
    const { GSTProfile, GSTInvoice, GSTFiling } = models;

    const profile = await GSTProfile.findByPk(gstProfileId);
    if (!profile) {
        throw new Error('GST Profile not found');
    }

    // Get all invoices for the period
    const salesInvoices = await GSTInvoice.findAll({
        where: {
            gstProfileId,
            invoiceType: 'sales',
            filingPeriod: period,
            status: { [Op.in]: ['verified', 'finalized'] }
        }
    });

    const purchaseInvoices = await GSTInvoice.findAll({
        where: {
            gstProfileId,
            invoiceType: 'purchase',
            filingPeriod: period,
            status: { [Op.in]: ['verified', 'finalized'] }
        }
    });

    // Calculate summary data for GSTR-3B
    const summaryData = calculateGSTR3BSummary(salesInvoices, purchaseInvoices);

    // Generate GSTR-3B JSON
    const jsonData = generateGSTR3BJSON(summaryData, profile, period);

    // Get due date
    const dueDates = getFilingDueDates(profile.filingFrequency, period);

    // Create or update filing record
    const [filing, created] = await GSTFiling.findOrCreate({
        where: {
            gstProfileId,
            returnType: 'GSTR3B',
            period
        },
        defaults: {
            gstProfileId,
            returnType: 'GSTR3B',
            period,
            financialYear: getFinancialYear(new Date()),
            status: 'generated',
            dueDate: dueDates.gstr3b,
            generatedAt: new Date(),
            jsonData,
            taxLiability: summaryData.taxLiability,
            itcClaimed: summaryData.itcClaimed,
            netPayable: summaryData.netPayable
        }
    });

    if (!created) {
        await filing.update({
            status: 'generated',
            generatedAt: new Date(),
            jsonData,
            taxLiability: summaryData.taxLiability,
            itcClaimed: summaryData.itcClaimed,
            netPayable: summaryData.netPayable
        });
    }

    return {
        filing,
        jsonData,
        summary: summaryData
    };
}

/**
 * Calculate GSTR-1 summary from invoices
 */
function calculateGSTR1Summary(invoices) {
    const summary = {
        b2b: { count: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 },
        b2cs: { count: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 },
        b2cl: { count: 0, taxableValue: 0, igst: 0, cess: 0, total: 0 },
        cdnr: { count: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 },
        exp: { count: 0, taxableValue: 0, igst: 0, total: 0 },
        totalValue: 0,
        taxLiability: { cgst: 0, sgst: 0, igst: 0, cess: 0, total: 0 }
    };

    invoices.forEach(inv => {
        const category = inv.gstrCategory || 'B2CS';
        const cat = summary[category.toLowerCase()] || summary.b2cs;

        cat.count++;
        cat.taxableValue += inv.totalTaxableValue || 0;
        cat.cgst = (cat.cgst || 0) + (inv.totalCgst || 0);
        cat.sgst = (cat.sgst || 0) + (inv.totalSgst || 0);
        cat.igst = (cat.igst || 0) + (inv.totalIgst || 0);
        cat.cess = (cat.cess || 0) + (inv.totalCess || 0);
        cat.total += inv.totalAmount || 0;

        summary.totalValue += inv.totalAmount || 0;
        summary.taxLiability.cgst += inv.totalCgst || 0;
        summary.taxLiability.sgst += inv.totalSgst || 0;
        summary.taxLiability.igst += inv.totalIgst || 0;
        summary.taxLiability.cess += inv.totalCess || 0;
    });

    // Round all values
    Object.keys(summary).forEach(key => {
        if (typeof summary[key] === 'object') {
            Object.keys(summary[key]).forEach(subKey => {
                if (typeof summary[key][subKey] === 'number') {
                    summary[key][subKey] = round(summary[key][subKey]);
                }
            });
        }
    });

    summary.taxLiability.total = round(
        summary.taxLiability.cgst + summary.taxLiability.sgst +
        summary.taxLiability.igst + summary.taxLiability.cess
    );

    return summary;
}

/**
 * Calculate GSTR-3B summary from invoices
 */
function calculateGSTR3BSummary(salesInvoices, purchaseInvoices) {
    // Output tax from sales
    let taxableOutwardSupply = 0;
    let igstOutward = 0, cgstOutward = 0, sgstOutward = 0, cessOutward = 0;

    salesInvoices.forEach(inv => {
        taxableOutwardSupply += inv.totalTaxableValue || 0;
        igstOutward += inv.totalIgst || 0;
        cgstOutward += inv.totalCgst || 0;
        sgstOutward += inv.totalSgst || 0;
        cessOutward += inv.totalCess || 0;
    });

    // Input tax credit from purchases
    let itcOtherIgst = 0, itcOtherCgst = 0, itcOtherSgst = 0, itcOtherCess = 0;

    purchaseInvoices.forEach(inv => {
        itcOtherIgst += inv.totalIgst || 0;
        itcOtherCgst += inv.totalCgst || 0;
        itcOtherSgst += inv.totalSgst || 0;
        itcOtherCess += inv.totalCess || 0;
    });

    const netItcIgst = round(itcOtherIgst);
    const netItcCgst = round(itcOtherCgst);
    const netItcSgst = round(itcOtherSgst);
    const netItcCess = round(itcOtherCess);

    // Calculate net payable
    // IGST can be used against CGST, SGST, IGST
    // CGST can only be used against CGST, IGST
    // SGST can only be used against SGST, IGST

    let netIgstPayable = Math.max(0, igstOutward - netItcIgst);
    let netCgstPayable = Math.max(0, cgstOutward - netItcCgst);
    let netSgstPayable = Math.max(0, sgstOutward - netItcSgst);
    let netCessPayable = Math.max(0, cessOutward - netItcCess);

    const netPayable = round(netIgstPayable + netCgstPayable + netSgstPayable + netCessPayable);

    return {
        taxableOutwardSupply: round(taxableOutwardSupply),
        igstOutward: round(igstOutward),
        cgstOutward: round(cgstOutward),
        sgstOutward: round(sgstOutward),
        cessOutward: round(cessOutward),
        itcOtherIgst,
        itcOtherCgst,
        itcOtherSgst,
        itcOtherCess,
        netItcIgst,
        netItcCgst,
        netItcSgst,
        netItcCess,
        taxLiability: {
            cgst: round(cgstOutward),
            sgst: round(sgstOutward),
            igst: round(igstOutward),
            cess: round(cessOutward),
            total: round(cgstOutward + sgstOutward + igstOutward + cessOutward)
        },
        itcClaimed: {
            cgst: netItcCgst,
            sgst: netItcSgst,
            igst: netItcIgst,
            cess: netItcCess,
            total: round(netItcCgst + netItcSgst + netItcIgst + netItcCess)
        },
        netPayable
    };
}

/**
 * Submit filing for CA review
 */
async function submitForCAReview(filingId, models) {
    const { GSTFiling } = models;

    const filing = await GSTFiling.findByPk(filingId);
    if (!filing) {
        throw new Error('Filing not found');
    }

    if (filing.status !== 'generated') {
        throw new Error('Filing must be generated before submitting for review');
    }

    await filing.update({
        status: 'pending_review'
    });

    return filing;
}

/**
 * CA approves/rejects filing
 */
async function caApproveFiling(filingId, caId, approved, comments, signature, models) {
    const { GSTFiling } = models;

    const filing = await GSTFiling.findByPk(filingId);
    if (!filing) {
        throw new Error('Filing not found');
    }

    if (filing.status !== 'pending_review') {
        throw new Error('Filing is not pending review');
    }

    if (approved) {
        await filing.update({
            status: 'ca_verified',
            caId,
            caVerifiedAt: new Date(),
            caComments: comments,
            caSignature: signature
        });
    } else {
        await filing.update({
            status: 'generated', // Back to generated for revision
            caComments: comments
        });
    }

    return filing;
}

/**
 * Mark filing as exported (ready for portal upload)
 */
async function markAsExported(filingId, models) {
    const { GSTFiling } = models;

    const filing = await GSTFiling.findByPk(filingId);
    if (!filing) {
        throw new Error('Filing not found');
    }

    await filing.update({
        status: 'exported',
        exportedAt: new Date()
    });

    return filing;
}

/**
 * Mark filing as filed (after manual upload to portal)
 */
async function markAsFiled(filingId, arn, filedDate, models) {
    const { GSTFiling } = models;

    const filing = await GSTFiling.findByPk(filingId);
    if (!filing) {
        throw new Error('Filing not found');
    }

    await filing.update({
        status: 'filed',
        filedDate: filedDate || new Date(),
        arn
    });

    return filing;
}

/**
 * Get upcoming filing deadlines
 */
async function getUpcomingDeadlines(gstProfileId, models) {
    const { GSTProfile, GSTFiling } = models;

    const profile = await GSTProfile.findByPk(gstProfileId);
    if (!profile) {
        return [];
    }

    const today = new Date();
    const currentPeriod = getFilingPeriod(today);
    const deadlines = [];

    // Get next 3 months of deadlines
    for (let i = 0; i <= 2; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const period = getFilingPeriod(date);
        const dueDates = getFilingDueDates(profile.filingFrequency, period);

        // Check GSTR-1
        const gstr1Filing = await GSTFiling.findOne({
            where: { gstProfileId, returnType: 'GSTR1', period }
        });

        if (!gstr1Filing || gstr1Filing.status !== 'filed') {
            const dueDate = new Date(dueDates.gstr1);
            const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

            deadlines.push({
                returnType: 'GSTR-1',
                period,
                dueDate: dueDates.gstr1,
                daysRemaining,
                status: gstr1Filing?.status || 'not_started',
                isOverdue: daysRemaining < 0,
                penalty: daysRemaining < 0 ? calculatePenalty(dueDate, today, { cgst: 0, sgst: 0, igst: 0 }) : null
            });
        }

        // Check GSTR-3B
        const gstr3bFiling = await GSTFiling.findOne({
            where: { gstProfileId, returnType: 'GSTR3B', period }
        });

        if (!gstr3bFiling || gstr3bFiling.status !== 'filed') {
            const dueDate = new Date(dueDates.gstr3b);
            const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

            deadlines.push({
                returnType: 'GSTR-3B',
                period,
                dueDate: dueDates.gstr3b,
                daysRemaining,
                status: gstr3bFiling?.status || 'not_started',
                isOverdue: daysRemaining < 0,
                penalty: daysRemaining < 0 ? calculatePenalty(dueDate, today, gstr3bFiling?.taxLiability || { cgst: 0, sgst: 0, igst: 0 }) : null
            });
        }
    }

    return deadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

module.exports = {
    generateGSTR1,
    generateGSTR3B,
    calculateGSTR1Summary,
    calculateGSTR3BSummary,
    submitForCAReview,
    caApproveFiling,
    markAsExported,
    markAsFiled,
    getUpcomingDeadlines
};
