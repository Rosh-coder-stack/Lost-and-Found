const { getChannel, consumeFromQueue, publishToExchange, closeRabbitMQ } = require('../../shared/utils/rabbitmq');
const { sendPasswordResetEmail, sendClaimSubmittedEmail } = require('../services/emailService');
const config = require('../config');

/**
 * Handles failed notification processing by routing either to the retry queue
 * (if retry count < maxRetries) or to the dead-letter queue (DLQ).
 *
 * @param {object|string} message - Parsed message payload
 * @param {object} rawMsg - Original AMQP message object
 * @param {string} routingKey - Message routing key
 * @param {number} currentRetryCount - Current retry count from message headers
 * @param {Error} error - The processing error encountered
 */
const handleProcessingFailure = async (message, rawMsg, routingKey, currentRetryCount, error) => {
  const { exchange, retryExchange, dlx, maxRetries } = config.rabbitmq;
  const originalHeaders = rawMsg?.properties?.headers || {};

  if (currentRetryCount < maxRetries) {
    const nextRetryCount = currentRetryCount + 1;
    console.warn(
      `⚠️ [Notification Consumer] Notification processing failed. Routing to retry exchange [Attempt ${nextRetryCount}/${maxRetries}]: routingKey='${routingKey}', error='${error.message}'`
    );

    const retryHeaders = {
      ...originalHeaders,
      'x-retry-count': nextRetryCount,
      'x-max-retries': maxRetries,
      'x-original-routing-key': routingKey,
      'x-original-exchange': exchange,
      'x-error-message': error.message,
      'x-failed-at': new Date().toISOString(),
    };

    try {
      // 1. Publish to the retry exchange with incremented retry count and metadata
      await publishToExchange(retryExchange, routingKey, message, 'topic', {
        headers: retryHeaders,
      });
      console.log(`🔁 [Notification Consumer] Successfully dispatched message to retry exchange '${retryExchange}'. Acknowledging original message.`);

      // 2. ACK original message only after successful retry publish
      const channel = await getChannel();
      if (!rawMsg._acknowledged) {
        channel.ack(rawMsg);
        rawMsg._acknowledged = true;
      }
    } catch (publishError) {
      console.error(
        `🚨 [Notification Consumer] Failed to publish message to retry exchange '${retryExchange}': ${publishError.message}`
      );
      // Do NOT acknowledge the original message. Rethrow to trigger NACK in consumer error handler.
      throw publishError;
    }
  } else {
    console.error(
      `💀 [Notification Consumer] Max retries (${maxRetries}) exhausted for message [RoutingKey: ${routingKey}]. Routing to DLQ. Error: ${error.message}`
    );

    const dlqHeaders = {
      ...originalHeaders,
      'x-retry-count': currentRetryCount,
      'x-max-retries': maxRetries,
      'x-original-routing-key': routingKey,
      'x-original-exchange': exchange,
      'x-error-message': error.message,
      'x-failed-at': new Date().toISOString(),
    };

    try {
      // 1. Publish to the Dead Letter Exchange (DLX)
      await publishToExchange(dlx, routingKey, message, 'topic', {
        headers: dlqHeaders,
      });
      console.log(`📦 [Notification Consumer] Successfully routed dead-letter message to DLX '${dlx}'. Acknowledging original message.`);

      // 2. ACK original message only after successful DLQ publish
      const channel = await getChannel();
      if (!rawMsg._acknowledged) {
        channel.ack(rawMsg);
        rawMsg._acknowledged = true;
      }
    } catch (dlqError) {
      console.error(
        `🚨 [Notification Consumer] Failed to publish message to DLX '${dlx}': ${dlqError.message}`
      );
      // Do NOT acknowledge the original message. Rethrow to trigger NACK in consumer error handler.
      throw dlqError;
    }
  }
};

/**
 * Message handler for processing incoming notification messages.
 * Handles PASSWORD_RESET_REQUESTED and CLAIM_SUBMITTED events.
 * On failure, invokes handleProcessingFailure() to route to Retry Queue or DLQ.
 *
 * @param {object|string} message - Parsed message payload
 * @param {object} rawMsg - Original AMQP message object
 */
const handleNotificationMessage = async (message, rawMsg) => {
  const routingKey = rawMsg?.fields?.routingKey || config.rabbitmq.routingKey;
  const headers = rawMsg?.properties?.headers || {};
  const currentRetryCount = parseInt(headers['x-retry-count'] || '0', 10);

  console.log(`📬 [Notification Consumer] Received message [RoutingKey: ${routingKey}] [Retry: ${currentRetryCount}/${config.rabbitmq.maxRetries}]:`);
  console.log(JSON.stringify(message, null, 2));

  try {
    if (message && message.event === 'PASSWORD_RESET_REQUESTED') {
      console.log(`📨 [Notification Consumer] Processing password reset email for: ${message.email}`);
      await sendPasswordResetEmail(message.email, message.resetToken);
      console.log(`✅ [Notification Consumer] Successfully sent password reset email to: ${message.email}`);
    } else if (message && message.event === 'CLAIM_SUBMITTED') {
      console.log(`📢 [Notification Consumer] Processing CLAIM_SUBMITTED event:`);
      console.log(`   Claim ID        : ${message.claimId}`);
      console.log(`   Item ID         : ${message.itemId}`);
      console.log(`   Item Title      : ${message.itemTitle} (${message.itemType})`);
      console.log(`   Recipient Email : ${message.recipientEmail}`);
      console.log(`   Recipient Name  : ${message.recipientName}`);
      console.log(`   Claimant Name   : ${message.claimantName}`);
      console.log(`   Proof Preview   : ${message.proofPreview}`);
      console.log(`   Submitted At    : ${message.submittedAt}`);

      await sendClaimSubmittedEmail({
        recipientEmail: message.recipientEmail,
        recipientName: message.recipientName,
        claimantName: message.claimantName,
        itemTitle: message.itemTitle,
        itemType: message.itemType,
        proofPreview: message.proofPreview,
        submittedAt: message.submittedAt,
      });

      console.log(`✅ [Notification Consumer] Successfully sent claim notification email to: ${message.recipientEmail}`);
    } else {
      console.warn(`⚠️ [Notification Consumer] Unhandled or unrecognized event type: ${message?.event}`);
    }

    // Success path: consumeFromQueue will invoke ch.ack(msg) if not already acknowledged.
  } catch (error) {
    console.error(`❌ [Notification Consumer] Error handling notification event '${message?.event}': ${error.message}`);
    // Trigger retry or DLQ routing
    await handleProcessingFailure(message, rawMsg, routingKey, currentRetryCount, error);
  }
};

