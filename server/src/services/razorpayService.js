const Razorpay = require('razorpay');
const crypto = require('crypto');
const winston = require('winston');

// Initialize Razorpay
// Note: We use process.env variables. If not set, it might throw or allow dev mode.
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

/**
 * Create a Razorpay Order
 * @param {number} amount - Amount in smallest currency unit (e.g., paise for INR)
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Unique receipt ID
 * @returns {Promise<Object>} - The created order
 */
const createOrder = async (amount, currency = 'INR', receipt) => {
    // Check if we are using placeholder keys
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const isMock = keyId.includes('placeholder') || secret.includes('placeholder');

    winston.info(`Razorpay Create Order: isMock=${isMock}, keyId=${keyId.substring(0, 8)}...`);

    if (isMock) {
        winston.info('RAZORPAY MOCK MODE ENABLED: Generating mock order');
        return {
            id: `order_mock_${Math.random().toString(36).substring(7)}`,
            entity: 'order',
            amount: amount,
            amount_paid: 0,
            amount_due: amount,
            currency: currency,
            receipt: receipt,
            status: 'created',
            attempts: 0,
            notes: [],
            created_at: Math.floor(Date.now() / 1000),
            isMock: true // Explicit flag for frontend
        };
    }

    try {
        const options = {
            amount, // amount in the smallest currency unit
            currency,
            receipt,
        };
        const order = await razorpay.orders.create(options);
        winston.info(`Razorpay Order Created: ${order.id}`);
        return order;
    } catch (error) {
        winston.error('Error creating Razorpay order:', error);
        throw error;
    }
};

/**
 * Verify Razorpay Signature
 * @param {string} orderId - The order ID from Razorpay
 * @param {string} paymentId - The payment ID from Razorpay
 * @param {string} signature - The signature to verify
 * @returns {boolean} - True if valid, false otherwise
 */
const verifySignature = (orderId, paymentId, signature) => {
    // Support mock validation
    if (orderId && orderId.startsWith('order_mock_')) {
        winston.info(`RAZORPAY MOCK MODE: Validating mock signature for ${orderId}`);
        return true;
    }

    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
        .update(body.toString())
        .digest('hex');

    const isValid = expectedSignature === signature;
    if (!isValid) {
        winston.warn(`Invalid Signature for Order: ${orderId}, Payment: ${paymentId}`);
    }
    return isValid;
};

module.exports = {
    createOrder,
    verifySignature,
    instance: razorpay
};
