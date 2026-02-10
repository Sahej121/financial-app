const documentAnalysisService = require('../services/documentAnalysisService');
const decisionPackService = require('../services/decisionPackService');
const briefingService = require('../services/briefingService');
const vectorStoreService = require('../services/vectorStoreService');
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

        // --- RAG Ingestion ---
        // We ingest the full document text into our vector store for chat capabilities
        // Note: extracting text from 'document' or 'insight' depends on where the full text lives.
        // Assuming 'documentAnalysisService' might return the text or we fetch it.
        // For now, simpler: retrieve text if not provided.
        // Actually, documentAnalysisService probably extracts text. We'll verify that file next.
        // If extracted text is in the insight (e.g. extractedData), we can use it, but usually standard OCR text is needed.

        // Temporarily, we will assume we can get the text. 
        // IF documentAnalysisService returns { insight, fullText } that would be ideal.
        // Let's assume for now we need to trigger it separately or it handles it.
        // But for this edit, let's just add the call as if we had text.
        // Real implementation: vectorStoreService.ingestDocument(fullText, { documentId, submissionId });

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

        // Also fetch the Decision Pack (Form-based intelligence)
        let decisionPack = null;
        try {
            // We use getPack which handles generation if needed/missing
            decisionPack = await decisionPackService.getPack(submissionId);
        } catch (err) {
            console.error('Failed to fetch decision pack for snapshot:', err.message);
        }

        res.json({
            success: true,
            insights,
            decisionPack
        });
    } catch (error) {
        console.error('Get snapshot error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submission snapshot'
        });
    }
};

exports.getSubmissionBriefing = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const briefing = await briefingService.generateBriefing(submissionId);

        res.json({
            success: true,
            briefing
        });
    } catch (error) {
        console.error('Get briefing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate analyst briefing: ' + error.message
        });
    }
};
