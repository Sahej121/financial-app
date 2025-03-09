const Consultation = require('../models/Consultation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const EmailService = require('../services/emailService');
const schedule = require('node-schedule');
const Payment = require('../models/Payment');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow only pdf, doc, docx, xls, xlsx files
    const allowedFileTypes = /pdf|doc|docx|xls|xlsx/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only PDF, DOC, DOCX, XLS, XLSX files are allowed!');
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
}).array('documents', 5); // Allow up to 5 files

exports.createConsultation = async (req, res) => {
  try {
    // Verify payment first
    const payment = await Payment.findOne({ 
      paymentId: req.body.paymentId,
      status: 'completed'
    });

    if (!payment) {
      return res.status(400).json({
        success: false,
        message: 'Payment not found or incomplete'
      });
    }

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message || 'Error uploading files' 
        });
      }

      // Process uploaded files
      const documents = req.files.map(file => ({
        filename: file.originalname,
        path: file.path
      }));

      // Parse consultation slot data
      const consultationSlot = JSON.parse(req.body.consultationSlot);

      // Create new consultation
      const consultation = new Consultation({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        planningType: req.body.planningType,
        documents: documents,
        consultationSlot: {
          date: consultationSlot.date,
          time: consultationSlot.time,
          analyst: consultationSlot.analyst
        }
      });

      await consultation.save();

      // Send confirmation emails
      try {
        await EmailService.sendConsultationConfirmation(consultation);
        await EmailService.sendAnalystNotification(consultation);
      } catch (emailError) {
        console.error('Error sending confirmation emails:', emailError);
        // Don't fail the request if email sending fails
      }

      // Schedule reminder email for 24 hours before consultation
      const reminderDate = new Date(consultation.consultationSlot.date);
      reminderDate.setHours(reminderDate.getHours() - 24);
      
      schedule.scheduleJob(reminderDate, async () => {
        try {
          await EmailService.sendConsultationReminder(consultation);
        } catch (reminderError) {
          console.error('Error sending reminder email:', reminderError);
        }
      });

      res.status(201).json({
        success: true,
        message: 'Consultation scheduled successfully',
        data: consultation
      });
    });
  } catch (error) {
    console.error('Consultation creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error scheduling consultation',
      error: error.message
    });
  }
};

exports.getAnalystSchedule = async (req, res) => {
  try {
    // Get the next 7 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    // Find all booked slots
    const bookedSlots = await Consultation.find({
      'consultationSlot.date': {
        $gte: startDate,
        $lte: endDate
      }
    }).select('consultationSlot');

    // Generate available slots (9 AM to 5 PM, 1-hour slots)
    const availableSlots = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      for (let hour = 9; hour < 17; hour++) {
        const slotTime = `${hour}:00`;
        const isBooked = bookedSlots.some(slot => 
          slot.consultationSlot.date.toDateString() === currentDate.toDateString() &&
          slot.consultationSlot.time === slotTime
        );

        if (!isBooked) {
          availableSlots.push({
            date: new Date(currentDate),
            time: slotTime,
            analyst: 'Available' // You can modify this based on your analyst assignment logic
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error fetching analyst schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analyst schedule',
      error: error.message
    });
  }
};

// Helper function to send email notification
async function sendConsultationEmail(consultation) {
  // TODO: Implement email sending functionality
  // You can use nodemailer or any other email service
  console.log('Sending email notification for consultation:', consultation._id);
} 