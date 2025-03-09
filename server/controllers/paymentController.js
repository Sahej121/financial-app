const Razorpay = require('razorpay');
const crypto = require('crypto');
const PaymentService = require('../services/paymentService');
const Payment = require('../models/Payment');
const ReceiptService = require('../services/receiptService');
const path = require('path');
const fs = require('fs');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
  try {
    const options = {
      amount: 49900, // amount in paise (499 INR)
      currency: "INR",
      receipt: "order_" + Date.now(),
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Generate receipt
      const receiptDetails = await ReceiptService.generateReceipt(
        req.body,
        req.body.consultationData
      );

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        receipt: {
          number: receiptDetails.receiptNumber,
          url: `/receipts/${receiptDetails.fileName}`
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

// Add new endpoint to download receipt
exports.downloadReceipt = async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, '../uploads/receipts', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Error downloading receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download receipt'
    });
  }
}; 