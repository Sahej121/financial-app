const sensitiveKeys = [
    'password',
    'otpCode',
    'otpExpire',
    'resetPasswordToken',
    'resetPasswordExpire',
    'twoFactorSecret',
    'secret',
    'aadhaar',
    'pan'
];

/**
 * Recursively sanitizes an object by removing sensitive keys.
 * @param {Object|Array} data - The data to sanitize.
 * @returns {Object|Array} - The sanitized data.
 */
const sanitize = (data, seen = new WeakSet()) => {
    if (data === null || typeof data !== 'object') {
        return data;
    }

    if (seen.has(data)) {
        return undefined; // Break circular reference
    }

    seen.add(data);

    if (Array.isArray(data)) {
        return data.map(item => sanitize(item, seen));
    }

    const sanitized = {};
    Object.keys(data).forEach((key) => {
        if (!sensitiveKeys.includes(key)) {
            sanitized[key] = sanitize(data[key], seen);
        }
    });

    return sanitized;
};

/**
 * Middleware that intercepts res.json to sanitize the payload.
 */
const responseSanitizer = (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
        // Use a new WeakSet for each request to track circular references
        const sanitizedData = sanitize(data, new WeakSet());
        originalJson.call(this, sanitizedData);
    };

    next();
};

module.exports = responseSanitizer;
