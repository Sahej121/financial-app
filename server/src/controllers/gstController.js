/**
 * GST Controller
 * Handles all GST-related API endpoints
 */

const models = require('../models');
const gstCalculationService = require('../services/gstCalculationService');
const gstFilingService = require('../services/gstFilingService');
const gstExportService = require('../services/gstExportService');
const itcOptimizationService = require('../services/itcOptimizationService');
const invoiceExtractionService = require('../services/invoiceExtractionService');
const { Op } = require('sequelize');

const { GSTProfile, GSTInvoice, GSTFiling, HSNCode, ITCRecord, User, Document } = models;

// ============== GST PROFILE ==============

/**
 * Get user's GST profile
 */
exports.getProfile = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({
            where: { userId: req.user.id }
        });

        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found. Please set up your profile first.' });
        }

        res.json(profile);
    } catch (error) {
        console.error('[GST] Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch GST profile' });
    }
};

/**
 * Create GST profile
 */
exports.createProfile = async (req, res) => {
    try {
        const { gstin, businessName, legalName, businessType, filingFrequency, address, turnoverCategory, phone, email } = req.body;

        // Validate GSTIN
        const validation = gstCalculationService.validateGSTIN(gstin);
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.error });
        }

        // Check if profile already exists
        const existing = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (existing) {
            return res.status(400).json({ error: 'GST profile already exists. Use update instead.' });
        }

        // Check if GSTIN is already registered
        const gstinExists = await GSTProfile.findOne({ where: { gstin } });
        if (gstinExists) {
            return res.status(400).json({ error: 'This GSTIN is already registered' });
        }

        const profile = await GSTProfile.create({
            userId: req.user.id,
            gstin,
            businessName,
            legalName,
            businessType,
            state: validation.details.stateName,
            stateCode: validation.details.stateCode,
            filingFrequency: filingFrequency || 'monthly',
            address,
            turnoverCategory,
            pan: validation.details.pan,
            phone,
            email
        });

        res.status(201).json(profile);
    } catch (error) {
        console.error('[GST] Create profile error:', error);
        res.status(500).json({ error: 'Failed to create GST profile' });
    }
};

/**
 * Update GST profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const { businessName, legalName, businessType, filingFrequency, address, turnoverCategory, phone, email, isActive } = req.body;

        await profile.update({
            businessName: businessName || profile.businessName,
            legalName,
            businessType,
            filingFrequency,
            address,
            turnoverCategory,
            phone,
            email,
            isActive
        });

        res.json(profile);
    } catch (error) {
        console.error('[GST] Update profile error:', error);
        res.status(500).json({ error: 'Failed to update GST profile' });
    }
};

// ============== INVOICES ==============

/**
 * Get all invoices with filters
 */
