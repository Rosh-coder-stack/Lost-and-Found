/**
 * Test Consumer for RabbitMQ
 * Consumes messages from 'test_queue' with manual acknowledgment (ACK)
 */
const { connectRabbitMQ, consumeFromQueue, closeRabbitMQ } = require('./shared/utils/rabbitmq');
const rabbitmqConfig = require('./shared/config/rabbitmq');

async function runConsumer() {
  console.log('====================================================');
  console.log('📥 RABBITMQ TEST CONSUMER');
  console.log('====================================================');
  console.log(`📡 Broker URL : ${rabbitmqConfig.url}`);
  console.log(`📬 Listening Queue: ${rabbitmqConfig.queues.TEST_QUEUE}`);
  console.log(`⚙️ Mode        : Manual Acknowledgement (ACK)\n`);

  try {
    console.log('⏳ Connecting to RabbitMQ broker...');
    await connectRabbitMQ();
    console.log('✅ Connected to RabbitMQ successfully.');
    console.log('👀 Waiting for messages in queue... (Press Ctrl+C to exit)\n');

    await consumeFromQueue(
      rabbitmqConfig.queues.TEST_QUEUE,
      async (message, rawMsg) => {
        console.log('----------------------------------------------------');
        console.log('📬 [MESSAGE RECEIVED]');
        console.log(`Timestamp : ${new Date().toISOString()}`);
        console.log(`DeliveryTag: ${rawMsg.fields.deliveryTag}`);
        console.log(`Payload   :`);
        console.log(JSON.stringify(message, null, 2));

        // Processing validation
        if (!message || typeof message !== 'object') {
          throw new Error('Invalid message format received.');
        }

        // Processing simulation / logging
        console.log('⚙️ Processing message...');
        console.log(`   Event Type : ${message.event}`);
        console.log(`   Content    : ${message.message}`);
        console.log('✅ Processing completed successfully.');

        // The shared consumeFromQueue wrapper sends ch.ack(rawMsg) right after this function resolves
        console.log(`🏷️ [ACK SENT] Acknowledged deliveryTag: ${rawMsg.fields.deliveryTag}`);
        console.log('----------------------------------------------------\n');
      }
    );

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('\n🛑 Shutting down consumer...');
      await closeRabbitMQ();
      console.log('👋 Consumer stopped.');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('\n❌ [CONSUMER ERROR] Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runConsumer();
}

module.exports = { runConsumer };
