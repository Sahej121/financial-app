const { Document } = require('../models');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

exports.uploadDocument = async (req, res) => {
  try {
    console.log('File upload request received:', req.file ? 'File present' : 'No file');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      // Save file locally instead of S3
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = path.join(uploadsDir, fileName);
      
      console.log('Saving file to:', filePath);
      
      // Create a write stream
      fs.writeFileSync(filePath, req.file.buffer);
      console.log('File saved successfully');
      
      // Create document record in database
      try {
        const document = await Document.create({
          fileName: req.file.originalname,
          fileUrl: `/uploads/${fileName}`, // Relative path in the server
          fileType: req.file.mimetype,
          userId: req.user ? req.user.id : 1 // Use user ID from auth or default for testing
        });
        console.log('Document record created:', document.id);
        
        res.json(document);
      } catch (dbError) {
        console.error('Database error:', dbError);
        res.status(500).json({ error: 'Database error: ' + dbError.message });
      }
    } catch (fileError) {
      console.error('File system error:', fileError);
      res.status(500).json({ error: 'File system error: ' + fileError.message });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'General error: ' + error.message });
  }
}; 