exports.getInvoices = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const { type, status, period, page = 1, limit = 20 } = req.query;

        const where = { gstProfileId: profile.id };
        if (type) where.invoiceType = type;
        if (status) where.status = status;
        if (period) where.filingPeriod = period;

        const { rows: invoices, count } = await GSTInvoice.findAndCountAll({
            where,
            order: [['invoiceDate', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        res.json({
            invoices,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('[GST] Get invoices error:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

/**
 * Create invoice manually
 */
exports.createInvoice = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const {
            invoiceType, invoiceNumber, invoiceDate, counterpartyGstin,
            counterpartyName, placeOfSupply, items, reverseCharge
        } = req.body;

        // Calculate GST for items
        const hsnLookup = {};
        const hsnCodes = await HSNCode.findAll();
        hsnCodes.forEach(h => { hsnLookup[h.code] = h; });

        const calculated = gstCalculationService.calculateGST(
            items, placeOfSupply, profile.stateCode, hsnLookup
        );

        // Get GSTR category
        const gstrCategory = gstCalculationService.getGSTRCategory({
            counterpartyGstin,
            totalAmount: calculated.summary.totalAmount,
            invoiceType,
            isInterState: calculated.isInterState
        });

        const invoice = await GSTInvoice.create({
            gstProfileId: profile.id,
            invoiceType,
            invoiceNumber,
            invoiceDate,
            counterpartyGstin,
            counterpartyName,
            placeOfSupply,
            items: calculated.items,
            totalTaxableValue: calculated.summary.totalTaxableValue,
            totalCgst: calculated.summary.totalCgst,
            totalSgst: calculated.summary.totalSgst,
            totalIgst: calculated.summary.totalIgst,
            totalCess: calculated.summary.totalCess,
            totalAmount: calculated.summary.totalAmount,
            gstrCategory,
            status: 'draft',
            reverseCharge: reverseCharge || false,
            filingPeriod: gstCalculationService.getFilingPeriod(invoiceDate)
        });

        res.status(201).json(invoice);
    } catch (error) {
        console.error('[GST] Create invoice error:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};

/**
 * Extract invoice from uploaded document
 */
exports.extractInvoice = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const { documentId } = req.body;

        // Get document
        const document = await Document.findByPk(documentId);
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Extract invoice data
        const result = await invoiceExtractionService.extractInvoiceFromDocument(
            document.filePath,
            document.mimeType,
            profile.stateCode
        );

        if (!result.success) {
            return res.status(400).json({
                error: 'Failed to extract invoice data',
                details: result.error
            });
        }

        // Create invoice with extracted data
        const invoice = await GSTInvoice.create({
            gstProfileId: profile.id,
            documentId,
            invoiceType: result.data.invoiceType || 'purchase',
            invoiceNumber: result.data.invoiceNumber,
            invoiceDate: result.data.invoiceDate,
            counterpartyGstin: result.data.counterpartyGstin,
            counterpartyName: result.data.counterpartyName,
            placeOfSupply: result.data.placeOfSupply || profile.stateCode,
            items: result.data.items || [],
            totalTaxableValue: result.data.totalTaxableValue || 0,
            totalCgst: result.data.totalCgst || 0,
            totalSgst: result.data.totalSgst || 0,
            totalIgst: result.data.totalIgst || 0,
            totalAmount: result.data.totalAmount || 0,
            gstrCategory: result.data.gstrCategory,
            status: 'extracted',
            extractionConfidence: result.confidence,
            rawExtractedData: result.data,
            extractionErrors: result.extractionErrors,
            filingPeriod: result.data.filingPeriod
        });

        res.status(201).json({
            invoice,
            confidence: result.confidence,
            needsReview: result.confidence < 0.8 || result.extractionErrors?.length > 0,
            extractionErrors: result.extractionErrors
        });
    } catch (error) {
        console.error('[GST] Extract invoice error:', error);
        res.status(500).json({ error: 'Failed to extract invoice' });
    }
};

/**
 * Update invoice
 */
exports.updateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const invoice = await GSTInvoice.findOne({
            where: { id, gstProfileId: profile.id }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (invoice.status === 'finalized') {
            return res.status(400).json({ error: 'Cannot update finalized invoice' });
        }

        const updates = req.body;

        // Recalculate if items changed
        if (updates.items) {
            const hsnLookup = {};
            const hsnCodes = await HSNCode.findAll();
            hsnCodes.forEach(h => { hsnLookup[h.code] = h; });

            const calculated = gstCalculationService.calculateGST(
                updates.items,
                updates.placeOfSupply || invoice.placeOfSupply,
                profile.stateCode,
                hsnLookup
            );

            updates.items = calculated.items;
            updates.totalTaxableValue = calculated.summary.totalTaxableValue;
            updates.totalCgst = calculated.summary.totalCgst;
            updates.totalSgst = calculated.summary.totalSgst;
            updates.totalIgst = calculated.summary.totalIgst;
            updates.totalCess = calculated.summary.totalCess;
            updates.totalAmount = calculated.summary.totalAmount;
        }

        await invoice.update(updates);
        res.json(invoice);
    } catch (error) {
        console.error('[GST] Update invoice error:', error);
        res.status(500).json({ error: 'Failed to update invoice' });
    }
};

/**
 * Delete invoice (only drafts)
 */
exports.deleteInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const invoice = await GSTInvoice.findOne({
            where: { id, gstProfileId: profile.id }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (invoice.status !== 'draft' && invoice.status !== 'extracted') {
            return res.status(400).json({ error: 'Can only delete draft invoices' });
        }

        await invoice.destroy();
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('[GST] Delete invoice error:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
};

/**
 * Verify invoice (change status to verified)
 */
exports.verifyInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const invoice = await GSTInvoice.findOne({
            where: { id, gstProfileId: profile.id }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        await invoice.update({ status: 'verified' });
        res.json(invoice);
    } catch (error) {
        console.error('[GST] Verify invoice error:', error);
        res.status(500).json({ error: 'Failed to verify invoice' });
    }
};

/**
 * Finalize invoice
 */
exports.finalizeInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const invoice = await GSTInvoice.findOne({
            where: { id, gstProfileId: profile.id }
        });
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        await invoice.update({ status: 'finalized' });
        res.json(invoice);
    } catch (error) {
        console.error('[GST] Finalize invoice error:', error);
        res.status(500).json({ error: 'Failed to finalize invoice' });
    }
};

// ============== FILINGS ==============

/**
 * Get all filings
 */
exports.getFilings = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const { returnType, status, financialYear } = req.query;

        const where = { gstProfileId: profile.id };
        if (returnType) where.returnType = returnType;
        if (status) where.status = status;
        if (financialYear) where.financialYear = financialYear;

        const filings = await GSTFiling.findAll({
            where,
            order: [['period', 'DESC']]
        });

        res.json(filings);
    } catch (error) {
        console.error('[GST] Get filings error:', error);
        res.status(500).json({ error: 'Failed to fetch filings' });
    }
};

/**
 * Generate GSTR-1
 */
exports.generateGSTR1 = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const { period } = req.body;
        if (!period || !/^\d{6}$/.test(period)) {
            return res.status(400).json({ error: 'Invalid period format. Use MMYYYY' });
        }

        const result = await gstFilingService.generateGSTR1(profile.id, period, models);
        res.json(result);
    } catch (error) {
        console.error('[GST] Generate GSTR-1 error:', error);
        res.status(500).json({ error: 'Failed to generate GSTR-1' });
    }
};

/**
 * Generate GSTR-3B
 */
exports.generateGSTR3B = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const { period } = req.body;
        if (!period || !/^\d{6}$/.test(period)) {
            return res.status(400).json({ error: 'Invalid period format. Use MMYYYY' });
        }

        const result = await gstFilingService.generateGSTR3B(profile.id, period, models);
        res.json(result);
    } catch (error) {
        console.error('[GST] Generate GSTR-3B error:', error);
        res.status(500).json({ error: 'Failed to generate GSTR-3B' });
    }
};

