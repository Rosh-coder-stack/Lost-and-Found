const dotenv = require('dotenv');
dotenv.config();

const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  queues: {
    TEST_QUEUE: process.env.RABBITMQ_TEST_QUEUE || 'test_queue',
    NOTIFICATION: process.env.RABBITMQ_NOTIFICATION_QUEUE || 'notification_queue',
    NOTIFICATION_QUEUE: process.env.RABBITMQ_NOTIFICATION_QUEUE || 'notification_queue',
    NOTIFICATION_RETRY_QUEUE: process.env.RABBITMQ_NOTIFICATION_RETRY_QUEUE || 'notification_retry_queue',
    NOTIFICATION_DLQ: process.env.RABBITMQ_NOTIFICATION_DLQ || 'notification_dlq',
  },
  exchanges: {
    NOTIFICATION: process.env.RABBITMQ_NOTIFICATION_EXCHANGE || 'notification_exchange',
    NOTIFICATION_EXCHANGE: process.env.RABBITMQ_NOTIFICATION_EXCHANGE || 'notification_exchange',
    NOTIFICATION_RETRY_EXCHANGE: process.env.RABBITMQ_NOTIFICATION_RETRY_EXCHANGE || 'notification_retry_exchange',
    NOTIFICATION_DLX: process.env.RABBITMQ_NOTIFICATION_DLX || 'notification_dlx',
  },
  routingKeys: {
    PASSWORD_RESET: 'notification.password_reset',
    NOTIFICATION_PASSWORD_RESET: 'notification.password_reset',
    CLAIM_SUBMITTED: 'notification.claim_submitted',
    NOTIFICATION_CLAIM_SUBMITTED: 'notification.claim_submitted',
  },
  retry: {
    delayMs: parseInt(process.env.RABBITMQ_RETRY_DELAY_MS || '30000', 10),
    maxRetries: parseInt(process.env.RABBITMQ_MAX_RETRIES || '3', 10),
  },
  connectionOptions: {
    heartbeat: 60
  }
};

module.exports = rabbitmqConfig;
