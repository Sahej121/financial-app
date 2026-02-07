const sanitize = require('./server/src/middleware/sanitizer');

// Mock request and response
const req = {};
const res = {
    json: function (data) {
        // This simulates the original json method
        console.log('Original json called with:', JSON.stringify(data, null, 2));
    }
};

const next = () => {
    console.log('Next called');
};

// Initialize middleware
// The sanitizer middleware overwrites res.json
// We need to extract the logic to test it, or require the module and use it as intended
// The module exports the middleware function 'responseSanitizer'

const responseSanitizer = require('./server/src/middleware/sanitizer');

console.log('Initializing middleware...');
responseSanitizer(req, res, next);

// Create a circular object
const circularObj = {
    name: 'Circular Object',
    child: {
        name: 'Child Object'
    }
};
circularObj.child.parent = circularObj; // Circular reference

console.log('Testing circular object...');
try {
    res.json(circularObj);
    console.log('Success: Circular object handled without error.');
} catch (error) {
    console.error('Failure: Error handling circular object:', error.message);
}

// Test sensitive data redaction
const sensitiveObj = {
    username: 'user1',
    password: 'secretpassword',
    data: {
        pan: 'ABCDE1234F',
        balance: 5000
    }
};
console.log('\nTesting sensitive data redaction...');
res.json(sensitiveObj);
