const wealthMonitorService = require('../services/wealthMonitorService');
const path = require('path');
const fs = require('fs');

exports.uploadReceipt = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No receipt file provided' });
        }

        const userId = req.user.id;
        const filePath = req.file.path;
        const mimeType = req.file.mimetype;

        const entry = await wealthMonitorService.processReceipt(filePath, mimeType, userId);

        res.json({
            success: true,
            message: 'Receipt processed successfully',
            entry
        });
    } catch (error) {
        console.error('Receipt upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getEntries = async (req, res) => {
    try {
        const userId = req.user.id;
        const entries = await wealthMonitorService.getUserEntries(userId);
        const stats = await wealthMonitorService.getStats(userId);

        res.json({
            success: true,
            entries,
            stats
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const { WealthMonitor } = require('../models');
        const entry = await WealthMonitor.findOne({ where: { id, userId } });

        if (!entry) {
            return res.status(404).json({ success: false, message: 'Entry not found' });
        }

        await entry.destroy();
        res.json({ success: true, message: 'Entry deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
