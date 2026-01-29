const ocrService = require('./ocrService');
const extractionService = require('./extractionService');
const { WealthMonitor } = require('../models');

class WealthMonitorService {
    async processReceipt(filePath, mimeType, userId) {
        try {
            // 1. OCR
            console.log(`[WealthMonitor] Starting OCR for user ${userId}`);
            const ocrResult = await ocrService.extractText(filePath, mimeType);
            const text = ocrResult.text;

            if (!text || text.trim().length < 5) {
                throw new Error('Could not extract sufficient text from receipt');
            }

            // 2. AI Analysis
            console.log(`[WealthMonitor] Running AI analysis...`);
            const analysis = await extractionService.extractFinancialData(text, 'wealth_monitor');

            // 3. Save to Database
            const entry = await WealthMonitor.create({
                userId,
                merchantName: analysis.extractedData?.merchantName || 'Unknown Merchant',
                amount: analysis.extractedData?.amount || 0,
                category: analysis.extractedData?.category || 'Other',
                isAvoidable: analysis.extractedData?.isAvoidable || false,
                aiAdvice: analysis.summary || 'No advice available.',
                rawOcrText: text,
                itrRelevance: analysis.extractedData?.itrRelevance || 'None',
                imageUrl: filePath.split('uploads/')[1] ? `/uploads/${filePath.split('uploads/')[1]}` : null
            });

            return entry;
        } catch (error) {
            console.error('[WealthMonitor Service] Error:', error);
            throw error;
        }
    }

    async getUserEntries(userId) {
        return await WealthMonitor.findAll({
            where: { userId },
            order: [['date', 'DESC']]
        });
    }

    async getStats(userId) {
        const entries = await this.getUserEntries(userId);

        const totalSpent = entries.reduce((sum, e) => sum + e.amount, 0);
        const avoidableSpent = entries.filter(e => e.isAvoidable).reduce((sum, e) => sum + e.amount, 0);

        const categories = {};
        entries.forEach(e => {
            categories[e.category] = (categories[e.category] || 0) + e.amount;
        });

        return {
            totalSpent,
            avoidableSpent,
            avoidablePercentage: totalSpent > 0 ? (avoidableSpent / totalSpent) * 100 : 0,
            categories
        };
    }
}

module.exports = new WealthMonitorService();
