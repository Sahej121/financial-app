/**
 * GST Export Service
 * Generates GSTR-1, GSTR-3B, GSTR-9 JSON files in official GST Portal format
 * Also handles Excel exports and GSTR-2A/2B parsing
 */

const ExcelJS = require('exceljs');
const { round, getFilingPeriod, getFinancialYear } = require('./gstCalculationService');

/**
 * Generate GSTR-1 JSON in official format
 * @param {Array} invoices - Array of sales invoices for the period
 * @param {object} profile - GST Profile details
 * @param {string} period - MMYYYY format
 * @returns {object} - GSTR-1 JSON structure
 */
function generateGSTR1JSON(invoices, profile, period) {
    const fp = period; // Filing Period MMYYYY
    const gstin = profile.gstin;

    // Categorize invoices
    const b2bInvoices = invoices.filter(inv => inv.gstrCategory === 'B2B');
    const b2csInvoices = invoices.filter(inv => inv.gstrCategory === 'B2CS');
    const b2clInvoices = invoices.filter(inv => inv.gstrCategory === 'B2CL');
    const cdnrInvoices = invoices.filter(inv => inv.gstrCategory === 'CDNR');
    const expInvoices = invoices.filter(inv => inv.gstrCategory === 'EXP');

    const gstr1 = {
        gstin,
        fp,
        version: 'GST3.0.4',
        hash: 'hash',
        b2b: formatB2B(b2bInvoices),
        b2cs: formatB2CS(b2csInvoices),
        b2cl: formatB2CL(b2clInvoices),
        cdnr: formatCDNR(cdnrInvoices),
        exp: formatEXP(expInvoices),
        nil: formatNIL(invoices.filter(inv => inv.gstrCategory === 'NIL')),
        hsn: formatHSNSummary(invoices),
        doc_issue: formatDocIssue(invoices)
    };

    // Remove empty sections
    Object.keys(gstr1).forEach(key => {
        if (Array.isArray(gstr1[key]) && gstr1[key].length === 0) {
            delete gstr1[key];
        }
    });

    return gstr1;
}

/**
 * Format B2B invoices for GSTR-1
 */
function formatB2B(invoices) {
    const groupedByGstin = {};

    invoices.forEach(inv => {
        if (!groupedByGstin[inv.counterpartyGstin]) {
            groupedByGstin[inv.counterpartyGstin] = [];
        }
        groupedByGstin[inv.counterpartyGstin].push({
            inum: inv.invoiceNumber,
            idt: formatDate(inv.invoiceDate),
            val: round(inv.totalAmount),
            pos: inv.placeOfSupply,
            rchrg: inv.reverseCharge ? 'Y' : 'N',
            inv_typ: 'R', // Regular
            itms: formatLineItems(inv.items)
        });
    });

    return Object.entries(groupedByGstin).map(([ctin, inv]) => ({
        ctin,
        inv
    }));
}

/**
 * Format B2CS (Small B2C) invoices summary
 */
function formatB2CS(invoices) {
    // Group by rate and place of supply
    const grouped = {};

    invoices.forEach(inv => {
        inv.items.forEach(item => {
            const key = `${inv.placeOfSupply}_${item.gstRate}`;
            if (!grouped[key]) {
                grouped[key] = {
                    pos: inv.placeOfSupply,
                    rt: item.gstRate,
                    typ: 'OE', // Outward E-commerce
                    txval: 0,
                    camt: 0,
                    samt: 0,
                    iamt: 0,
                    csamt: 0
                };
            }
            grouped[key].txval += item.taxableValue || 0;
            grouped[key].camt += item.cgst || 0;
            grouped[key].samt += item.sgst || 0;
            grouped[key].iamt += item.igst || 0;
            grouped[key].csamt += item.cessAmount || 0;
        });
    });

    return Object.values(grouped).map(g => ({
        ...g,
        txval: round(g.txval),
        camt: round(g.camt),
        samt: round(g.samt),
        iamt: round(g.iamt),
        csamt: round(g.csamt)
    }));
}

/**
 * Format B2CL (Large B2C) invoices
 */
function formatB2CL(invoices) {
    const grouped = {};

    invoices.forEach(inv => {
        if (!grouped[inv.placeOfSupply]) {
            grouped[inv.placeOfSupply] = [];
        }
        grouped[inv.placeOfSupply].push({
            inum: inv.invoiceNumber,
            idt: formatDate(inv.invoiceDate),
            val: round(inv.totalAmount),
            itms: formatLineItems(inv.items)
        });
    });

    return Object.entries(grouped).map(([pos, inv]) => ({ pos, inv }));
}

