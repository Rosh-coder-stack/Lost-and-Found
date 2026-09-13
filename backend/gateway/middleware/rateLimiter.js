const { getRedisClient } = require('../config/redis');

/**
 * Helper to safely extract client IP address
 */
const getClientIp = (req) => {
  let ip = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
  if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }
  return ip;
};


/**
 * Reusable Redis-based distributed Rate Limiting Middleware Factory
 *
 * @param {Object} options
 * @param {string} [options.keyPrefix='rate-limit:'] - Redis key prefix (e.g. 'rate-limit:', 'login-rate-limit:')
 * @param {number} [options.maxRequests=20] - Maximum requests allowed per window
 * @param {number} [options.windowSeconds=60] - Window duration in seconds
 * @param {string} [options.message='Too many requests. Please try again later.'] - Response message on 429
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (options = {}) => {
  const {
    keyPrefix = 'rate-limit:',
    maxRequests = 20,
    windowSeconds = 60,
    message = 'Too many requests. Please try again later.',
  } = options;

  return async (req, res, next) => {
    try {
      const redisClient = getRedisClient();

      // Fail-Open Strategy: If Redis client is not available or not connected,
      // log warning and allow the request to proceed without interruption.
      if (!redisClient || !redisClient.isOpen) {
        console.warn(`[RateLimiter] Redis not open/connected for key prefix "${keyPrefix}". Failing open.`);
        return next();
      }

      const clientIp = getClientIp(req);
      const key = `${keyPrefix}${clientIp}`;

      // Atomic counter increment using Redis INCR
      const currentCount = await redisClient.incr(key);

      // Set expiration only on the first request of the time window
      if (currentCount === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      // Populate RateLimit HTTP headers
      const remaining = Math.max(0, maxRequests - currentCount);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);

      // Check if threshold is exceeded
      if (currentCount > maxRequests) {
        console.warn(`[RateLimiter] Rate limit exceeded for IP ${clientIp} on key "${key}" (${currentCount}/${maxRequests})`);
        return res.status(429).json({
          success: false,
          message,
        });
      }

      return next();
    } catch (error) {
      // Fail-Open Strategy: Log Redis error and continue without blocking user requests
      console.error(`[RateLimiter] Redis error encountered (${keyPrefix}): ${error.message}. Failing open.`);
      return next();
    }
  };
};

module.exports = {
  createRateLimiter,
  getClientIp,
};
