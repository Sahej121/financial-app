const { PDFParse } = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * OCR Service
 * Handles text extraction from documents (PDF, Images)
 */
exports.extractText = async (filePath, mimeType) => {
    logger.info('Starting OCR', { filePath, mimeType });

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
        logger.error('OCR Service Error', { error: error.message, filePath });
        throw error;
    }
};

async function extractTextFromPDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    let parser = null;
    try {
        parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        const text = result.text.trim();
        const numpages = result.total; // result.total is page count in v2

        // Improved scanned PDF detection
        // If there's very little text but many pages, it's likely scanned
        if (text.length < 50 && numpages > 0) {
            logger.warn('PDF seems to be scanned or image-only', { filePath, pages: numpages });

            return {
                text: text,
                isScanned: true,
                pageCount: numpages,
                confidence: 0.1,
                message: "This PDF appears to be a scanned document. Direct text extraction yielded limited results."
            };
        }

        return {
            text: text,
            isScanned: false,
            pageCount: numpages,
            confidence: text.length > 200 ? 0.95 : 0.8
        };
    } catch (error) {
        logger.error('PDF extraction error', { error: error.message, filePath });
        throw new Error('Failed to parse PDF content: ' + error.message);
    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
}

async function extractTextFromImage(filePath) {
    try {
        logger.info('Performing OCR on image', { filePath });
        const { data: { text, confidence } } = await Tesseract.recognize(filePath, 'eng', {
            logger: m => logger.debug('Tesseract Progress', m)
        });

        return {
            text: text,
            confidence: confidence / 100,
            isScanned: true
        };
    } catch (error) {
        logger.error('OCR extraction error', { error: error.message, filePath });
        throw new Error('Failed to perform OCR on image');
    }
}
