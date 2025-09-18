const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
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
  requireRole(['user']), 
  upload.single('file'), 
  documentController.uploadDocument
);

// Get user's own documents (clients)
router.get('/user', 
  auth, 
  requireRole(['user']), 
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

module.exports = router;