const { Correction, DocumentInsight } = require('../models');

/**
 * Correction Service - Human-in-the-loop (HITL) Controller
 * Manages analyst overrides of AI/Deterministic extractions.
 */
class CorrectionService {
    /**
     * Submit a correction for a specific field
     */
    async submitCorrection({ documentId, submissionId, fieldName, originalValue, correctedValue, reason, analystId }) {
        const correction = await Correction.create({
            documentId,
            submissionId,
            fieldName,
            originalValue,
            correctedValue,
            reason,
            analystId
        });

        // Optionally update the DocumentInsight immediately if it's a direct override of AI data
        if (documentId) {
            const insight = await DocumentInsight.findOne({ where: { documentId } });
            if (insight) {
                const updatedData = { ...insight.extractedData };
                // Handle nested logic if value/evidence structure is used
                if (updatedData[fieldName] && typeof updatedData[fieldName] === 'object' && 'value' in updatedData[fieldName]) {
                    updatedData[fieldName].value = correctedValue;
                    updatedData[fieldName].isCorrected = true;
                    updatedData[fieldName].correctionReason = reason;
                } else {
                    updatedData[fieldName] = correctedValue;
                }

                await insight.update({ extractedData: updatedData });
            }
        }

        return correction;
    }

    /**
     * Get all corrections for a submission
     */
    async getCorrectionsBySubmission(submissionId) {
        return await Correction.findAll({ where: { submissionId } });
    }

    /**
     * Apply corrections to an object (Priority Layer)
     */
    applyCorrections(baseData, corrections) {
        const result = { ...baseData };
        corrections.forEach(c => {
            result[c.fieldName] = c.correctedValue;
        });
        return result;
    }
}

module.exports = new CorrectionService();
