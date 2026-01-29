const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');

/**
 * OCR Service
 * Handles text extraction from documents (PDF, Images)
 */
exports.extractText = async (filePath, mimeType) => {
    console.log(`Starting OCR for ${filePath} (${mimeType})`);

    try {
        if (mimeType === 'application/pdf') {
            return await extractTextFromPDF(filePath);
        } else if (mimeType && mimeType.startsWith('image/')) {
            return await extractTextFromImage(filePath);
        } else {
            console.warn(`Unsupported or unknown mime type: ${mimeType}, returning mock data`);
            return {
                text: "MOCK TEXT - Unsupported file type",
                confidence: 0.5
            };
        }
    } catch (error) {
        console.error('OCR Service Error:', error);
        throw error;
    }
};

async function extractTextFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const result = await pdf(dataBuffer);

        // If result returns very little text, it might be a scanned PDF
        if (result.text.trim().length < 50) {
            console.log('PDF seems to be scanned, falling back to OCR (not fully implemented)');
            // In a real implementation: convert PDF to images -> Tesseract
            return {
                text: "[SCANNED PDF DETECTED] - Text extraction requires OCR pipeline.",
                confidence: 0.2
            };
        }

        return {
            text: result.text,
            confidence: 0.95 // Direct extraction usually high confidence
        };
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to parse PDF content');
    }
}

async function extractTextFromImage(filePath) {
    try {
        const { data: { text, confidence } } = await Tesseract.recognize(filePath, 'eng');
        return {
            text: text,
            confidence: confidence / 100
        };
    } catch (error) {
        console.error('OCR extraction error:', error);
        throw new Error('Failed to perform OCR on image');
    }
}
