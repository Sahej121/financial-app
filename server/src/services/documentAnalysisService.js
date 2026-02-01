const ocrService = require('./ocrService');
const classificationService = require('./classificationService');
const extractionService = require('./extractionService');
const systemExtractionService = require('./systemExtractionService');
const validationService = require('./validationService');
const logger = require('../utils/logger');
const { Document, DocumentInsight, FinancialPlanningSubmission } = require('../models');
const path = require('path');

/**
 * Document Analysis Orchestrator
 * Coordinates the entire AI pipeline: OCR -> Classify -> Extract -> Validate
 */
class DocumentAnalysisService {

    async analyzeDocument(documentId, submissionId = null) {
        const document = await Document.findByPk(documentId);
        if (!document) throw new Error('Document not found');

        try {
            logger.info('Starting analysis pipeline', { documentId, submissionId });

            // 1. Update status to processing
            await document.update({ aiProcessingStatus: 'processing' });

            // 2. OCR / Text Extraction
            const filePath = path.join(__dirname, '../../', document.fileUrl.replace(/^\//, ''));
            const { text, confidence: ocrConfidence } = await ocrService.extractText(filePath, document.fileType);

            if (!text || text.trim().length === 0) {
                throw new Error('No text could be extracted from document');
            }

            // 3. Classification
            // For now we might trust the user provided category or refine it
            const classification = await classificationService.classifyDocument(text, document.fileName);
            const documentType = classification.type || document.category || 'other';

            // 4. Extraction
            // Try lightweight system extraction first
            let analysis = await systemExtractionService.extractBasicData(text, documentType);

            // If system extraction is not enough, fallback to AI
            if (!analysis.canSkipAI) {
                logger.info('System extraction insufficient, calling AI', { documentId });
                analysis = await extractionService.extractFinancialData(text, documentType);
            } else {
                logger.info('System extraction successful, skipping AI API', { documentId });
            }

            // 5. Validation
            const validation = await validationService.validateData(analysis.extractedData, documentType);

            // 6. Store Insights
            const insight = await DocumentInsight.create({
                documentId: document.id,
                submissionId: submissionId,
                insightType: this._mapCategoryToInsightType(documentType),
                extractedData: validation.normalizedData,
                highlights: analysis.highlights || {},
                summary: analysis.summary,
                redFlags: analysis.redFlags || validation.warnings,
                confidenceScore: (ocrConfidence + (analysis.confidenceScore || 0.8)) / 2,
                processedAt: new Date()
            });

            // 7. Update document status
            await document.update({
                aiProcessingStatus: 'completed',
                aiProcessedAt: new Date(),
                category: documentType // Update category if classified differently
            });

            return insight;

        } catch (error) {
            logger.error('Analysis failed', { documentId, error: error.message });
            await document.update({
                aiProcessingStatus: 'failed',
                aiError: error.message
            });
            throw error;
        }
    }

    _mapCategoryToInsightType(category) {
        const map = {
            'bank_statements': 'bank_statement',
            'financial_statements': 'income_proof',
            'tax_documents': 'itr',
            'other': 'other'
        };
        return map[category] || 'other';
    }
}

module.exports = new DocumentAnalysisService();
