const axios = require('axios');

async function verifyZeroLeakage() {
    console.log('--- Verifying Zero Data Leakage ---');

    try {
        // 0. Fetch CSRF Token
        console.log('Fetching CSRF Token...');
        const csrfRes = await axios.get('http://localhost:3001/api/csrf-token', {
            withCredentials: true,
            headers: {
                'Accept': 'application/json'
            }
        });
        const csrfToken = csrfRes.data.token;
        const cookies = csrfRes.headers['set-cookie'];

        // 1. Check Login Response for ca1@financialapp.com
        console.log('Checking Login Response...');
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'ca1@financialapp.com',
            password: 'password123'
        }, {
            headers: {
                'x-csrf-token': csrfToken,
                'Cookie': cookies ? cookies.join('; ') : '',
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        const sensitiveKeys = ['password', 'otpCode', 'otpExpire', 'resetPasswordToken', 'twoFactorSecret', 'phone', 'pan', 'aadhaar'];
        const foundKeys = [];

        const checkObject = (obj) => {
            if (typeof obj !== 'object' || obj === null) return;
            Object.keys(obj).forEach(key => {
                if (sensitiveKeys.includes(key)) foundKeys.push(key);
                checkObject(obj[key]);
            });
        };

        checkObject(loginRes.data);

        if (foundKeys.length > 0) {
            console.error('❌ FAILED: Found sensitive keys in login response:', foundKeys);
        } else {
            console.log('✅ PASSED: No sensitive keys found in login response.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Verification failed with error:', err.response?.data || err.message);
        process.exit(1);
    }
}

verifyZeroLeakage();
