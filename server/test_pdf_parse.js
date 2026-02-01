try {
    const pdf = require('pdf-parse');
    console.log('Type of pdf-parse export:', typeof pdf);
    console.log('Is it a function?', typeof pdf === 'function');
    console.log('Does it have PDFParse property?', pdf.PDFParse);
} catch (e) {
    console.error('Error requiring pdf-parse:', e);
}
