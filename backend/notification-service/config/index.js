const dotenv = require('dotenv');
const sharedRabbitMQConfig = require('../../shared/config/rabbitmq');

dotenv.config();

const config = {
  port: process.env.PORT || 5005,
  nodeEnv: process.env.NODE_ENV || 'development',
  rabbitmq: {
    url: process.env.RABBITMQ_URL || sharedRabbitMQConfig.url || 'amqp://guest:guest@localhost:5672',
    exchange: process.env.RABBITMQ_NOTIFICATION_EXCHANGE || sharedRabbitMQConfig.exchanges?.NOTIFICATION_EXCHANGE || 'notification_exchange',
    exchangeType: 'topic',
    queue: process.env.RABBITMQ_NOTIFICATION_QUEUE || sharedRabbitMQConfig.queues?.NOTIFICATION_QUEUE || 'notification_queue',
    routingKey: process.env.RABBITMQ_ROUTING_KEY || sharedRabbitMQConfig.routingKeys?.NOTIFICATION_PASSWORD_RESET || 'notification.password_reset',
    retryExchange: process.env.RABBITMQ_NOTIFICATION_RETRY_EXCHANGE || sharedRabbitMQConfig.exchanges?.NOTIFICATION_RETRY_EXCHANGE || 'notification_retry_exchange',
    retryQueue: process.env.RABBITMQ_NOTIFICATION_RETRY_QUEUE || sharedRabbitMQConfig.queues?.NOTIFICATION_RETRY_QUEUE || 'notification_retry_queue',
    dlx: process.env.RABBITMQ_NOTIFICATION_DLX || sharedRabbitMQConfig.exchanges?.NOTIFICATION_DLX || 'notification_dlx',
    dlq: process.env.RABBITMQ_NOTIFICATION_DLQ || sharedRabbitMQConfig.queues?.NOTIFICATION_DLQ || 'notification_dlq',
    retryDelayMs: parseInt(process.env.RABBITMQ_RETRY_DELAY_MS || sharedRabbitMQConfig.retry?.delayMs || '30000', 10),
    maxRetries: parseInt(process.env.RABBITMQ_MAX_RETRIES || sharedRabbitMQConfig.retry?.maxRetries || '3', 10),
  },
};

module.exports = config;
