const { doubleCsrf } = require('csrf-csrf');

const {
    invalidCsrfTokenMessage, // Error message for invalid token
    generateToken, // Used to get the token in a route
    doubleCsrfProtection, // The middleware
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || 'super_secret_csrf_key_12345',
    cookieName: 'x-csrf-token',
    cookieOptions: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

module.exports = {
    generateToken,
    doubleCsrfProtection,
    invalidCsrfTokenMessage
};
