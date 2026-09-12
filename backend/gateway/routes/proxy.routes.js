// Proxy Routes: Configures proxy forwarding rules using http-proxy-middleware.
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware'); // helps in forwarding requests to different services from the API Gateway
const config = require('../config');
const { createRateLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// 1. Normal API Rate Limiter (20 requests per minute per client IP)
const apiRateLimiter = createRateLimiter({
  keyPrefix: 'rate-limit:',
  maxRequests: 20,
  windowSeconds: 60,
  message: 'Too many requests. Please try again later.',
});

// 2. Strict Login Rate Limiter (4 login attempts per 5 minutes per client IP)
const loginRateLimiter = createRateLimiter({
  keyPrefix: 'login-rate-limit:',
  maxRequests: 4,
  windowSeconds: 300,
  message: 'Too many login attempts. Please try again later.',
});

/**
 * Auth Service Proxy
 * Proxies all requests matching '/api/v1/auth' to http://localhost:5001 (or AUTH_SERVICE_URL env var).
 * Preserves the original path (/api/v1/auth/...) when forwarding.
 */
const authProxy = createProxyMiddleware({
  target: config.authServiceUrl,
  changeOrigin: true, // auth service feels like the request is coming directly to it
  pathRewrite: (path, req) => req.originalUrl,
  on: { // Event handlers for proxy events
    proxyReq: (proxyReq, req) => { 
      // Log forwarding event for visibility
      console.log(`[Proxy] Forwarding ${req.method} ${req.originalUrl} -> ${config.authServiceUrl}${req.originalUrl}`);
    },
    error: (err, req, res) => {
      console.error(`[Proxy Error] Unable to connect to Auth Service at ${config.authServiceUrl}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({
          status: 'Error',
          message: 'Bad Gateway: Auth Service is unavailable',
        });
      }
    },
  },
});

/**
 * Item Service Proxy
 * Proxies all requests matching '/api/v1/items' to http://localhost:5002 (or ITEM_SERVICE_URL env var).
 * Preserves the original path (/api/v1/items/...) when forwarding.
 */
const itemProxy = createProxyMiddleware({
  target: config.itemServiceUrl,
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(`[Proxy] Forwarding ${req.method} ${req.originalUrl} -> ${config.itemServiceUrl}${req.originalUrl}`);
    },
    error: (err, req, res) => {
      console.error(`[Proxy Error] Unable to connect to Item Service at ${config.itemServiceUrl}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({
          status: 'Error',
          message: 'Bad Gateway: Item Service is unavailable',
        });
      }
    },
  },
});

/**
 * Claim Service Proxy
 * Proxies all requests matching '/api/v1/claims' to http://localhost:5003 (or CLAIM_SERVICE_URL env var).
 * Preserves the original path (/api/v1/claims/...) when forwarding.
 */
const claimProxy = createProxyMiddleware({
  target: config.claimServiceUrl,
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(`[Proxy] Forwarding ${req.method} ${req.originalUrl} -> ${config.claimServiceUrl}${req.originalUrl}`);
    },
    error: (err, req, res) => {
      console.error(`[Proxy Error] Unable to connect to Claim Service at ${config.claimServiceUrl}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({
          status: 'Error',
          message: 'Bad Gateway: Claim Service is unavailable',
        });
      }
    },
  },
});

// Apply Normal API Rate Limiting to all /api/v1 routes passing through the gateway
router.use('/api/v1', apiRateLimiter);

// Apply Stricter Login Rate Limiting specifically to the login endpoint
router.post('/api/v1/auth/login', loginRateLimiter);

// Mount the proxy middleware onto the router
router.use('/api/v1/auth', authProxy);
router.use('/api/v1/items', itemProxy);
router.use('/api/v1/claims', claimProxy);

module.exports = router;