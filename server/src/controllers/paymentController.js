const paymentService = require('../services/paymentService');

exports.createOrder = async (req, res) => {
    try {
        const { amount, currency, receipt } = req.body;
        const order = await paymentService.createOrder(amount, currency, receipt);
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const isValid = paymentService.verifySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (isValid) {
            // Here you would typically update the payment status in your database
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
