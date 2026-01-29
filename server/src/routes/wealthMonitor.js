const express = require('express');
const router = express.Router();
const wealthMonitorController = require('../controllers/wealthMonitorController');
const { auth } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/receipts');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});

// All routes require authentication
router.use(auth);

router.post('/upload', upload.single('receipt'), wealthMonitorController.uploadReceipt);
router.get('/entries', wealthMonitorController.getEntries);
router.delete('/:id', wealthMonitorController.deleteEntry);

module.exports = router;