/**
 * Format Credit/Debit Notes
 */
function formatCDNR(invoices) {
    const grouped = {};

    invoices.forEach(inv => {
        if (!grouped[inv.counterpartyGstin]) {
            grouped[inv.counterpartyGstin] = [];
        }
        grouped[inv.counterpartyGstin].push({
            ntty: inv.documentType === 'credit_note' ? 'C' : 'D',
            nt_num: inv.invoiceNumber,
            nt_dt: formatDate(inv.invoiceDate),
            val: round(inv.totalAmount),
            pos: inv.placeOfSupply,
            rchrg: inv.reverseCharge ? 'Y' : 'N',
            itms: formatLineItems(inv.items)
        });
    });

    return Object.entries(grouped).map(([ctin, nt]) => ({ ctin, nt }));
}

/**
 * Format Export invoices
 */
function formatEXP(invoices) {
    return invoices.map(inv => ({
        exp_typ: 'WPAY', // With Payment
        inv: [{
            inum: inv.invoiceNumber,
            idt: formatDate(inv.invoiceDate),
            val: round(inv.totalAmount),
            sbpcode: '', // Shipping bill port code
            sbnum: '', // Shipping bill number
            sbdt: '', // Shipping bill date
            itms: formatLineItems(inv.items)
        }]
    }));
}

/**
 * Format NIL rated supplies
 */
function formatNIL(invoices) {
    if (invoices.length === 0) return [];

    let nilAmt = 0, exptAmt = 0;
    invoices.forEach(inv => {
        if (inv.gstRate === 0) nilAmt += inv.totalTaxableValue;
        if (inv.isExempt) exptAmt += inv.totalTaxableValue;
    });

    return {
        inv: [{
            sply_ty: 'INTRB2B',
            nil_amt: round(nilAmt),
            expt_amt: round(exptAmt),
            ngsup_amt: 0
        }]
    };
}

/**
 * Format HSN Summary
 */
function formatHSNSummary(invoices) {
    const hsnMap = {};

    invoices.forEach(inv => {
        (inv.items || []).forEach(item => {
            const hsn = item.hsnSac || '0000';
            if (!hsnMap[hsn]) {
                hsnMap[hsn] = {
                    hsn_sc: hsn,
                    desc: item.description || '',
                    uqc: 'NOS', // Unit Quantity Code
                    qty: 0,
                    txval: 0,
                    iamt: 0,
                    camt: 0,
                    samt: 0,
                    csamt: 0
                };
            }
            hsnMap[hsn].qty += parseFloat(item.quantity) || 1;
            hsnMap[hsn].txval += item.taxableValue || 0;
            hsnMap[hsn].iamt += item.igst || 0;
            hsnMap[hsn].camt += item.cgst || 0;
            hsnMap[hsn].samt += item.sgst || 0;
            hsnMap[hsn].csamt += item.cessAmount || 0;
        });
    });

    return {
        data: Object.values(hsnMap).map(h => ({
            ...h,
            qty: round(h.qty),
            txval: round(h.txval),
            iamt: round(h.iamt),
            camt: round(h.camt),
            samt: round(h.samt),
            csamt: round(h.csamt)
        }))
    };
}

/**
 * Format Document Issue summary
 */
function formatDocIssue(invoices) {
    if (invoices.length === 0) return [];

    const invoiceNumbers = invoices.map(i => i.invoiceNumber).sort();
    return {
        doc_det: [{
            doc_num: 1,
            docs: [{
                num: invoices.length,
                from: invoiceNumbers[0],
                to: invoiceNumbers[invoiceNumbers.length - 1],
                totnum: invoices.length,
                cancel: 0,
                net_issue: invoices.length
            }]
        }]
    };
}

/**
 * Format line items for GSTR
 */
