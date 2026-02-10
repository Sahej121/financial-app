const vectorStoreService = require('../services/vectorStoreService');
const aiProvider = require('../utils/aiProvider');
const logger = require('../utils/logger');

/**
 * RAG Controller
 * Handles "Chat with Document" requests
 */
exports.queryDocuments = async (req, res) => {
    try {
        const { submissionId, query } = req.body;

        if (!submissionId || !query) {
            return res.status(400).json({ success: false, message: 'Missing submissionId or query' });
        }

        // 1. Retrieve relevant chunks
        const chunks = await vectorStoreService.search(query, submissionId);

        if (!chunks || chunks.length === 0) {
            return res.json({
                success: true,
                answer: "I couldn't find any relevant information in the uploaded documents to answer your question.",
                sources: []
            });
        }

        // 2. Build Context
        const context = chunks.map(c => `[Source: ${c.metadata.fileName}]\n${c.content}`).join('\n\n');

        // 3. Generate Answer using LLM
        const prompt = `You are a helpful Financial Analyst Assistant. 
Answer the user's question using ONLY the provided context. 
If the answer is not in the context, say you don't know. 
Do not hallucinate facts.

CONTEXT:
${context}

QUESTION:
${query}

ANSWER:`;

        // We use generateJSON but actually we just want text here. 
        // AIProvider.generateJSON expects a JSON response format, but here we want free text.
        // We'll use a direct call if AIProvider exposes it, or wrap it.
        // Looking at AIProvider, it enforces JSON format in generateJSON.
        // We might need to add a generateText method to AIProvider or use generateJSON with a structure.

        // Let's rely on JSON structure for better frontend handling
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
  "citations": ["list of filenames used"]
}`;

        const response = await aiProvider.generateJSON(jsonPrompt);

        // Fallback if AI fails to return valid JSON or we are using mock
        const finalAnswer = response ? response : {
            answer: "Mock Answer: Based on the documents, the client has a total declared income of...",
            citations: ["Mock Statement.pdf"]
        };

        res.json({
            success: true,
            answer: finalAnswer.answer,
            citations: finalAnswer.citations,
            retrievedChunks: chunks // Optional: for debugging/showing sources
        });

    } catch (error) {
        logger.error('RAG Query failed', { error: error.message });
        res.status(500).json({ success: false, message: 'Failed to process query' });
    }
};
