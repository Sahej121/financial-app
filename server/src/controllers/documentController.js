const { Document, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload document (clients)
exports.uploadDocument = async (req, res) => {
  try {
    console.log('File upload request received:', req.file ? 'File present' : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    const { category, clientNotes, priority } = req.body;

    // Save file locally - sanitize filename for security
    const sanitizedOriginalName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${sanitizedOriginalName}`;
    const filePath = path.join(uploadsDir, fileName);
    
    console.log('Saving file to:', filePath);
    
    fs.writeFileSync(filePath, req.file.buffer);
    console.log('File saved successfully');
    
    // Create document record in database
    const document = await Document.create({
      fileName: req.file.originalname,
      fileUrl: `/uploads/${fileName}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      userId: req.user.id,
      category: category || 'other',
      clientNotes: clientNotes || null,
      priority: priority || 'medium',
      status: 'submitted',
      uploadedAt: new Date()
    });
    
    console.log('Document record created:', document.id);
    
    res.status(201).json({
      success: true,
      document,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload document: ' + error.message 
    });
  }
};

// Get user's own documents (clients)
exports.getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, category } = req.query;
    
    const whereClause = { userId };
    
    if (status) {
      whereClause.status = status;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    const documents = await Document.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignedProfessional',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['uploadedAt', 'DESC']]
    });
    
    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
};

// Get documents pending review for professionals
exports.getPendingDocuments = async (req, res) => {
  try {
    const professionalId = req.user.id;
    const { role, status, category } = req.query;
    
    let whereClause = {};
    
    // Filter by assigned professional or unassigned documents for the role
    if (role && ['ca', 'financial_planner'].includes(role)) {
      whereClause = {
        [Op.or]: [
          { assignedToId: professionalId, assignedRole: role },
          { assignedToId: null, status: 'submitted' }
        ]
      };
    } else {
      whereClause = {
        [Op.or]: [
          { assignedToId: professionalId },
          { assignedToId: null, status: 'submitted' }
        ]
      };
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    const documents = await Document.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [
        ['priority', 'DESC'],
        ['uploadedAt', 'ASC']
      ]
    });
    
    res.json({
      success: true,
      documents
    });
  } catch (error) {
    console.error('Get pending documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending documents'
    });
  }
};

// Assign document to professional (admin or self-assignment)
exports.assignDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { professionalId, professionalRole } = req.body;
    
    if (!professionalId || !professionalRole) {
      return res.status(400).json({
        success: false,
        message: 'Professional ID and role are required'
      });
    }
    
    if (!['ca', 'financial_planner'].includes(professionalRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid professional role'
      });
    }
    
    // Verify professional exists and has correct role
    const professional = await User.findByPk(professionalId);
    if (!professional || professional.role !== professionalRole) {
      return res.status(400).json({
        success: false,
        message: 'Invalid professional assignment'
      });
    }
    
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Update assignment
    await document.update({
      assignedToId: professionalId,
      assignedRole: professionalRole,
      assignedAt: new Date(),
      status: 'assigned'
    });
    
    const updatedDocument = await Document.findByPk(documentId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignedProfessional',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
    
    res.json({
      success: true,
      document: updatedDocument,
      message: 'Document assigned successfully'
    });
  } catch (error) {
    console.error('Assign document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign document'
    });
  }
};

// Review document (professionals only)
exports.reviewDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { status, reviewNotes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Review status is required'
      });
    }
    
    const validStatuses = ['in_review', 'reviewed', 'approved', 'rejected', 'requires_changes'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review status'
      });
    }
    
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check if user is assigned to this document
    if (document.assignedToId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to review this document'
      });
    }
    
    // Update review
    const updateData = {
      status,
      reviewNotes: reviewNotes || null
    };
    
    if (['reviewed', 'approved', 'rejected'].includes(status)) {
      updateData.reviewedAt = new Date();
    }
    
    await document.update(updateData);
    
    const updatedDocument = await Document.findByPk(documentId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'assignedProfessional',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });
    
    res.json({
      success: true,
      document: updatedDocument,
      message: 'Document review updated successfully'
    });
  } catch (error) {
    console.error('Review document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update document review'
    });
  }
};

// Download document (authorized users only)
exports.downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check permissions - owner, assigned professional, or admin
    const isOwner = document.userId === req.user.id;
    const isAssigned = document.assignedToId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAssigned && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Get file path - strip leading slash to avoid absolute path issues
    const relativePath = document.fileUrl.replace(/^\//, '');
    const filePath = path.join(__dirname, '../..', relativePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Set proper headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
    res.setHeader('Content-Type', document.fileType || 'application/octet-stream');
    
    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
};