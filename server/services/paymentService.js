const razorpay = require('../config/razorpayConfig');
const crypto = require('crypto');

class PaymentService {
  static async createOrder() {
    const options = {
      amount: 49900, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: "consultation_" + Date.now(),
      payment_capture: 1
    };

    try {
      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  static async verifyPayment(paymentDetails) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = paymentDetails;

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return true;
    } else {
      throw new Error('Invalid payment signature');
    }
  }
}

module.exports = PaymentService; 