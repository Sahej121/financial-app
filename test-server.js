const express = require('express');
const app = express();
const PORT = 3002;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: 1, name: 'Test User', email: 'test@example.com' },
      token: 'test-token'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Register request:', req.body);
  res.json({
    success: true,
    message: 'Registration successful',
    data: {
      user: { id: 1, name: 'Test User', email: 'test@example.com' },
      token: 'test-token'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on http://0.0.0.0:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/health`);
});
