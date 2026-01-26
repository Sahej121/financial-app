const express = require('express');
const router = express.Router();
const { ActivityLog, User } = require('../models');
const auth = require('../middleware/auth');

// Get activity logs for a user (or professional's client base)
router.get('/', auth, async (req, res) => {
    try {
        const { meetingId, limit = 10 } = req.query;
        const where = {};

        // Professionals can see logs for specific meetings
        if (meetingId) {
            where.meetingId = meetingId;
        } else {
            // Regular users only see their own
            where.userId = req.user.id;
        }

        const logs = await ActivityLog.findAll({
            where,
            include: [{ model: User, as: 'user', attributes: ['name', 'role'] }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch activity logs' });
    }
});

module.exports = router;