function formatLineItems(items) {
    const rateGroups = {};

    (items || []).forEach(item => {
        const rate = item.gstRate || 18;
        if (!rateGroups[rate]) {
            rateGroups[rate] = { txval: 0, iamt: 0, camt: 0, samt: 0, csamt: 0 };
        }
        rateGroups[rate].txval += item.taxableValue || 0;
        rateGroups[rate].iamt += item.igst || 0;
        rateGroups[rate].camt += item.cgst || 0;
        rateGroups[rate].samt += item.sgst || 0;
        rateGroups[rate].csamt += item.cessAmount || 0;
    });

    return Object.entries(rateGroups).map(([rt, vals]) => ({
        num: 1,
        itm_det: {
            rt: parseFloat(rt),
            txval: round(vals.txval),
            iamt: round(vals.iamt),
            camt: round(vals.camt),
            samt: round(vals.samt),
            csamt: round(vals.csamt)
        }
    }));
}

/**
 * Generate GSTR-3B JSON
 */
function generateGSTR3BJSON(summaryData, profile, period) {
    return {
        gstin: profile.gstin,
        ret_period: period,
        sup_details: {
            osup_det: {
                txval: round(summaryData.taxableOutwardSupply || 0),
                iamt: round(summaryData.igstOutward || 0),
                camt: round(summaryData.cgstOutward || 0),
                samt: round(summaryData.sgstOutward || 0),
                csamt: round(summaryData.cessOutward || 0)
            },
            osup_zero: {
                txval: round(summaryData.zeroRatedSupply || 0),
                iamt: 0,
                camt: 0,
                samt: 0,
                csamt: 0
            },
            osup_nil_exmp: {
                txval: round(summaryData.nilExemptSupply || 0)
            },
            isup_rev: {
                txval: round(summaryData.inwardReverseCharge || 0),
                iamt: round(summaryData.igstReverseCharge || 0),
                camt: round(summaryData.cgstReverseCharge || 0),
                samt: round(summaryData.sgstReverseCharge || 0),
                csamt: round(summaryData.cessReverseCharge || 0)
            },
            osup_nongst: {
                txval: round(summaryData.nonGstSupply || 0)
            }
        },
        itc_elg: {
            itc_avl: [
                { ty: 'IMPG', iamt: round(summaryData.itcImportGoods || 0), camt: 0, samt: 0, csamt: 0 },
                { ty: 'IMPS', iamt: round(summaryData.itcImportServices || 0), camt: 0, samt: 0, csamt: 0 },
                { ty: 'ISRC', iamt: round(summaryData.itcReverseCharge || 0), camt: 0, samt: 0, csamt: 0 },
                { ty: 'ISD', iamt: round(summaryData.itcISD || 0), camt: 0, samt: 0, csamt: 0 },
                {
                    ty: 'OTH',
                    iamt: round(summaryData.itcOtherIgst || 0),
                    camt: round(summaryData.itcOtherCgst || 0),
                    samt: round(summaryData.itcOtherSgst || 0),
                    csamt: round(summaryData.itcOtherCess || 0)
                }
            ],
            itc_rev: [{
                ty: 'RUL',
                iamt: round(summaryData.itcReversedIgst || 0),
                camt: round(summaryData.itcReversedCgst || 0),
                samt: round(summaryData.itcReversedSgst || 0),
                csamt: round(summaryData.itcReversedCess || 0)
            }],
            itc_net: {
                iamt: round(summaryData.netItcIgst || 0),
                camt: round(summaryData.netItcCgst || 0),
                samt: round(summaryData.netItcSgst || 0),
                csamt: round(summaryData.netItcCess || 0)
            }
        },
        inward_sup: {
            isup_details: [{
                ty: 'GST',
                inter: round(summaryData.interStateInward || 0),
                intra: round(summaryData.intraStateInward || 0)
            }]
        },
        intr_ltfee: {
            intr_details: {
                iamt: round(summaryData.interestIgst || 0),
                camt: round(summaryData.interestCgst || 0),
                samt: round(summaryData.interestSgst || 0),
                csamt: round(summaryData.interestCess || 0)
            },
            ltfee_details: {
                camt: round(summaryData.lateFeeCgst || 0),
                samt: round(summaryData.lateFeeSgst || 0)
            }
        }
    };
}

/**
 * Parse GSTR-2A/2B file (Excel or JSON)
 */
