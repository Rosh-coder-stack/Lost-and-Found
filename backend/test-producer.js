/**
 * Test Producer for RabbitMQ
 * Publishes a test message to the 'test_queue'
 */
const { connectRabbitMQ, publishToQueue, closeRabbitMQ } = require('./shared/utils/rabbitmq');
const rabbitmqConfig = require('./shared/config/rabbitmq');

async function runProducer() {
  console.log('====================================================');
  console.log('🚀 RABBITMQ TEST PRODUCER');
  console.log('====================================================');
  console.log(`📡 Broker URL : ${rabbitmqConfig.url}`);
  console.log(`📬 Target Queue: ${rabbitmqConfig.queues.TEST_QUEUE}\n`);

  try {
    console.log('⏳ Connecting to RabbitMQ broker...');
    await connectRabbitMQ();
    console.log('✅ Connected to RabbitMQ successfully.\n');

    const testMessage = {
      event: 'TEST_MESSAGE',
      message: 'Hello RabbitMQ'
    };

    console.log('📤 Publishing test message:');
    console.log(JSON.stringify(testMessage, null, 2));

    const published = await publishToQueue(
      rabbitmqConfig.queues.TEST_QUEUE,
      testMessage
    );

    if (published) {
      console.log('\n✅ [PRODUCER SUCCESS] Message sent to queue successfully!');
    } else {
      console.warn('\n⚠️ [PRODUCER WARNING] Message write returned false (buffer full).');
    }

    // Allow time for channel buffer to flush before closing
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (error) {
    console.error('\n❌ [PRODUCER ERROR] Failed to publish message:', error.message);
    process.exit(1);
  } finally {
    console.log('🔒 Closing connection...');
    await closeRabbitMQ();
    console.log('👋 Producer finished.\n');
  }
}

if (require.main === module) {
  runProducer();
}

module.exports = { runProducer };
