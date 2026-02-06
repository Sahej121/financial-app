const { Transaction, Meeting, User, FinancialPlanningSubmission } = require('../models');
const razorpayService = require('../services/razorpayService');
const zoomService = require('../services/zoomService');
const winston = require('winston');
const moment = require('moment');

exports.createOrder = async (req, res) => {
    try {
        const { amount, currency, purpose, referenceId } = req.body;
        const userId = req.user.id;

        if (!amount || !purpose) {
            return res.status(400).json({ error: 'Amount and Purpose are required' });
        }

        // 1. Create Razorpay Order
        // Amount is expected in paise from frontend, or we multiply here?
        // Let's assume frontend sends INR, we multiply by 100.
        const amountInPaise = Math.round(amount * 100);
        const receiptId = `rcpt_${userId}_${Date.now()}`;

        const order = await razorpayService.createOrder(amountInPaise, currency || 'INR', receiptId);

        winston.info(`Order created successfully: ${order.id}, isMock: ${order.isMock || false}`);

        // 2. Create Transaction Record
        const transaction = await Transaction.create({
            userId,
            orderId: order.id,
            amount: amountInPaise,
            currency: order.currency,
            status: 'created',
            purpose,
            referenceId: referenceId || null,
        });

        res.json({
            success: true,
            order,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        winston.error('Create Order Error:', error);
        res.status(500).json({ error: error.message || 'Failed to create payment order' });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, metadata } = req.body;

        // 1. Verify Signature
        const isValid = razorpayService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!isValid) {
            // Mark transaction as failed?
            await Transaction.update({ status: 'failed' }, { where: { orderId: razorpay_order_id } });
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // 2. Update Transaction Status
        const transaction = await Transaction.findOne({ where: { orderId: razorpay_order_id } });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        transaction.status = 'paid';
        transaction.paymentId = razorpay_payment_id;
        await transaction.save();

        // 3. Handle Purpose-Specific Logic
        let result = {};

        if (transaction.purpose === 'consultation_booking') {
            // MetaData should contain meeting details
            if (metadata && metadata.meetingDetails) {
                const details = metadata.meetingDetails;

                // Setup dates
                const startTime = details.startsAt;
                const duration = moment(details.endsAt).diff(moment(details.startsAt), 'minutes');

                // Generate Zoom Link
                let zoomData = {};
                try {
                    zoomData = await zoomService.createMeeting(
                        details.title || 'Financial Consultation',
                        startTime,
                        duration,
                        details.clientNotes || ''
                    );
                } catch (zoomErr) {
                    winston.error('Zoom creation failed during payment verify:', zoomErr);
                    // Proceed but without zoom link
                }

                // Create Meeting
                const meeting = await Meeting.create({
                    clientId: req.user.id,
                    professionalId: details.professionalId,
                    professionalRole: details.professionalRole,
                    title: details.title,
                    planningType: details.planningType || 'financial_planning',
                    startsAt: details.startsAt,
                    endsAt: details.endsAt,
                    clientNotes: details.clientNotes,
                    status: 'confirmed',
                    zoomMeetingId: zoomData?.id?.toString(),
                    zoomJoinUrl: zoomData?.joinUrl,
                    zoomStartUrl: zoomData?.startUrl,
                    zoomPassword: zoomData?.password,
                    transactionId: transaction.id,
                    // Map other intake fields if passed in metadata...
                    // For brevity, assuming basic creating here, or we fetch from a pending Submission?
                    // Ideally, we persist the full payload in Transaction metadata or pass it again.
                    // Let's assume metadata passes the critical distinct fields.
                    ...details.intakeFields // Spread the rest of the form data
                });

                transaction.referenceId = meeting.id;
                await transaction.save();
                result = { meetingId: meeting.id, message: 'Consultation booked successfully' };
            }
        } else if (transaction.purpose === 'financial_planning_insights') {
            // Unlock insights
            if (transaction.referenceId) {
                await FinancialPlanningSubmission.update({
                    isPaid: true,
                    transactionId: transaction.id
                }, {
                    where: { id: transaction.referenceId }
                });
                result = { message: 'Insights unlocked' };
            }
        }

        res.json({
            success: true,
            transactionId: transaction.id,
            ...result
        });

    } catch (error) {
        winston.error('Verify Payment Error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};
