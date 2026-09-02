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
        ch.ack(msg);
      } catch (handlerError) {
        console.error(`❌ [Consumer Error] Failed processing message from '${queueName}':`, handlerError.message);
        
        // Message is NOT acknowledged on processing failure
        if (options.requeueOnError) {
          ch.nack(msg, false, true); // Requeue for retry if explicitly requested
        } else {
          // Reject without ack (or unacknowledged if no action taken)
          ch.nack(msg, false, false);
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
  consumeFromQueue
};
