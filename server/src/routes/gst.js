/**
 * GST Routes
 * All GST-related API endpoints
 */

const express = require('express');
const router = express.Router();
const gstController = require('../controllers/gstController');
const authController = require('../controllers/authController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(authController.auth);

// ============== GST PROFILE ==============
router.get('/profile', gstController.getProfile);
router.post('/profile', gstController.createProfile);
router.put('/profile', gstController.updateProfile);

// ============== INVOICES ==============
router.get('/invoices', gstController.getInvoices);
router.post('/invoices', gstController.createInvoice);
router.post('/invoices/extract', gstController.extractInvoice);
router.put('/invoices/:id', gstController.updateInvoice);
router.delete('/invoices/:id', gstController.deleteInvoice);
router.post('/invoices/:id/verify', gstController.verifyInvoice);
router.post('/invoices/:id/finalize', gstController.finalizeInvoice);

// ============== FILINGS ==============
router.get('/filings', gstController.getFilings);
router.get('/filings/pending', gstController.getPendingFilings);
router.post('/filings/generate/gstr1', gstController.generateGSTR1);
router.post('/filings/generate/gstr3b', gstController.generateGSTR3B);
router.post('/filings/:id/submit-for-review', gstController.submitForReview);
router.post('/filings/:id/ca-approve', gstController.caApproveFiling);
router.get('/filings/:id/export/json', gstController.exportFilingJSON);
router.get('/filings/:id/export/excel', gstController.exportFilingExcel);
router.post('/filings/:id/mark-filed', gstController.markAsFiled);

// ============== HSN CODES ==============
router.get('/hsn/search', gstController.searchHSN);

// ============== DEADLINES & PENALTIES ==============
router.get('/deadlines', gstController.getDeadlines);
router.get('/penalties/calculate', gstController.calculatePenalty);

// ============== ITC RECONCILIATION ==============
router.post('/itc/upload-gstr2a', upload.single('file'), gstController.uploadGSTR2A);
router.post('/itc/upload-gstr2b', upload.single('file'), gstController.uploadGSTR2A); // Same handler
router.get('/itc/reconciliation', gstController.getITCReconciliation);

// ============== DASHBOARD & UTILITIES ==============
router.get('/dashboard', gstController.getDashboardStats);
router.get('/validate-gstin', gstController.validateGSTIN);

module.exports = router;
