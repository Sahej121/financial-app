const vectorStoreService = require('./vectorStoreService');
const ocrService = require('./ocrService');
const classificationService = require('./classificationService');
const extractionService = require('./extractionService');
const systemExtractionService = require('./systemExtractionService');
const templateExtractionService = require('./templateExtractionService');
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

            // 1. Update status to processing and link to submission if provided
            const updateData = { aiProcessingStatus: 'processing' };
            if (submissionId && !document.submissionId) {
                updateData.submissionId = submissionId;
            }
            await document.update(updateData);

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

            // 4. Extraction — Tiered Pipeline
            // Tier 1: Lightweight system extraction (regex + keywords)
            let analysis = await systemExtractionService.extractBasicData(text, documentType);

            // Tier 2: Template extraction (structured table parsing)
            if (!analysis.canSkipAI) {
                logger.info('Tier 1 insufficient, trying Tier 2 template extraction', { documentId });
                const templateResult = await templateExtractionService.extract(text, documentType, analysis);

                if (templateResult.canSkipAI) {
                    logger.info('Tier 2 template extraction sufficient — LLM skipped', {
                        documentId, confidence: templateResult.confidenceScore
                    });
                    analysis = templateResult;
                } else {
                    // Tier 3: AI extraction (PII-scrubbed LLM call)
                    logger.info('Tier 2 insufficient, falling to Tier 3 LLM extraction', { documentId });
                    // Merge Tier 1+2 data forward so LLM has context
                    analysis = await extractionService.extractFinancialData(text, documentType, submissionId);
                }
            } else {
                logger.info('Tier 1 system extraction sufficient — LLM skipped', { documentId });
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
                metadata: analysis._meta || {}, // Persist RAG and provider info
                processedAt: new Date()
            });

            // 7. Update document status
            await document.update({
                aiProcessingStatus: 'completed',
                aiProcessedAt: new Date(),
                category: documentType // Update category if classified differently
            });

            // 8. RAG Ingestion (Vector Embedding)
            if (text && text.length > 50) {
                try {
                    await vectorStoreService.ingestDocument(text, {
                        documentId: document.id,
                        submissionId,
                        fileName: document.fileName,
                        type: documentType
                    });
                    logger.info('RAG Ingestion successful', { documentId });
                } catch (ragError) {
                    logger.error('RAG Ingestion failed (non-blocking)', { error: ragError.message });
                }
            }

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
