require('dotenv').config();
const app = require('./server/src/robustServer');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log('🚀 Robust Financial App Server Started!');
  console.log(`📍 Server running on http://${HOST}:${PORT}`);
  console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📊 API endpoints: http://${HOST}:${PORT}/api`);
  console.log('🛡️  Enhanced security and error handling enabled');
  console.log('📝 Comprehensive logging enabled');
  console.log('⚡ Rate limiting enabled');
  console.log('🔐 JWT authentication enabled');
  console.log('🗄️  Multi-database support enabled');
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /api/auth/register - User registration');
  console.log('  POST /api/auth/login - User login');
  console.log('  GET  /api/auth/profile - Get user profile');
  console.log('  GET  /api/auth/verify - Verify token');
  console.log('  POST /api/auth/logout - User logout');
  console.log('  GET  /health - Health check');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});
