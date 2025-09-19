const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const dotenv = require('dotenv');
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');
const { rateLimiter } = require('./middleware/rateLimiter');
const { requestLogger } = require('./middleware/requestLogger');
const { setupRoutes } = require('./api/routes');
const { WebSocketManager } = require('./services/websocket');
const { RedisClient } = require('./services/redis');
const { PolicyManager } = require('./services/policy');

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8080;

// Initialize services
const redis = new RedisClient();
const policyManager = new PolicyManager();
const wsManager = new WebSocketManager();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '512kb' }));
app.use(requestLogger);
app.use(rateLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api', authMiddleware, setupRoutes(redis, policyManager, wsManager));

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });
wsManager.initialize(wss, redis);

// Error handling
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, starting graceful shutdown');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  wsManager.shutdown();
  await redis.disconnect();
  
  process.exit(0);
});

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`WebSocket server available at ws://localhost:${PORT}/ws`);
});

module.exports = app;