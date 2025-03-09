const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class ReceiptService {
  static async generateReceipt(paymentData, consultationData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const receiptNumber = `RCP${Date.now()}`;
        const fileName = `receipt_${receiptNumber}.pdf`;
        const filePath = path.join(__dirname, '../uploads/receipts', fileName);

        // Ensure directory exists
        if (!fs.existsSync(path.join(__dirname, '../uploads/receipts'))) {
          fs.mkdirSync(path.join(__dirname, '../uploads/receipts'), { recursive: true });
        }

        // Pipe PDF to file
        doc.pipe(fs.createWriteStream(filePath));

        // Add company logo
        doc.image(path.join(__dirname, '../public/images/logo.png'), 50, 45, { width: 150 });

        // Add receipt header
        doc.fontSize(20)
           .text('Payment Receipt', 50, 150);

        // Add receipt details
        doc.fontSize(10)
           .text('Receipt Number:', 50, 200)
           .text(receiptNumber, 200, 200)
           .text('Date:', 50, 220)
           .text(moment().format('DD/MM/YYYY'), 200, 220)
           .text('Payment ID:', 50, 240)
           .text(paymentData.razorpay_payment_id, 200, 240);

        // Add customer details
        doc.fontSize(14)
           .text('Customer Details', 50, 280);

        doc.fontSize(10)
           .text('Name:', 50, 300)
           .text(consultationData.name, 200, 300)
           .text('Email:', 50, 320)
           .text(consultationData.email, 200, 320)
           .text('Phone:', 50, 340)
           .text(consultationData.phone, 200, 340);

        // Add consultation details
        doc.fontSize(14)
           .text('Consultation Details', 50, 380);

        doc.fontSize(10)
           .text('Service:', 50, 400)
           .text('Financial Consultation', 200, 400)
           .text('Scheduled Date:', 50, 420)
           .text(moment(consultationData.consultationSlot.date).format('DD/MM/YYYY'), 200, 420)
           .text('Time Slot:', 50, 440)
           .text(consultationData.consultationSlot.time, 200, 440);

        // Add payment details
        doc.fontSize(14)
           .text('Payment Details', 50, 480);

        // Add line items
        doc.fontSize(10)
           .text('Description', 50, 500)
           .text('Amount', 400, 500)
           .text('Financial Consultation Fee', 50, 520)
           .text('₹499.00', 400, 520);

        // Add total
        doc.moveTo(50, 550)
           .lineTo(550, 550)
           .stroke();

        doc.fontSize(12)
           .text('Total Amount:', 300, 570)
           .text('₹499.00', 400, 570);

        // Add footer
        doc.fontSize(10)
           .text('Thank you for choosing Credit Leliya!', 50, 650)
           .text('For any queries, please contact support@creditleliya.com', 50, 670);

        // Add terms and conditions
        doc.fontSize(8)
           .text('This is a computer generated receipt and does not require a signature.', 50, 750);

        // Finalize PDF
        doc.end();

        // Return file details
        resolve({
          fileName,
          filePath,
          receiptNumber
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = ReceiptService; 