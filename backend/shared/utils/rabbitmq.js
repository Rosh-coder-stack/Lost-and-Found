const amqp = require('amqplib');
const config = require('../config/rabbitmq');

let connection = null;
let channel = null;

/**
 * Connect to RabbitMQ message broker and create a channel.
 * @param {string} [customUrl] Optional AMQP connection URL
 * @returns {Promise<{ connection: amqp.Connection, channel: amqp.Channel }>}
 */
async function connectRabbitMQ(customUrl = null) {
  if (channel && connection) {
    return { connection, channel };
  }

  const url = customUrl || config.url;

  try {
    connection = await amqp.connect(url, config.connectionOptions);
    
    connection.on('error', (err) => {
      console.error('❌ [RabbitMQ Connection Error]:', err.message);
    });

    connection.on('close', () => {
      console.warn('⚠️ [RabbitMQ Connection Closed]');
      connection = null;
      channel = null;
    });

    channel = await connection.createChannel();

    channel.on('error', (err) => {
      console.error('❌ [RabbitMQ Channel Error]:', err.message);
    });

    channel.on('close', () => {
      console.warn('⚠️ [RabbitMQ Channel Closed]');
      channel = null;
    });

    return { connection, channel };
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error.message);
    throw error;
  }
}

/**
 * Get the active RabbitMQ channel, or initialize one if not connected.
 * @returns {Promise<amqp.Channel>}
 */
async function getChannel() {
  if (!channel) {
    await connectRabbitMQ();
  }
  return channel;
}

/**
 * Get the active RabbitMQ connection, or initialize one if not connected.
 * @returns {Promise<amqp.Connection>}
 */
async function getConnection() {
  if (!connection) {
    await connectRabbitMQ();
  }
  return connection;
}

/**
 * Close RabbitMQ channel and connection gracefully.
 * @returns {Promise<void>}
 */
async function closeRabbitMQ() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
  } catch (error) {
    console.error('⚠️ Error closing RabbitMQ connection:', error.message);
  }
}

/**
 * Publish a message to a RabbitMQ queue.
 * @param {string} queueName Name of the queue
 * @param {object|string} message Message payload
 * @param {object} [options] Publishing options
 * @returns {Promise<boolean>}
 */
async function publishToQueue(queueName, message, options = {}) {
  const ch = await getChannel();

  // Ensure queue exists and is durable
  await ch.assertQueue(queueName, { durable: true });

  const content = Buffer.from(
    typeof message === 'string' ? message : JSON.stringify(message)
  );

  const publishOptions = {
    persistent: true, // message survives broker restart
    contentType: 'application/json',
    timestamp: Date.now(),
    ...options
  };

  const sent = ch.sendToQueue(queueName, content, publishOptions);
  return sent;
}

/**
 * Publish a message to a RabbitMQ exchange with a routing key.
 * @param {string} exchange Name of the exchange
 * @param {string} routingKey Routing key
 * @param {object|string} message Message payload
 * @param {string} [exchangeType='topic'] Type of the exchange (topic, direct, fanout)
 * @param {object} [options] Publishing options
 * @returns {Promise<boolean>}
 */
async function publishToExchange(exchange, routingKey, message, exchangeType = 'topic', options = {}) { 
  if (typeof exchangeType === 'object' && exchangeType !== null) {
    options = exchangeType;
    exchangeType = options.exchangeType || 'topic';
  }

  const ch = await getChannel();

  // Ensure exchange exists and is durable
  await ch.assertExchange(exchange, exchangeType, { durable: true });

  const content = Buffer.from(
    typeof message === 'string' ? message : JSON.stringify(message)
  );

  const publishOptions = {
    persistent: true, // message survives broker restart
    contentType: 'application/json',
    timestamp: Date.now(),
    ...options,
    headers: {
      ...(options.headers || {})
    }
  };

  const sent = ch.publish(exchange, routingKey, content, publishOptions);
  return sent;
}

/**
 * Publish a message to a retry exchange with retry metadata headers.
 * @param {string} exchange Name of the retry exchange
 * @param {string} routingKey Routing key
 * @param {object|string} message Message payload
 * @param {object} [metadata] Retry headers metadata
 * @param {number} [metadata.retryCount] Current retry count
 * @param {number} [metadata.maxRetries] Max retry limit
 * @param {string} [metadata.originalRoutingKey] Original routing key
 * @param {string} [metadata.originalExchange] Original exchange
 * @param {string} [metadata.errorMessage] Error message
 * @param {string} [metadata.failedAt] Timestamp of failure
 * @param {object} [options] Additional publish options
 * @returns {Promise<boolean>}
 */
