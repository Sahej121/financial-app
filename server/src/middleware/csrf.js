const { doubleCsrf } = require('csrf-csrf');

const {
    invalidCsrfTokenError, // Error message for invalid token
    generateCsrfToken, // Used to get the token in a route
    doubleCsrfProtection, // The middleware
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || 'super_secret_csrf_key_12345',
    cookieName: 'psifi_csrf',
    cookieOptions: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false, // development
        path: '/',
    },
    getSessionIdentifier: (req) => 'anonymous-session',
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

module.exports = {
    generateCsrfToken,
    doubleCsrfProtection,
    invalidCsrfTokenError
};