/**
 * Initializes and starts the RabbitMQ notification consumer:
 * 1. Obtains the shared channel via getChannel() (reusing connection and channel logic).
 * 2. Asserts the durable main topic exchange ('notification_exchange').
 * 3. Asserts the durable main queue ('notification_queue').
 * 4. Binds 'notification_queue' to 'notification_exchange' with routing keys.
 * 5. Asserts the durable retry topic exchange ('notification_retry_exchange').
 * 6. Asserts the durable retry queue ('notification_retry_queue') with TTL and Dead-Letter Exchange pointing to 'notification_exchange'.
 * 7. Binds 'notification_retry_queue' to 'notification_retry_exchange' with 'notification.#'.
 * 8. Asserts the durable dead-letter exchange ('notification_dlx').
 * 9. Asserts the durable dead-letter queue ('notification_dlq').
 * 10. Binds 'notification_dlq' to 'notification_dlx' with 'notification.#'.
 * 11. Uses consumeFromQueue() to consume exclusively from 'notification_queue'.
 *
 * @returns {Promise<object>} Consumer info object
 */
async function startNotificationConsumer() {
  const {
    exchange,
    exchangeType,
    queue,
    routingKey,
    retryExchange,
    retryQueue,
    dlx,
    dlq,
    retryDelayMs,
  } = config.rabbitmq;

  console.log('⏳ [Notification Consumer] Initializing RabbitMQ consumer setup...');

  // 1. Obtain shared channel (reuses connection and channel logic)
  const channel = await getChannel();

  // 2. Assert durable main topic exchange
  await channel.assertExchange(exchange, exchangeType, { durable: true });
  console.log(`✅ [Notification Consumer] Asserted durable exchange: '${exchange}' (type: ${exchangeType})`);

  // 3. Assert durable main queue
  await channel.assertQueue(queue, { durable: true });
  console.log(`✅ [Notification Consumer] Asserted durable queue: '${queue}'`);

  // 4. Bind main queue to main exchange using both routing keys
  const routingKeys = [
    routingKey || 'notification.password_reset',
    'notification.claim_submitted',
  ];

  for (const key of routingKeys) {
    await channel.bindQueue(queue, exchange, key);
    console.log(`🔗 [Notification Consumer] Bound queue '${queue}' to exchange '${exchange}' with routing key '${key}'`);
  }

  // 5. Assert durable retry exchange (topic)
  await channel.assertExchange(retryExchange, 'topic', { durable: true });
  console.log(`✅ [Notification Consumer] Asserted durable retry exchange: '${retryExchange}' (type: topic)`);

  // 6. Assert durable retry queue with TTL and Dead-Letter Exchange pointing back to main exchange
  await channel.assertQueue(retryQueue, {
    durable: true,
    arguments: {
      'x-message-ttl': retryDelayMs,
      'x-dead-letter-exchange': exchange,
      // Leaving x-dead-letter-routing-key unset preserves original routing key
    },
  });
  console.log(
    `✅ [Notification Consumer] Asserted durable retry queue: '${retryQueue}' (TTL: ${retryDelayMs}ms, DLX: '${exchange}')`
  );

  // 7. Bind retry queue to retry exchange for all notification routing keys
  await channel.bindQueue(retryQueue, retryExchange, 'notification.#');
  console.log(`🔗 [Notification Consumer] Bound retry queue '${retryQueue}' to retry exchange '${retryExchange}' with routing key 'notification.#'`);

  // 8. Assert durable DLX (topic)
  await channel.assertExchange(dlx, 'topic', { durable: true });
  console.log(`✅ [Notification Consumer] Asserted durable DLX: '${dlx}' (type: topic)`);

  // 9. Assert durable DLQ
  await channel.assertQueue(dlq, { durable: true });
  console.log(`✅ [Notification Consumer] Asserted durable DLQ: '${dlq}'`);

  // 10. Bind DLQ to DLX for all notification routing keys
  await channel.bindQueue(dlq, dlx, 'notification.#');
  console.log(`🔗 [Notification Consumer] Bound DLQ '${dlq}' to DLX '${dlx}' with routing key 'notification.#'`);

  // 11. Consume from main queue using existing consumeFromQueue utility
  const consumer = await consumeFromQueue(queue, handleNotificationMessage);
  console.log(`🚀 [Notification Consumer] Active and consuming from queue '${queue}'`);

  return consumer;
}

// Allow direct execution
if (require.main === module) {
  startNotificationConsumer().catch((err) => {
    console.error('❌ [Notification Consumer] Failed to start:', err.message);
    process.exit(1);
  });
}

module.exports = {
  startNotificationConsumer,
  handleNotificationMessage,
  handleProcessingFailure,
};