async function parseGSTR2A(fileBuffer, fileType = 'xlsx') {
    if (fileType === 'json') {
        const data = JSON.parse(fileBuffer.toString());
        return parseGSTR2AJSON(data);
    }

    // Parse Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileBuffer);

    const records = [];
    const b2bSheet = workbook.getWorksheet('B2B');

    if (b2bSheet) {
        b2bSheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header
                records.push({
                    supplierGstin: row.getCell(1).value,
                    supplierName: row.getCell(2).value,
                    invoiceNumber: row.getCell(3).value,
                    invoiceDate: row.getCell(4).value,
                    invoiceValue: parseFloat(row.getCell(5).value) || 0,
                    taxableValue: parseFloat(row.getCell(6).value) || 0,
                    igst: parseFloat(row.getCell(7).value) || 0,
                    cgst: parseFloat(row.getCell(8).value) || 0,
                    sgst: parseFloat(row.getCell(9).value) || 0,
                    cess: parseFloat(row.getCell(10).value) || 0,
                    source: 'GSTR2A'
                });
            }
        });
    }

    return records;
}

/**
 * Parse GSTR-2A JSON format
 */
function parseGSTR2AJSON(data) {
    const records = [];

    if (data.b2b) {
        data.b2b.forEach(supplier => {
            (supplier.inv || []).forEach(inv => {
                let totalTaxableValue = 0, totalIgst = 0, totalCgst = 0, totalSgst = 0, totalCess = 0;

                (inv.itms || []).forEach(itm => {
                    const det = itm.itm_det || {};
                    totalTaxableValue += det.txval || 0;
                    totalIgst += det.iamt || 0;
                    totalCgst += det.camt || 0;
                    totalSgst += det.samt || 0;
                    totalCess += det.csamt || 0;
                });

                records.push({
                    supplierGstin: supplier.ctin,
                    supplierName: supplier.trdnm || '',
                    invoiceNumber: inv.inum,
                    invoiceDate: inv.idt,
                    invoiceValue: inv.val,
                    taxableValue: totalTaxableValue,
                    igst: totalIgst,
                    cgst: totalCgst,
                    sgst: totalSgst,
                    cess: totalCess,
                    source: 'GSTR2A'
                });
            });
        });
    }

    return records;
}

/**
 * Export invoices to Excel
 */
async function exportToExcel(invoices, profile, type, period) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Financial App';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(`${type} - ${period}`);

    // Add headers
    sheet.columns = [
        { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
        { header: 'Invoice Date', key: 'invoiceDate', width: 15 },
        { header: 'Party GSTIN', key: 'counterpartyGstin', width: 20 },
        { header: 'Party Name', key: 'counterpartyName', width: 30 },
        { header: 'Place of Supply', key: 'placeOfSupply', width: 15 },
        { header: 'Taxable Value', key: 'totalTaxableValue', width: 15 },
        { header: 'CGST', key: 'totalCgst', width: 12 },
        { header: 'SGST', key: 'totalSgst', width: 12 },
        { header: 'IGST', key: 'totalIgst', width: 12 },
        { header: 'Cess', key: 'totalCess', width: 12 },
        { header: 'Total', key: 'totalAmount', width: 15 },
        { header: 'Category', key: 'gstrCategory', width: 12 },
        { header: 'Status', key: 'status', width: 12 }
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data
    invoices.forEach(inv => {
        sheet.addRow({
            invoiceNumber: inv.invoiceNumber,
            invoiceDate: inv.invoiceDate,
            counterpartyGstin: inv.counterpartyGstin || 'N/A',
            counterpartyName: inv.counterpartyName,
            placeOfSupply: inv.placeOfSupply,
            totalTaxableValue: inv.totalTaxableValue,
            totalCgst: inv.totalCgst,
            totalSgst: inv.totalSgst,
            totalIgst: inv.totalIgst,
            totalCess: inv.totalCess || 0,
            totalAmount: inv.totalAmount,
            gstrCategory: inv.gstrCategory,
            status: inv.status
        });
    });

    // Add totals row
    const lastRow = sheet.rowCount + 1;
    sheet.getCell(`A${lastRow}`).value = 'TOTAL';
    sheet.getCell(`A${lastRow}`).font = { bold: true };

    ['F', 'G', 'H', 'I', 'J', 'K'].forEach((col, idx) => {
        const colNum = idx + 6;
        sheet.getCell(`${col}${lastRow}`).value = {
            formula: `SUM(${col}2:${col}${lastRow - 1})`
        };
        sheet.getCell(`${col}${lastRow}`).font = { bold: true };
    });

    return workbook.xlsx.writeBuffer();
}

// Helper to format date to DD-MM-YYYY
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

module.exports = {
    generateGSTR1JSON,
    generateGSTR3BJSON,
    parseGSTR2A,
    parseGSTR2AJSON,
    exportToExcel,
    formatB2B,
    formatB2CS,
    formatHSNSummary
};
