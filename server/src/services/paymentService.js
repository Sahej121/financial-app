const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (amount, currency = 'INR', receipt = 'receipt_order_1') => {
    try {
        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise for INR)
            currency,
            receipt,
        };
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay createOrder error:', error);
        throw error;
    }
};

exports.verifySignature = (orderId, paymentId, signature) => {
    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(orderId + "|" + paymentId)
        .digest('hex');

    return generated_signature === signature;
};
