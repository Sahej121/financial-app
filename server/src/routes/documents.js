const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const documentAnalysisController = require('../controllers/documentAnalysisController');
const { auth } = require('../controllers/authController');
const requireRole = require('../middleware/requireRole');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload document (clients only)
router.post('/upload',
  auth,
  requireRole(['user', 'premium', 'ca', 'financial_planner']),
  upload.single('file'),
  documentController.uploadDocument
);

// Get user's own documents (clients)
router.get('/user',
  auth,
  requireRole(['user', 'premium']),
  documentController.getUserDocuments
);

// Get documents pending review (professionals)
router.get('/pending',
  auth,
  requireRole(['ca', 'financial_planner']),
  documentController.getPendingDocuments
);

// Assign document to professional
router.patch('/:documentId/assign',
  auth,
  requireRole(['admin', 'ca', 'financial_planner']),
  documentController.assignDocument
);

// Review document (professionals only)
router.patch('/:documentId/review',
  auth,
  requireRole(['ca', 'financial_planner']),
  documentController.reviewDocument
);

// Download document (authorized users only - owner, assigned professional, or admin)
router.get('/:documentId/download',
  auth,
  documentController.downloadDocument
);

// AI Analysis Routes
router.post('/:documentId/analyze', auth, documentAnalysisController.analyzeDocument);
router.get('/:documentId/insights', auth, documentAnalysisController.getDocumentInsights);
router.get('/submission/:submissionId/snapshot', auth, documentAnalysisController.getSubmissionSnapshot);

module.exports = router;