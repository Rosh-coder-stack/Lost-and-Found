require('dotenv').config();
const app = require('./app');
const { startNotificationConsumer } = require('../consumers/notificationConsumer');
const { closeRabbitMQ } = require('../../shared/utils/rabbitmq');
const config = require('../config');

const PORT = config.port || process.env.PORT || 5005;

const startServer = async () => {
  try {
    // 1. Initialize RabbitMQ consumer (asserts exchange & queue, binds, and starts consumer)
    await startNotificationConsumer();

    // 2. Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`[Notification Service] Server running on port ${PORT}`);
    });

    // Graceful shutdown handling
    const handleShutdown = async (signal) => {
      console.log(`\n[Notification Service] Received ${signal}. Shutting down gracefully...`);
      server.close();
      await closeRabbitMQ();
      console.log('[Notification Service] Gracefully terminated.');
      process.exit(0);
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    console.error(`[Notification Service] Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
