const { OpenAI } = require('openai');
const Groq = require('groq-sdk');

class AIProvider {
    constructor() {
        this.openaiClient = null;
        this.groqClient = null;
    }

    _getOpenAI() {
        if (!this.openaiClient && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10) {
            this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        return this.openaiClient;
    }

    _getGroq() {
        if (!this.groqClient && process.env.GROQ_API_KEY) {
            this.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
        return this.groqClient;
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
}

module.exports = new AIProvider();