async function publishToRetry(exchange, routingKey, message, metadata = {}, options = {}) {
  const headers = {
    'x-retry-count': metadata.retryCount !== undefined ? metadata.retryCount : 1,
    'x-max-retries': metadata.maxRetries !== undefined ? metadata.maxRetries : 3,
    'x-original-routing-key': metadata.originalRoutingKey || routingKey,
    'x-original-exchange': metadata.originalExchange || '',
    'x-error-message': metadata.errorMessage || '',
    'x-failed-at': metadata.failedAt || new Date().toISOString(),
    ...(options.headers || {})
  };

  return publishToExchange(exchange, routingKey, message, 'topic', {
    ...options,
    headers
  });
}

/**
 * Publish a message to a dead letter exchange (DLX) with failure metadata headers.
 * @param {string} exchange Name of the DLX
 * @param {string} routingKey Routing key
 * @param {object|string} message Message payload
 * @param {object} [metadata] Failure headers metadata
 * @param {number} [metadata.retryCount] Final retry count
 * @param {number} [metadata.maxRetries] Max retry limit
 * @param {string} [metadata.originalRoutingKey] Original routing key
 * @param {string} [metadata.originalExchange] Original exchange
 * @param {string} [metadata.errorMessage] Error message
 * @param {string} [metadata.failedAt] Timestamp of failure
 * @param {object} [options] Additional publish options
 * @returns {Promise<boolean>}
 */
async function publishToDLQ(exchange, routingKey, message, metadata = {}, options = {}) {
  const headers = {
    'x-retry-count': metadata.retryCount !== undefined ? metadata.retryCount : 3,
    'x-max-retries': metadata.maxRetries !== undefined ? metadata.maxRetries : 3,
    'x-original-routing-key': metadata.originalRoutingKey || routingKey,
    'x-original-exchange': metadata.originalExchange || '',
    'x-error-message': metadata.errorMessage || '',
    'x-failed-at': metadata.failedAt || new Date().toISOString(),
    ...(options.headers || {})
  };

  return publishToExchange(exchange, routingKey, message, 'topic', {
    ...options,
    headers
  });
}

/**
 * Consume messages from a queue with manual acknowledgement (ACK).
 * 
 * - Acknowledges (ACK) ONLY after messageHandler successfully resolves.
 * - If messageHandler throws an error, does NOT acknowledge the message.
 * 
 * @param {string} queueName Name of the queue to consume from
 * @param {function(object, object): Promise<void>|void} messageHandler Async handler callback receiving (parsedMessage, rawMsg)
 * @param {object} [options] Consumer configuration options
 * @param {number} [options.prefetch=1] Number of unacknowledged messages per worker
 * @param {boolean} [options.requeueOnError=false] Whether to requeue on failure
 * @returns {Promise<{ consumerTag: string }>}
 */
async function consumeFromQueue(queueName, messageHandler, options = {}) {
  const ch = await getChannel();

  // Ensure queue exists and is durable
  await ch.assertQueue(queueName, { durable: true });

  // Fair dispatch: process prefetch messages at a time per worker
  const prefetchCount = options.prefetch || 1;
  await ch.prefetch(prefetchCount);

  // Manual acknowledgment: noAck = false
  const consumer = await ch.consume(
    queueName,
    async (msg) => {
      if (!msg) {
        console.warn(`⚠️ Consumer cancelled by broker for queue: ${queueName}`);
        return;
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(msg.content.toString());
      } catch {
        parsedContent = msg.content.toString();
      }

      try {
        // Execute the processing handler
        await messageHandler(parsedContent, msg);

        // MANUAL ACK: Acknowledge only after successful processing
        if (!msg._acknowledged) {
          ch.ack(msg);
          msg._acknowledged = true;
        }
      } catch (handlerError) {
        console.error(`❌ [Consumer Error] Failed processing message from '${queueName}':`, handlerError.message);
        
        // Message is NOT acknowledged on processing failure
        if (!msg._acknowledged) {
          if (options.requeueOnError) {
            ch.nack(msg, false, true); // Requeue for retry if explicitly requested
          } else {
            // Reject without ack (or unacknowledged if no action taken)
            ch.nack(msg, false, false);
          }
          msg._acknowledged = true;
        }
      }
    },
    { noAck: false } // Enforce manual acknowledgment
  );

  return consumer;
}

module.exports = {
  connectRabbitMQ,
  getChannel,
  getConnection,
  closeRabbitMQ,
  publishToQueue,
  publishToExchange,
  publishToRetry,
  publishToDLQ,
  consumeFromQueue
};
