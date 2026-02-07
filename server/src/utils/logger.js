const winston = require('winston');
const path = require('path');

const sensitiveKeys = ['password', 'otpCode', 'resetPasswordToken', 'twoFactorSecret', 'token', 'authorization', 'cookie', 'aadhaar', 'pan'];

const redact = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    const redacted = Array.isArray(obj) ? [] : {};
    Object.keys(obj).forEach(key => {
        if (sensitiveKeys.includes(key.toLowerCase())) {
            redacted[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
            redacted[key] = redact(obj[key]);
        } else {
            redacted[key] = obj[key];
        }
    });
    return redacted;
};

const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(redact(metadata))}`;
    }
    return msg;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            )
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log')
        })
    ]
});

module.exports = logger;
