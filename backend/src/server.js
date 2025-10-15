import { httpServer } from './app.js';
import config from './config/environment.js';
import { logger } from './utils/logger.js';
import { initializeMediasoup } from './services/mediasoup/worker.js';

const PORT = config.port;
const HOST = config.host;

async function startServer() {
  try {
    // Initialize Mediasoup workers
    logger.info('Initializing Mediasoup workers...');
    try {
      await initializeMediasoup();
      logger.info('Mediasoup workers initialized successfully');
    } catch (error) {
      logger.warn('Mediasoup initialization failed (this is expected if native dependencies are not built):', error.message);
      logger.info('Server will continue without WebRTC support. Run "npm rebuild mediasoup" to enable WebRTC.');
    }

    // Start HTTP server
    httpServer.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`CORS Origin: ${config.corsOrigin}`);
      logger.info(`Health check: http://${HOST}:${PORT}/health`);
    });

    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

function gracefulShutdown() {
  logger.info('Received shutdown signal, closing server...');
  
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Start the server
startServer();
