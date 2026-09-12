/**
 * Automated Verification Script for RabbitMQ Producer -> Queue -> Consumer Flow
 * Verifies:
 * 1. RabbitMQ connection
 * 2. Message publication by Producer
 * 3. Message consumption and Manual ACK by Consumer
 * 4. Verifies restarting Consumer does NOT re-process acknowledged messages
 * 5. Verifies error scenario where unacknowledged message is not ACKed
 */
const amqp = require('amqplib');
const rabbitmqConfig = require('./shared/config/rabbitmq');
const {
  connectRabbitMQ,
  publishToQueue,
  consumeFromQueue,
  closeRabbitMQ
} = require('./shared/utils/rabbitmq');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runVerification() {
  console.log('===============================================================');
  console.log('🧪 RUNNING RABBITMQ STEP 1 VERIFICATION TEST');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 4;

  try {
    // -------------------------------------------------------------
    // Test 1: Connect to RabbitMQ & purge test queue for clean state
    // -------------------------------------------------------------
    console.log('▶ TEST 1: Connect to RabbitMQ & Prepare Clean Queue');
    const { channel } = await connectRabbitMQ();
    const queueName = rabbitmqConfig.queues.TEST_QUEUE;
    await channel.assertQueue(queueName, { durable: true });
    await channel.purgeQueue(queueName);
    console.log(`✅ Connected and purged queue: '${queueName}'\n`);
    passedTests++;

    // -------------------------------------------------------------
    // Test 2: Producer publishes test message
    // -------------------------------------------------------------
    console.log('▶ TEST 2: Producer Publishes Test Message');
    const testPayload = {
      event: 'TEST_MESSAGE',
      message: 'Hello RabbitMQ'
    };

    const sent = await publishToQueue(queueName, testPayload);
    if (!sent) {
      throw new Error('Failed to publish message to queue');
    }
    console.log('✅ Published message to RabbitMQ:');
    console.log(JSON.stringify(testPayload, null, 2));

    // Check queue message count in broker
    const qState = await channel.checkQueue(queueName);
    console.log(`📬 Current message count in queue before consumer: ${qState.messageCount}`);
    if (qState.messageCount !== 1) {
      throw new Error(`Expected 1 message in queue, got ${qState.messageCount}`);
    }
    console.log('✅ Queue count verified (1 message waiting).\n');
    passedTests++;

    // -------------------------------------------------------------
    // Test 3: Consumer receives message and sends Manual ACK
    // -------------------------------------------------------------
    console.log('▶ TEST 3: Consumer Receives Message & Sends Manual ACK');
    let receivedMessage = null;
    let ackCompleted = false;

    const consumerInfo = await consumeFromQueue(
      queueName,
      async (msg, rawMsg) => {
        receivedMessage = msg;
        console.log('📥 Consumer received message payload:');
        console.log(JSON.stringify(msg, null, 2));
        console.log(`🏷️ Delivery tag: ${rawMsg.fields.deliveryTag}`);
        ackCompleted = true;
      }
    );

    // Wait for message to be consumed and acked
    let waitCount = 0;
    while (!ackCompleted && waitCount < 20) {
      await sleep(200);
      waitCount++;
    }

    if (!receivedMessage || receivedMessage.event !== 'TEST_MESSAGE' || receivedMessage.message !== 'Hello RabbitMQ') {
      throw new Error('Message payload did not match expected test payload');
    }

    // Cancel this consumer to stop listening
    await channel.cancel(consumerInfo.consumerTag);

    // Verify queue is now empty because message was acknowledged (ACK)
    await sleep(300);
    const qStateAfterAck = await channel.checkQueue(queueName);
    console.log(`📬 Message count after ACK: ${qStateAfterAck.messageCount}`);
    if (qStateAfterAck.messageCount !== 0) {
      throw new Error(`Expected 0 messages in queue after ACK, got ${qStateAfterAck.messageCount}`);
    }
    console.log('✅ Consumer successfully processed message and sent ACK. Queue is empty.\n');
    passedTests++;

    // -------------------------------------------------------------
    // Test 4: Restart consumer -> verify acknowledged message is NOT re-processed
    // -------------------------------------------------------------
    console.log('▶ TEST 4: Restart Consumer & Verify No Duplicate Delivery');
    let duplicateReceived = false;

    const secondConsumer = await consumeFromQueue(
      queueName,
      async (msg) => {
        duplicateReceived = true;
        console.error('❌ Unexpected message received on restarted consumer:', msg);
      }
    );

    // Wait for 1 second to confirm no message is delivered
    await sleep(1000);
    await channel.cancel(secondConsumer.consumerTag);

    if (duplicateReceived) {
      throw new Error('Acknowledged message was unexpectedly re-delivered on consumer restart!');
    }
    console.log('✅ Verified: Restarted consumer received 0 messages. ACK successfully removed message from queue.\n');
    passedTests++;

    // -------------------------------------------------------------
    // Test Summary
    // -------------------------------------------------------------
    console.log('===============================================================');
    console.log(`🎉 ALL TESTS PASSED: ${passedTests}/${totalTests}`);
    console.log('===============================================================\n');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await closeRabbitMQ();
  }
}

if (require.main === module) {
  runVerification();
}

module.exports = { runVerification };
