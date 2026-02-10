const vectorStoreService = require('../services/vectorStoreService');
const aiProvider = require('../utils/aiProvider');
const logger = require('../utils/logger');
const { DocumentInsight } = require('../models');

/**
 * RAG Controller — Evidence-Traced Document Q&A
 * 
 * Routes queries through a 3-tier system:
 *   1. Structured Lookup — factual questions answered directly from DocumentInsight (no LLM)
 *   2. Direct Snippet — very high similarity (>0.85) chunks returned without LLM
 *   3. LLM Synthesis — moderate similarity chunks synthesized with citation enforcement
 */

// Structured query patterns that can be answered directly from DocumentInsight
const STRUCTURED_PATTERNS = [
    { regex: /(?:total|sum\s+of)\s+(?:income|credits?|inflow)/i, field: 'totalCredits', label: 'Total Credits' },
    { regex: /(?:total|sum\s+of)\s+(?:expenses?|debits?|outflow)/i, field: 'totalDebits', label: 'Total Debits' },
    { regex: /(?:average|avg|monthly)\s+balance/i, field: 'avgMonthlyBalance', label: 'Average Monthly Balance' },
    { regex: /(?:institution|bank)\s*(?:name)?/i, field: 'institution', label: 'Institution' },
    { regex: /(?:account\s*holder|name\s+on\s+account)/i, field: 'accountHolder', label: 'Account Holder' },
    { regex: /(?:document|doc)\s*(?:type|category)/i, field: 'documentType', label: 'Document Type' },
    { regex: /(?:period|date\s+range|statement\s+period)/i, field: 'period', label: 'Statement Period' },
    { regex: /(?:pan|pan\s*(?:number|card))/i, field: 'ids.pan', label: 'PAN Number' },
    { regex: /(?:gstin|gst\s*(?:number|id))/i, field: 'ids.gstin', label: 'GSTIN' },
];

const SIMILARITY_FLOOR = 0.70;         // Discard chunks below this
const DIRECT_SNIPPET_THRESHOLD = 0.85; // Skip LLM if similarity is this high

/**
 * Resolve a dot-path field from an object (e.g., 'ids.pan' from extractedData)
 */
function resolveField(obj, fieldPath) {
    return fieldPath.split('.').reduce((current, key) => {
        if (current && typeof current === 'object') {
            const val = current[key];
            // Handle evidence-traced values: { value: X, evidence_snippet: Y }
            if (val && typeof val === 'object' && 'value' in val) return val.value;
            return val;
        }
        return null;
    }, obj);
}

exports.queryDocuments = async (req, res) => {
    try {
        const { submissionId, query } = req.body;

        if (!submissionId || !query) {
            return res.status(400).json({ success: false, message: 'Missing submissionId or query' });
        }

        // ──────────────────────────────────────────────
        // ROUTE 1: Structured Lookup (No LLM, No Embedding)
        // ──────────────────────────────────────────────
        for (const pattern of STRUCTURED_PATTERNS) {
            if (pattern.regex.test(query)) {
                const insights = await DocumentInsight.findAll({ where: { submissionId } });
                for (const insight of insights) {
                    const data = insight.extractedData;
                    if (!data) continue;

                    const value = resolveField(data, pattern.field);
                    if (value !== null && value !== undefined && value !== 0 && value !== '') {
                        logger.info('[RAG] Structured lookup hit', { field: pattern.field, submissionId });
                        return res.json({
                            success: true,
                            answer: `**${pattern.label}:** ${typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : value}`,
                            citations: [{
                                source: insight.insightType || 'DocumentInsight',
                                documentId: insight.documentId,
                                method: 'direct_lookup',
                                field: pattern.field
                            }],
                            trace: { route: 'structured_lookup', llm_used: false, cost: 0 }
                        });
                    }
                }
                // Pattern matched but no data found — fall through to vector search
                break;
            }
        }

        // ──────────────────────────────────────────────
        // ROUTE 2 & 3: Vector Search → Direct Snippet or LLM
        // ──────────────────────────────────────────────
        const chunks = await vectorStoreService.search(query, submissionId);

        // Apply similarity floor — discard irrelevant chunks
        const relevantChunks = (chunks || []).filter(c => parseFloat(c.similarity) >= SIMILARITY_FLOOR);

        if (relevantChunks.length === 0) {
            // Check if any DocumentInsight exists at all for a helpful message
            const insightCount = await DocumentInsight.count({ where: { submissionId } });
            const suggestion = insightCount === 0
                ? 'No documents have been analyzed for this submission yet. Please upload and analyze documents first.'
                : 'The uploaded documents don\'t seem to contain information relevant to this specific question. Try rephrasing or uploading additional documents.';

            return res.json({
                success: true,
                answer: suggestion,
                citations: [],
                trace: { route: 'vector_search', llm_used: false, cost: 0, chunks_found: 0 }
            });
        }

        // Build citations from retrieved chunks
        const citations = relevantChunks.map(c => ({
            source: c.metadata?.fileName || 'Unknown Document',
            documentId: c.documentId,
            chunkIndex: c.chunkIndex,
            similarity: parseFloat(parseFloat(c.similarity).toFixed(3)),
            snippet: c.content.substring(0, 200) + (c.content.length > 200 ? '...' : ''),
            method: 'vector_retrieval'
        }));

        // ROUTE 2: Direct Snippet — if top chunk is extremely relevant, return it directly
        const topSimilarity = parseFloat(relevantChunks[0].similarity);
        if (topSimilarity >= DIRECT_SNIPPET_THRESHOLD) {
            logger.info('[RAG] Direct snippet answer', { similarity: topSimilarity, submissionId });
            return res.json({
                success: true,
                answer: relevantChunks[0].content,
                citations,
                trace: { route: 'direct_snippet', llm_used: false, cost: 0, top_similarity: topSimilarity }
            });
        }

        // ──────────────────────────────────────────────
        // ROUTE 3: LLM Synthesis with Citation Enforcement
        // ──────────────────────────────────────────────
        const context = relevantChunks.map((c, i) =>
            `[Source ${i + 1}: ${c.metadata?.fileName || 'Document'}]\n${c.content}`
        ).join('\n\n');

        const jsonPrompt = `You are a helpful Financial Analyst Assistant. 
Answer the user's question using ONLY the provided context. 
If the answer is not in the context, say you don't know.

CONTEXT:
${context}

QUESTION:
${query}

Return a valid JSON object:
{
  "answer": "your detailed answer here",
  "citations": ["list of Source numbers used, e.g. 'Source 1', 'Source 2'"],
  "confidence": 0.0 to 1.0
}

RULES:
- Every factual claim MUST reference a Source number.
- If unsure, say "Based on available documents, I cannot confirm this."
- All monetary values in Indian Rupees (₹).`;

        const response = await aiProvider.generateJSON(jsonPrompt);

        const finalAnswer = response || {
            answer: "I couldn't generate an AI-powered answer at this time. Here are the most relevant document excerpts:",
            citations: citations.map(c => c.source),
            confidence: 0
        };

        res.json({
            success: true,
            answer: finalAnswer.answer,
            confidence: finalAnswer.confidence,
            citations,
            trace: { route: 'llm_synthesis', llm_used: true, top_similarity: topSimilarity }
        });

    } catch (error) {
        logger.error('RAG Query failed', { error: error.message });
        res.status(500).json({ success: false, message: 'Failed to process query' });
    }
};
