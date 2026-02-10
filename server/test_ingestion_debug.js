
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const ocrService = require('./src/services/ocrService');
const vectorStoreService = require('./src/services/vectorStoreService');
const { Document, DocumentChunk, sequelize } = require('./src/models');
const fs = require('fs');

async function testIngestion() {
    console.log('--- STARTING INGESTION DEBUG ---');

    // 1. Mock Document
    const mockFilePath = path.join(__dirname, 'test_ocr_debug.js'); // reusing existing file for "upload"
    // Ideally we use a PDF, let's try to find one or just use this JS file as dummy
    // But OCR expects PDF or Image. Let's create a dummy PDF or just skip OCR if file not valid
    // For now, let's mock the OCR result directly to test downstream components if OCR is effectively "fixed"
    // OR we can try to actually run OCR on a dummy text file renamed to .txt (OCR supports pdf/image only)

    // Let's create a dummy PDF-like object flow
    const mockDocId = 99999;

    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // 2. Test Vector Store Chunking Logic directly
        console.log('Testing VectorStoreService.ingestDocument...');
        const text = "This is a test document content. It should be chunked and embedded. ".repeat(50);

        // Mock the document lookup inside the service? No, the service takes ID.
        // We need to create a dummy document in DB first.
        /*
        const doc = await Document.create({
            id: mockDocId,
            fileName: 'debug_test.pdf',
            fileUrl: '/uploads/debug_test.pdf',
            fileType: 'application/pdf',
            fileSize: 100,
            userId: 1, // assuming user 1 exists
            status: 'submitted',
            uploadedAt: new Date()
        });
        console.log('Mock Document Created:', doc.id);
        */

        // actually vectorStoreService.ingestDocument takes (documentId, text)
        // checking signature...
        // Signature: async ingestDocument(documentId, text, metadata = {})

        // Correct signature: async ingestDocument(text, metadata)
        try {
            await vectorStoreService.ingestDocument(text, {
                documentId: mockDocId,
                submissionId: 1,
                originalName: 'debug_test.pdf',
                mimeType: 'application/pdf'
            });
            console.log('Ingestion finished successfully!');
        } catch (e) {
            console.error('Ingestion FAILED:', e);
            console.error(e.stack);
        }

        // Cleanup
        // await Document.destroy({ where: { id: mockDocId } });

    } catch (e) {
        console.error('Setup failed:', e);
    } finally {
        await sequelize.close();
    }
}

testIngestion();
