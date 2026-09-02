const dotenv = require('dotenv');
dotenv.config();

const rabbitmqConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  queues: {
    TEST_QUEUE: process.env.RABBITMQ_TEST_QUEUE || 'test_queue'
  },
  connectionOptions: {
    heartbeat: 60
  }
};

module.exports = rabbitmqConfig;
