const vectorStoreService = require('../src/services/vectorStoreService');
require('dotenv').config();

async function testRetrieval() {
    console.log('--- RAG Retrieval Verification ---');

    const queries = [
        "What are the deductions under 80C?",
        "How is HRA exemption calculated?",
        "Can I claim health insurance deduction for my parents?"
    ];

    try {
        for (const query of queries) {
            console.log(`\nQuery: "${query}"`);
            // Search globally (submissionId = null, includeGlobal = true)
            const results = await vectorStoreService.search(query, null, 2, true);

            console.log(`Results found: ${results.length}`);
            results.forEach((r, i) => {
                console.log(`[Result ${i + 1}] Similarity: ${r.similarity.toFixed(4)}`);
                console.log(`Content: ${r.content.substring(0, 100)}...`);
            });

            if (results.length === 0) {
                console.error('FAIL: No results retrieved.');
            } else if (results[0].similarity < 0.5) {
                console.warn('WARN: Low similarity score.');
            } else {
                console.log('PASS: Relevant content retrieved.');
            }
        }
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

testRetrieval();
