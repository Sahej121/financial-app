const path = require('path');
const Sentry = require("@sentry/node");
// const { nodeProfilingIntegration } = require("@sentry/profiling-node"); // Disabled due to Node v25 incompatibility

require('dotenv').config({ path: path.join(__dirname, '../.env') });

Sentry.init({
  dsn: process.env.SENTRY_DSN || "sentry_dsn_placeholder",
  integrations: [
    // nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  // profilesSampleRate: 1.0,
});
const express = require('express');
const helmet = require('helmet');
const logger = require('./utils/logger');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { sequelize } = require('./models');
const { connectRedis } = require('./utils/cache');

const app = express();
app.set('trust proxy', 1); // Trust first proxy (needed for rate limiter behind proxy)

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3005',
  credentials: true
}));
app.use(express.json());
app.use(apiLimiter);

// [REMOVED] Public static serving of uploads is disabled for security.
// Use authenticated /api/documents/:documentId/download route instead.

// Connect to PostgreSQL with Sequelize
sequelize.authenticate()
  .then(() => {
    logger.info('Database connected successfully');
    // Using alter: false by default for PostgreSQL stability in dev
    // If schema changes are needed, run with DB_ALTER=true
    const shouldAlter = process.env.DB_ALTER === 'true';
    return sequelize.sync({ force: false, alter: shouldAlter });
  })
  .then(() => {
    logger.info('Database synchronized');
  })
  .catch(err => {
    logger.error('Database connection error', { error: err.message });
    logger.info('Attempting to start server anyway...');
  });

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Connect Redis
connectRedis();

// Routes
app.use('/api', routes);

// Error handling
// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, 'localhost', () => {
  logger.info(`Server is running on localhost:${PORT}`);
}); 