/**
 * Submit filing for CA review
 */
exports.submitForReview = async (req, res) => {
    try {
        const { id } = req.params;
        const filing = await gstFilingService.submitForCAReview(id, models);
        res.json(filing);
    } catch (error) {
        console.error('[GST] Submit for review error:', error);
        res.status(500).json({ error: error.message || 'Failed to submit for review' });
    }
};

/**
 * CA approve/reject filing
 */
exports.caApproveFiling = async (req, res) => {
    try {
        const { id } = req.params;
        const { approved, comments, signature } = req.body;

        const filing = await gstFilingService.caApproveFiling(
            id, req.user.id, approved, comments, signature, models
        );
        res.json(filing);
    } catch (error) {
        console.error('[GST] CA approve error:', error);
        res.status(500).json({ error: error.message || 'Failed to process approval' });
    }
};

/**
 * Export filing as JSON
 */
exports.exportFilingJSON = async (req, res) => {
    try {
        const { id } = req.params;

        const filing = await GSTFiling.findByPk(id);
        if (!filing) {
            return res.status(404).json({ error: 'Filing not found' });
        }

        // Mark as exported
        await gstFilingService.markAsExported(id, models);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${filing.returnType}_${filing.period}.json`);
        res.send(JSON.stringify(filing.jsonData, null, 2));
    } catch (error) {
        console.error('[GST] Export JSON error:', error);
        res.status(500).json({ error: 'Failed to export filing' });
    }
};

/**
 * Export filing as Excel
 */
exports.exportFilingExcel = async (req, res) => {
    try {
        const { id } = req.params;

        const filing = await GSTFiling.findByPk(id, {
            include: [{ model: GSTProfile, as: 'gstProfile' }]
        });
        if (!filing) {
            return res.status(404).json({ error: 'Filing not found' });
        }

        // Get invoices for the period
        const invoices = await GSTInvoice.findAll({
            where: {
                gstProfileId: filing.gstProfileId,
                invoiceType: filing.returnType === 'GSTR1' ? 'sales' : 'purchase',
                filingPeriod: filing.period
            }
        });

        const buffer = await gstExportService.exportToExcel(
            invoices, filing.gstProfile, filing.returnType, filing.period
        );

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filing.returnType}_${filing.period}.xlsx`);
        res.send(buffer);
    } catch (error) {
        console.error('[GST] Export Excel error:', error);
        res.status(500).json({ error: 'Failed to export Excel' });
    }
};

