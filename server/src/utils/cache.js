const { createClient } = require('redis');
const logger = require('./logger');

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => logger.error('Redis Client Error', { error: err.message }));

const connectRedis = async () => {
    try {
        await client.connect();
        logger.info('Redis connected successfully');
    } catch (err) {
        logger.warn('Redis connection failed, continuing without cache', { error: err.message });
    }
};

const getCache = async (key) => {
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        return null;
    }
};

const setCache = async (key, value, ttl = 3600) => {
    try {
        await client.set(key, JSON.stringify(value), {
            EX: ttl
        });
    } catch (err) {
        // Silent fail
    }
};

module.exports = { client, connectRedis, getCache, setCache };
