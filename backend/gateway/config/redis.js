const { createClient } = require('redis');

let redisClient = null;

/**
 * Returns the singleton Redis client instance.
 * Initializes the client if it has not been created yet.
 */
const getRedisClient = () => {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.warn('[Gateway] Redis max reconnection attempts reached. Continuing with fail-open fallback.');
            return false;
          }
          return Math.min(retries * 500, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error(`[Gateway] Redis Client Error: ${err.message}`);
    });

    redisClient.on('connect', () => {
      console.log('[Gateway] Redis connected');
    });

    redisClient.on('ready', () => {
      console.log('[Gateway] Redis client ready to accept commands');
    });

    redisClient.on('reconnecting', () => {
      console.log('[Gateway] Redis reconnecting...');
    });
  }

  return redisClient;
};

/**
 * Connects to Redis. Does not terminate the process if connection fails,
 * allowing the Gateway to fail open gracefully.
 */
const connectRedis = async () => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch (error) {
    console.error(`[Gateway] Failed to connect to Redis: ${error.message}. Continuing with fail-open fallback.`);
    return null;
  }
};

module.exports = {
  getRedisClient,
  connectRedis,
};
