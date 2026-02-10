const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');
const { DocumentChunk, sequelize } = require('../models');
const aiProvider = require('../utils/aiProvider');
const logger = require('../utils/logger');

/**
 * Service to handle Vector Store operations
 * - Chunking
 * - Embedding
 * - Storage
 * - Retrieval
 */
class VectorStoreService {
    constructor() {
        this.splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
    }

    /**
     * Ingest a document into the vector store
     * @param {string} text - Full text of the document
     * @param {object} metadata - { documentId, submissionId, ... }
     */
    async ingestDocument(text, metadata) {
        try {
            logger.info(`[VectorStore] Starting ingestion for document ${metadata.documentId}`);

            // 1. Chunk the text
            const chunks = await this.splitter.createDocuments([text]);
            logger.info(`[VectorStore] Created ${chunks.length} chunks`);

            // 2. Clear existing chunks for this document (to avoid duplicates on re-analysis)
            if (metadata.documentId) {
                await DocumentChunk.destroy({ where: { documentId: metadata.documentId } });
            }

            // 3. Process chunks in batches to avoid rate limits
            // 3. Process chunks sequentially to avoid memory/WASM issues with local embeddings
            // Debug: Process one by one
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const content = chunk.pageContent;

                try {
                    logger.info(`[VectorStore] Processing chunk ${i + 1}/${chunks.length}`);

                    // 4. Generate Embedding
                    const embedding = await aiProvider.getEmbedding(content);

                    // 5. Save to DB
                    await DocumentChunk.create({
                        documentId: metadata.documentId,
                        submissionId: metadata.submissionId,
                        content,
                        // Ensure embedding is a string in [x,y,z] format for pgvector
                        // Sequelize would format an array as {x,y,z} which fails
                        embedding: JSON.stringify(embedding),
                        chunkIndex: i,
                        metadata: { ...metadata, ...chunk.metadata }
                    });
                } catch (chunkError) {
                    logger.error(`[VectorStore] Failed to process chunk ${i}:`, chunkError);
                    // Decide if we want to continue or throw. For now, log and continue to see if others work.
                }
            }

            logger.info(`[VectorStore] Successfully ingested document ${metadata.documentId}`);
            return true;
        } catch (error) {
            console.error('[VectorStore] Ingestion failed:', error);
            throw error;
        }
    }

    /**
     * Search for relevant chunks
     * @param {string} query - User question
     * @param {number|number[]} submissionId - Context scope (single ID or array)
     * @param {number} limit - Number of chunks to retrieve
     * @param {boolean} includeGlobal - Whether to include system knowledge (submissionId is null)
     */
    async search(query, submissionId, limit = 5, includeGlobal = false) {
        try {
            // 1. Embed the query
            const queryEmbedding = await aiProvider.getEmbedding(query);

            // 2. Format vector for SQL
            const vectorStr = `[${queryEmbedding.join(',')}]`;

            // 3. Build WHERE clause
            let whereClause = '';
            const replacements = { vector: vectorStr, limit };

            if (submissionId) {
                if (Array.isArray(submissionId)) {
                    whereClause = 'WHERE ("submissionId" IN (:submissionIds)';
                    replacements.submissionIds = submissionId;
                } else {
                    whereClause = 'WHERE ("submissionId" = :submissionId';
                    replacements.submissionId = submissionId;
                }

                if (includeGlobal) {
                    whereClause += ' OR "submissionId" IS NULL)';
                } else {
                    whereClause += ')';
                }
            } else if (includeGlobal) {
                whereClause = 'WHERE "submissionId" IS NULL';
            }

            // 4. Execute Cosine Similarity Search
            const results = await sequelize.query(
                `SELECT id, content, metadata, "chunkIndex", "submissionId", "documentId",
                 1 - (embedding <=> :vector) as similarity
                 FROM document_chunks
                 ${whereClause}
                 ORDER BY embedding <=> :vector
                 LIMIT :limit`,
                {
                    replacements,
                    type: sequelize.QueryTypes.SELECT
                }
            );

            return results;
        } catch (error) {
            console.error('[VectorStore] Search failed:', error);
            throw error;
        }
    }

    /**
     * Specialized search for document analysis
     * Finds context within the same submission to improve single-document insight
     */
    async findContextForAnalysis(text, submissionId, limit = 5) {
        if (!submissionId) return [];
        // Extract a "thematic query" from the text or just use a summary
        const query = text.substring(0, 500); // Simple approach: use start of text as query
        return this.search(query, submissionId, limit, true);
    }
}

module.exports = new VectorStoreService();