/**
 * Mark filing as filed
 */
exports.markAsFiled = async (req, res) => {
    try {
        const { id } = req.params;
        const { arn, filedDate } = req.body;

        const filing = await gstFilingService.markAsFiled(id, arn, filedDate, models);
        res.json(filing);
    } catch (error) {
        console.error('[GST] Mark as filed error:', error);
        res.status(500).json({ error: error.message || 'Failed to mark as filed' });
    }
};

// ============== HSN CODES ==============

/**
 * Search HSN/SAC codes
 */
exports.searchHSN = async (req, res) => {
    try {
        const { q, type, limit = 20 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Query must be at least 2 characters' });
        }

        const where = {
            [Op.or]: [
                { code: { [Op.like]: `${q}%` } },
                { description: { [Op.like]: `%${q}%` } },
                { searchKeywords: { [Op.like]: `%${q}%` } }
            ]
        };

        if (type) where.type = type;

        const codes = await HSNCode.findAll({
            where,
            order: [['isCommon', 'DESC'], ['code', 'ASC']],
            limit: parseInt(limit)
        });

        res.json(codes);
    } catch (error) {
        console.error('[GST] HSN search error:', error);
        res.status(500).json({ error: 'Failed to search HSN codes' });
    }
};

// ============== DEADLINES ==============

/**
 * Get upcoming deadlines
 */
exports.getDeadlines = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const deadlines = await gstFilingService.getUpcomingDeadlines(profile.id, models);
        res.json(deadlines);
    } catch (error) {
        console.error('[GST] Get deadlines error:', error);
        res.status(500).json({ error: 'Failed to fetch deadlines' });
    }
};

// ============== PENALTY CALCULATOR ==============

/**
 * Calculate penalty
 */
exports.calculatePenalty = async (req, res) => {
    try {
        const { dueDate, filingDate, taxLiability } = req.query;

        if (!dueDate || !filingDate) {
            return res.status(400).json({ error: 'dueDate and filingDate are required' });
        }

        const penalty = gstCalculationService.calculatePenalty(
            dueDate,
            filingDate,
            taxLiability ? JSON.parse(taxLiability) : { cgst: 0, sgst: 0, igst: 0 }
        );

        res.json(penalty);
    } catch (error) {
        console.error('[GST] Calculate penalty error:', error);
        res.status(500).json({ error: 'Failed to calculate penalty' });
    }
};

// ============== ITC RECONCILIATION ==============

/**
 * Upload GSTR-2A for reconciliation
 */
