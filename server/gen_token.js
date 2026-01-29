const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = jwt.sign(
    { id: 1, role: 'ca' },
    process.env.JWT_SECRET || 'your_jwt_secret_here',
    { expiresIn: '1h' }
);

console.log(token);
