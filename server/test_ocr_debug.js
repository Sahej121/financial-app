
const fs = require('fs');
const pdfParse = require('pdf-parse');

async function test() {
    console.log('Testing pdf-parse usage...');
    try {
        // Mock buffer
        const buffer = Buffer.from('test pdf content');

        // Test 1: Current Incorrect Usage
        try {
            console.log('Attempting Incorrect Usage: new pdfParse({...})');
            const { PDFParse } = require('pdf-parse');
            const parser = new PDFParse({ data: buffer });
            await parser.getText();
        } catch (e) {
            console.log('Caught expected error (Incorrect Usage):', e.message);
        }

        // Test 2: Correct Usage
        console.log('Attempting Correct Usage: pdf(buffer)');
        const data = await pdfParse(buffer);
        console.log('Correct usage result text:', data.text);

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

test();
