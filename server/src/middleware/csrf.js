const { doubleCsrf } = require('csrf-csrf');

const {
    invalidCsrfTokenError, // Error message for invalid token
    generateCsrfToken, // Used to get the token in a route
    doubleCsrfProtection, // The middleware
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET || 'super_secret_csrf_key_12345',
    cookieName: 'x-csrf-token',
    cookieOptions: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    },
    getSessionIdentifier: (req) => {
        // Use user ID if authenticated, otherwise a unique fingerprint or session id
        // For simplicity during login, we can use a cookie or just a generic string 
        // if no user is found yet. 
        return req.user?.id || 'anonymous-session';
    },
    size: 64,
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

module.exports = {
    generateCsrfToken,
    doubleCsrfProtection,
    invalidCsrfTokenError
};
