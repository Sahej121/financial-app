const documentAnalysisService = require('../services/documentAnalysisService');
const { Document, DocumentInsight } = require('../models');

/**
 * Controller for AI Document Analysis
 */
exports.analyzeDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { submissionId } = req.body;

        const document = await Document.findByPk(documentId);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Trigger async analysis (could be shifted to a worker queue if throughput is high)
        // For MVP, we'll wait for it or handle it in background depending on request type
        const insight = await documentAnalysisService.analyzeDocument(documentId, submissionId);

        res.json({
            success: true,
            insight,
            message: 'Analysis completed successfully'
        });
    } catch (error) {
        console.error('Analysis controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze document: ' + error.message
        });
    }
};

exports.getDocumentInsights = async (req, res) => {
    try {
        const { documentId } = req.params;

        const insight = await DocumentInsight.findOne({
            where: { documentId },
            include: [{ model: Document, as: 'document' }]
        });

        if (!insight) {
            return res.status(404).json({
                success: false,
                message: 'No insights found for this document'
            });
        }

        res.json({
            success: true,
            insight
        });
    } catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch document insights'
        });
    }
};

exports.getSubmissionSnapshot = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const insights = await DocumentInsight.findAll({
            where: { submissionId },
            include: [{ model: Document, as: 'document' }]
        });

        res.json({
            success: true,
            insights
        });
    } catch (error) {
        console.error('Get snapshot error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submission snapshot'
        });
    }
};
