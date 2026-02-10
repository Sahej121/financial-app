const { OpenAI } = require('openai');
const Groq = require('groq-sdk');
const logger = require('./logger');
let pipeline = null;

class AIProvider {
    constructor() {
        this.openaiClient = null;
        this.groqClient = null;
        this.embeddingPipeline = null;
    }

    _getOpenAI() {
        const key = process.env.OPENAI_API_KEY;
        const isPlaceholder = !key || key === 'your_openai_api_key_here' || key.includes('your_openai_api_key');

        if (!this.openaiClient && key && key.length > 20 && !isPlaceholder) {
            this.openaiClient = new OpenAI({ apiKey: key });
        }
        return this.openaiClient;
    }

    _getGroq() {
        if (!this.groqClient && process.env.GROQ_API_KEY) {
            this.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
        return this.groqClient;
    }

    async _getLocalEmbedder() {
        if (!this.embeddingPipeline) {
            try {
                logger.info('[AIProvider] Loading local embedding pipeline (Xenova/all-MiniLM-L6-v2)...');
                // Dynamic import to avoid issues if module missing
                const { pipeline: transformerPipeline } = await import('@xenova/transformers');
                // Use a small, fast model. 384 dimensions.
                this.embeddingPipeline = await transformerPipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
                logger.info('[AIProvider] Local pipeline loaded successfully.');
            } catch (e) {
                logger.error('[AIProvider] Failed to load local embedder:', e);
                return null;
            }
        }
        return this.embeddingPipeline;
    }

    getActiveProvider() {
        if (this._getGroq()) return 'groq';
        if (this._getOpenAI()) return 'openai';
        return 'mock';
    }

    /**
     * Generate structured JSON from a prompt
     * @param {string} prompt - The system/user prompt
     * @param {object} options - Optional { temperature, model }
     */
    async generateJSON(prompt, options = {}) {
        const provider = this.getActiveProvider();

        if (provider === 'mock') {
            console.warn('[AIProvider] No valid API key found. Returning mock response.');
            return null;
        }

        try {
            if (provider === 'groq') {
                const completion = await this._getGroq().chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: options.model || "llama-3.3-70b-versatile",
                    temperature: options.temperature || 0.1,
                    response_format: { type: "json_object" }
                });
                return JSON.parse(completion.choices[0].message.content);
            } else {
                const completion = await this._getOpenAI().chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: options.model || "gpt-4-turbo-preview",
                    temperature: options.temperature || 0.1,
                    response_format: { type: "json_object" }
                });
                return JSON.parse(completion.choices[0].message.content);
            }
        } catch (error) {
            console.error(`[AIProvider] Error with ${provider}:`, error);
            throw error;
        }
    }

    /**
     * Generate embeddings for a text string
     * LOCAL-FIRST: Uses on-device model by default for privacy & cost.
     * @param {string} text - The text to embed
     * @returns {Promise<number[]>} - The embedding vector (384-dim local, 1536-dim OpenAI)
     */
    async getEmbedding(text) {
        // LOCAL-FIRST: Keep financial text on-device, eliminate embedding API costs
        try {
            const embedder = await this._getLocalEmbedder();
            if (embedder) {
                logger.debug(`[AIProvider] Generating local embedding for text length: ${text.length}`);
                const output = await embedder(text, { pooling: 'mean', normalize: true });
                return Array.from(output.data);
            }
        } catch (e) {
            logger.warn('[AIProvider] Local embedding failed, trying OpenAI fallback:', e.message);
        }

        // Fallback to OpenAI only if local model unavailable
        if (this._getOpenAI()) {
            try {
                logger.info('[AIProvider] Using OpenAI embedding fallback');
                const response = await this._getOpenAI().embeddings.create({
                    model: "text-embedding-3-small",
                    input: text,
                    encoding_format: "float",
                });
                return response.data[0].embedding;
            } catch (error) {
                logger.error('[AIProvider] OpenAI embedding also failed:', error.message);
            }
        }

        logger.warn('[AIProvider] No embedding provider available. Returning mock.');
        return new Array(384).fill(0); // Mock for local dimension
    }
}

module.exports = new AIProvider();
