// Proxy Routes: Configures proxy forwarding rules using http-proxy-middleware.
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware'); // helps in forwarding requests to different services from the API Gateway
const config = require('../config');
const router = express.Router();

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

// Mount the proxy middleware onto the router
router.use('/api/v1/auth', authProxy);
router.use('/api/v1/items', itemProxy);

module.exports = router;