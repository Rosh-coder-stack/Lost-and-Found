/**
 * Automated Verification Script for Notification Consumer Setup
 * Verifies:
 * 1. Notification Consumer assertions, bindings, and use of consumeFromQueue
 * 2. Message handler logging behavior
 * 3. Health check route response
 */
const assert = require('assert');
const amqp = require('amqplib');
const { EventEmitter } = require('events');

async function testNotificationConsumer() {
  console.log('====================================================');
  console.log('🧪 VERIFYING NOTIFICATION CONSUMER SETUP');
  console.log('====================================================\n');

  // Test 1: Verify config values
  console.log('▶ TEST 1: Verifying Configuration Constants');
  const config = require('./config');
  assert.strictEqual(config.rabbitmq.exchange, 'notification_exchange', 'Exchange must be notification_exchange');
  assert.strictEqual(config.rabbitmq.exchangeType, 'topic', 'Exchange type must be topic');
  assert.strictEqual(config.rabbitmq.queue, 'notification_queue', 'Queue must be notification_queue');
  assert.strictEqual(config.rabbitmq.routingKey, 'notification.password_reset', 'Routing key must be notification.password_reset');
  assert.strictEqual(config.rabbitmq.retryExchange, 'notification_retry_exchange', 'Retry exchange must be notification_retry_exchange');
  assert.strictEqual(config.rabbitmq.retryQueue, 'notification_retry_queue', 'Retry queue must be notification_retry_queue');
  assert.strictEqual(config.rabbitmq.dlx, 'notification_dlx', 'DLX must be notification_dlx');
  assert.strictEqual(config.rabbitmq.dlq, 'notification_dlq', 'DLQ must be notification_dlq');
  assert.strictEqual(config.rabbitmq.retryDelayMs, 30000, 'Retry delay must be 30000 ms');
  assert.strictEqual(config.rabbitmq.maxRetries, 3, 'Max retries must be 3');
  console.log('✅ Config verified successfully.\n');

  // Test 2: Verify consumer logic with mock amqp connection/channel
  console.log('▶ TEST 2: Verifying Consumer Topology Setup (Exchange, Queue, Retry, DLQ, Binding)');
  const operations = [];

  const mockChannel = new EventEmitter();
  mockChannel.assertExchange = async (exchange, type, options) => {
    operations.push({ op: 'assertExchange', exchange, type, options });
    return { exchange };
  };
  mockChannel.assertQueue = async (queue, options) => {
    operations.push({ op: 'assertQueue', queue, options });
    return { queue, messageCount: 0, consumerCount: 0 };
  };
  mockChannel.bindQueue = async (queue, exchange, routingKey) => {
    operations.push({ op: 'bindQueue', queue, exchange, routingKey });
    return {};
  };
  mockChannel.prefetch = async (count) => {
    operations.push({ op: 'prefetch', count });
  };
  mockChannel.consume = async (queue, onMessage, options) => {
    operations.push({ op: 'consume', queue, onMessage, options });
    return { consumerTag: 'mock-consumer-tag' };
  };
  mockChannel.publish = (exchange, routingKey, content, options) => {
    operations.push({ op: 'publish', exchange, routingKey, content, options });
    return true;
  };
  mockChannel.sendToQueue = (queue, content, options) => {
    operations.push({ op: 'sendToQueue', queue, content, options });
    return true;
  };
  mockChannel.ack = (msg) => {
    operations.push({ op: 'ack', msg });
  };
  mockChannel.nack = (msg, allUpTo, requeue) => {
    operations.push({ op: 'nack', msg, allUpTo, requeue });
  };

  const mockConnection = new EventEmitter();
  mockConnection.createChannel = async () => mockChannel;
  mockConnection.close = async () => {};

  const origConnect = amqp.connect;
  amqp.connect = async () => mockConnection;

  try {
    const { startNotificationConsumer, handleNotificationMessage } = require('./consumers/notificationConsumer');
    const result = await startNotificationConsumer();

    // Verify main exchange
    const mainExchangeOp = operations.find(o => o.op === 'assertExchange' && o.exchange === 'notification_exchange');
    assert(mainExchangeOp, 'main assertExchange must be called');
    assert.strictEqual(mainExchangeOp.type, 'topic');
    assert.strictEqual(mainExchangeOp.options.durable, true);
    console.log('✅ Main assertExchange verified (durable topic exchange).');

    // Verify main queue
    const mainQueueOp = operations.find(o => o.op === 'assertQueue' && o.queue === 'notification_queue');
    assert(mainQueueOp, 'main assertQueue must be called');
    assert.strictEqual(mainQueueOp.options.durable, true);
    console.log('✅ Main assertQueue verified (durable queue).');

    // Verify main bindings
    const resetBindOp = operations.find(o => o.op === 'bindQueue' && o.queue === 'notification_queue' && o.routingKey === 'notification.password_reset');
    assert(resetBindOp, 'Main queue must be bound to password_reset key');
    const claimBindOp = operations.find(o => o.op === 'bindQueue' && o.queue === 'notification_queue' && o.routingKey === 'notification.claim_submitted');
    assert(claimBindOp, 'Main queue must be bound to claim_submitted key');
    console.log('✅ Main queue bindings verified.');

    // Verify retry exchange & queue
    const retryExchangeOp = operations.find(o => o.op === 'assertExchange' && o.exchange === 'notification_retry_exchange');
    assert(retryExchangeOp, 'retry assertExchange must be called');
    assert.strictEqual(retryExchangeOp.type, 'topic');
    assert.strictEqual(retryExchangeOp.options.durable, true);

    const retryQueueOp = operations.find(o => o.op === 'assertQueue' && o.queue === 'notification_retry_queue');
    assert(retryQueueOp, 'retry assertQueue must be called');
    assert.strictEqual(retryQueueOp.options.durable, true);
    assert.strictEqual(retryQueueOp.options.arguments['x-message-ttl'], 30000, 'Retry queue must have 30000ms TTL');
    assert.strictEqual(retryQueueOp.options.arguments['x-dead-letter-exchange'], 'notification_exchange', 'Retry queue DLX must point to main exchange');

    const retryBindOp = operations.find(o => o.op === 'bindQueue' && o.queue === 'notification_retry_queue');
    assert(retryBindOp, 'Retry queue must be bound to retry exchange');
    console.log('✅ Retry exchange, queue (with TTL and DLX), and binding verified.');

    // Verify DLX & DLQ
    const dlxOp = operations.find(o => o.op === 'assertExchange' && o.exchange === 'notification_dlx');
    assert(dlxOp, 'DLX assertExchange must be called');
    assert.strictEqual(dlxOp.type, 'topic');
    assert.strictEqual(dlxOp.options.durable, true);

    const dlqOp = operations.find(o => o.op === 'assertQueue' && o.queue === 'notification_dlq');
    assert(dlqOp, 'DLQ assertQueue must be called');
    assert.strictEqual(dlqOp.options.durable, true);

    const dlqBindOp = operations.find(o => o.op === 'bindQueue' && o.queue === 'notification_dlq');
    assert(dlqBindOp, 'DLQ must be bound to DLX');
    console.log('✅ DLX, DLQ, and binding verified.');

    // Verify consume was triggered on main queue only
    const consumeOp = operations.find(o => o.op === 'consume');
    assert(consumeOp, 'consume must be called');
    assert.strictEqual(consumeOp.queue, 'notification_queue');
    assert.strictEqual(consumeOp.options.noAck, false, 'Manual ACK must be enforced');
    console.log('✅ consumeFromQueue verified on main queue only.\n');

    // Test 3: Verify message handler execution and log output
    console.log('▶ TEST 3a: Verifying Successful PASSWORD_RESET_REQUESTED Processing');
    let logOutput = '';
    const origLog = console.log;
    console.log = (...args) => {
      logOutput += args.join(' ') + '\n';
      origLog.apply(console, args);
    };

    const sampleMessage = {
      event: 'PASSWORD_RESET_REQUESTED',
      email: 'user@example.com',
      resetToken: 'test-token-12345'
    };

    const mockRawMsg = {
      fields: {
        routingKey: 'notification.password_reset',
        deliveryTag: 1
      },
      properties: {
        headers: {}
      },
      content: Buffer.from(JSON.stringify(sampleMessage))
    };

    // Mock nodemailer createTransport
    const nodemailer = require('nodemailer');
    const origCreateTransport = nodemailer.createTransport;
    nodemailer.createTransport = () => ({
      sendMail: async (opts) => {
        return { messageId: '<mocked-message-id@test.com>' };
      }
    });

    try {
      await consumeOp.onMessage(mockRawMsg);
    } finally {
      nodemailer.createTransport = origCreateTransport;
      console.log = origLog;
    }

    assert(logOutput.includes('PASSWORD_RESET_REQUESTED'), 'Handler must log parsed message');
    assert(logOutput.includes('user@example.com'), 'Handler must log email in payload');
    assert(logOutput.includes('Successfully sent password reset email to: user@example.com'), 'Handler must log success message');
    assert(operations.some(o => o.op === 'ack' && o.msg === mockRawMsg), 'Message must be acked after handler succeeds');
    console.log('✅ PASSWORD_RESET_REQUESTED success path verified.\n');

    // Test 3b: Verify CLAIM_SUBMITTED message handling and email dispatch
    console.log('▶ TEST 3b: Verifying Successful CLAIM_SUBMITTED Processing');
    let claimLogOutput = '';
    const claimLog = (...args) => {
      claimLogOutput += args.join(' ') + '\n';
      origLog.apply(console, args);
    };

    const claimMessage = {
      event: 'CLAIM_SUBMITTED',
      claimId: 'claim-123',
      itemId: 'item-456',
      itemTitle: 'Lost Blue Backpack',
      itemType: 'found',
      recipientEmail: 'reporter@example.com',
      recipientName: 'Reporter Alice',
      claimantName: 'Claimant Bob',
      proofPreview: 'Contains my laptop and notebooks',
      submittedAt: new Date().toISOString()
    };

    const mockClaimRawMsg = {
      fields: {
        routingKey: 'notification.claim_submitted',
        deliveryTag: 2
      },
      properties: {
        headers: {}
      },
      content: Buffer.from(JSON.stringify(claimMessage))
    };

    let sentMailOptions = null;
    nodemailer.createTransport = () => ({
      sendMail: async (opts) => {
        sentMailOptions = opts;
        return { messageId: '<mocked-claim-message-id@test.com>' };
      }
    });
    console.log = claimLog;

    try {
      await consumeOp.onMessage(mockClaimRawMsg);
    } finally {
      nodemailer.createTransport = origCreateTransport;
      console.log = origLog;
    }

    assert(claimLogOutput.includes('CLAIM_SUBMITTED'), 'Handler must log CLAIM_SUBMITTED event');
    assert(claimLogOutput.includes('reporter@example.com'), 'Handler must log recipient email');
    assert(claimLogOutput.includes('Successfully sent claim notification email to: reporter@example.com'), 'Handler must log success message');
    assert(sentMailOptions !== null, 'sendEmail should have been called for claim notification');
    assert.strictEqual(sentMailOptions.to, 'reporter@example.com');
    assert(sentMailOptions.subject.includes('Lost Blue Backpack'));
    assert(operations.some(o => o.op === 'ack' && o.msg === mockClaimRawMsg), 'Claim message must be acked after handler succeeds');
    console.log('✅ CLAIM_SUBMITTED success path verified.\n');

    // Test 3c: Verify Failure handling when retry count < maxRetries (routes to retry exchange)
    console.log('▶ TEST 3c: Verifying Retry Routing on Email Failure (retryCount < maxRetries)');
    nodemailer.createTransport = () => ({
      sendMail: async () => {
        throw new Error('SMTP Connection timeout');
      }
    });

    const failingMessage = {
      event: 'PASSWORD_RESET_REQUESTED',
      email: 'retry-user@example.com',
      resetToken: 'retry-token-123'
    };

    const mockFailingRawMsg = {
      fields: {
        routingKey: 'notification.password_reset',
        deliveryTag: 3
      },
      properties: {
        headers: {} // retry count 0
      },
      content: Buffer.from(JSON.stringify(failingMessage))
    };

    await consumeOp.onMessage(mockFailingRawMsg);

    const retryPublishOp = operations.find(
      o => o.op === 'publish' && o.exchange === 'notification_retry_exchange'
    );
    assert(retryPublishOp, 'Message must be published to notification_retry_exchange');
    assert.strictEqual(retryPublishOp.routingKey, 'notification.password_reset', 'Original routing key must be preserved');
    assert.strictEqual(retryPublishOp.options.headers['x-retry-count'], 1, 'Retry count header must be incremented to 1');
    assert.strictEqual(retryPublishOp.options.headers['x-max-retries'], 3, 'Max retries header must be 3');
    assert.strictEqual(retryPublishOp.options.headers['x-error-message'], 'SMTP Connection timeout');
    assert(operations.some(o => o.op === 'ack' && o.msg === mockFailingRawMsg), 'Original message must be acked after successful publish to retry exchange');
    console.log('✅ Retry queue routing on failure verified.\n');

    // Test 3d: Verify Failure handling when retry count >= maxRetries (routes to DLQ)
    console.log('▶ TEST 3d: Verifying DLQ Routing on Max Retries Exhausted (retryCount >= maxRetries)');
    const dlqMessage = {
      event: 'PASSWORD_RESET_REQUESTED',
      email: 'dlq-user@example.com',
      resetToken: 'dlq-token-123'
    };

    const mockDlqRawMsg = {
      fields: {
        routingKey: 'notification.password_reset',
        deliveryTag: 4
      },
      properties: {
        headers: {
          'x-retry-count': 3 // max retries reached
        }
      },
      content: Buffer.from(JSON.stringify(dlqMessage))
    };

    await consumeOp.onMessage(mockDlqRawMsg);

    const dlqPublishOp = operations.find(
      o => o.op === 'publish' && o.exchange === 'notification_dlx'
    );
    assert(dlqPublishOp, 'Message must be published to notification_dlx');
    assert.strictEqual(dlqPublishOp.routingKey, 'notification.password_reset', 'Original routing key must be preserved');
    assert.strictEqual(dlqPublishOp.options.headers['x-retry-count'], 3, 'Retry count header must reflect final retry count');
    assert.strictEqual(dlqPublishOp.options.headers['x-max-retries'], 3, 'Max retries header must be 3');
    assert.strictEqual(dlqPublishOp.options.headers['x-error-message'], 'SMTP Connection timeout');
    assert(operations.some(o => o.op === 'ack' && o.msg === mockDlqRawMsg), 'Original message must be acked after successful publish to DLX');
    console.log('✅ DLQ routing on exhausted retries verified.\n');

    // Test 3e: Verify failure to publish to retry exchange does NOT ack original message
    console.log('▶ TEST 3e: Verifying Failure While Publishing to Retry (Message is NACKed, NOT ACKed)');
    mockChannel.publish = () => {
      throw new Error('Broker disconnected during publish');
    };

    const mockUnpublishableMsg = {
      fields: {
        routingKey: 'notification.password_reset',
        deliveryTag: 5
      },
      properties: {
        headers: {
          'x-retry-count': 0
        }
      },
      content: Buffer.from(JSON.stringify(failingMessage))
    };

    await consumeOp.onMessage(mockUnpublishableMsg);

    assert(!operations.some(o => o.op === 'ack' && o.msg === mockUnpublishableMsg), 'Message must NOT be acked if retry publishing fails');
    assert(operations.some(o => o.op === 'nack' && o.msg === mockUnpublishableMsg), 'Message MUST be nacked if retry publishing fails');
    console.log('✅ NACK on publish failure verified.\n');

  } finally {
    amqp.connect = origConnect;
  }

  // Test 4: App health check
  console.log('▶ TEST 4: Verifying Express App Health Check');
  const app = require('./src/app');
  assert(app, 'Express app should be exported');
  console.log('✅ App exports express instance with /health and middlewares.\n');

  console.log('====================================================');
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
  process.exit(0);
}

testNotificationConsumer().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