exports.uploadGSTR2A = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'File is required' });
        }

        const { period } = req.body;
        const fileType = req.file.mimetype.includes('json') ? 'json' : 'xlsx';

        // Parse GSTR-2A file
        const records = await gstExportService.parseGSTR2A(req.file.buffer, fileType);

        // Store records
        for (const record of records) {
            await ITCRecord.create({
                gstProfileId: profile.id,
                period,
                source: 'GSTR2A',
                ...record
            });
        }

        res.json({
            message: 'GSTR-2A uploaded successfully',
            recordsImported: records.length
        });
    } catch (error) {
        console.error('[GST] Upload GSTR-2A error:', error);
        res.status(500).json({ error: 'Failed to upload GSTR-2A' });
    }
};

/**
 * Get ITC reconciliation report
 */
exports.getITCReconciliation = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const { period } = req.query;

        // Get GSTR-2A records
        const gstr2aRecords = await ITCRecord.findAll({
            where: { gstProfileId: profile.id, period }
        });

        // Perform reconciliation
        const reconciliation = await itcOptimizationService.reconcileITC(
            profile.id, period, gstr2aRecords, models
        );

        // Get risk analysis
        const riskAnalysis = await itcOptimizationService.predictITCRisk(profile.id, models);

        // Get suggestions
        const suggestions = itcOptimizationService.suggestITCOptimization(reconciliation, riskAnalysis);

        res.json({
            reconciliation,
            riskAnalysis,
            suggestions
        });
    } catch (error) {
        console.error('[GST] ITC reconciliation error:', error);
        res.status(500).json({ error: 'Failed to get ITC reconciliation' });
    }
};

// ============== DASHBOARD STATS ==============

/**
 * Get GST dashboard summary
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const profile = await GSTProfile.findOne({ where: { userId: req.user.id } });
        if (!profile) {
            return res.status(404).json({ error: 'GST Profile not found' });
        }

        const currentPeriod = gstCalculationService.getFilingPeriod(new Date());

        // Get counts
        const [
            totalInvoices,
            pendingReview,
            upcomingDeadlines,
            currentMonthSales,
            currentMonthPurchases
        ] = await Promise.all([
            GSTInvoice.count({ where: { gstProfileId: profile.id } }),
            GSTInvoice.count({ where: { gstProfileId: profile.id, status: 'extracted' } }),
            gstFilingService.getUpcomingDeadlines(profile.id, models),
            GSTInvoice.sum('totalAmount', {
                where: { gstProfileId: profile.id, invoiceType: 'sales', filingPeriod: currentPeriod }
            }),
            GSTInvoice.sum('totalAmount', {
                where: { gstProfileId: profile.id, invoiceType: 'purchase', filingPeriod: currentPeriod }
            })
        ]);

        res.json({
            profile: {
                gstin: profile.gstin,
                businessName: profile.businessName,
                filingFrequency: profile.filingFrequency
            },
            stats: {
                totalInvoices,
                pendingReview,
                currentMonthSales: currentMonthSales || 0,
                currentMonthPurchases: currentMonthPurchases || 0
            },
            upcomingDeadlines: upcomingDeadlines.slice(0, 5)
        });
    } catch (error) {
        console.error('[GST] Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

/**
 * Validate GSTIN
 */
exports.validateGSTIN = async (req, res) => {
    try {
        const { gstin } = req.query;
        const validation = gstCalculationService.validateGSTIN(gstin);
        res.json(validation);
    } catch (error) {
        console.error('[GST] Validate GSTIN error:', error);
        res.status(500).json({ error: 'Failed to validate GSTIN' });
    }
};

/**
 * Get all pending filings for CA review
 */
exports.getPendingFilings = async (req, res) => {
    try {
        // Only CAs can access this
        if (req.user.role !== 'ca' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only CAs can access pending filings' });
        }

        const filings = await GSTFiling.findAll({
            where: {
                status: 'pending_review'
            },
            include: [{
                model: GSTProfile,
                as: 'gstProfile',
                attributes: ['businessName', 'legalName', 'gstin', 'id']
            }],
            order: [['updatedAt', 'DESC']]
        });

        res.json(filings);
    } catch (error) {
        console.error('[GST] Get pending filings error:', error);
        res.status(500).json({ error: 'Failed to fetch pending filings' });
    }
};
