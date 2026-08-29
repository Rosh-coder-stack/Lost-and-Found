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
            console.warn('[Item Service] Redis max reconnection attempts reached. Continuing with MongoDB fallback.');
            return false;
          }
          return Math.min(retries * 500, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error(`[Item Service] Redis Client Error: ${err.message}`);
    });

    redisClient.on('connect', () => {
      console.log('[Item Service] Redis connected');
    });

    redisClient.on('ready', () => {
      console.log('[Item Service] Redis client ready to accept commands');
    });

    redisClient.on('reconnecting', () => {
      console.log('[Item Service] Redis reconnecting...');
    });
  }

  return redisClient;
};

/**
 * Connects to Redis. Does not terminate the process if connection fails,
 * allowing the service to gracefully fall back to MongoDB.
 */
const connectRedis = async () => {
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch (error) {
    console.error(`[Item Service] Failed to connect to Redis: ${error.message}. Continuing with MongoDB fallback.`);
    return null;
  }
};

module.exports = {
  getRedisClient,
  connectRedis,
};
