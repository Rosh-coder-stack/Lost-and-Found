// App configuration module: sets up Express middleware, CORS, logging, routes, and proxies.
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const healthRoutes = require('../routes/health.routes');
const proxyRoutes = require('../routes/proxy.routes');

const app = express();

// Enable trust proxy for reverse proxies / load balancers
app.set('trust proxy', 1);

// 1. Enable Cross-Origin Resource Sharing (CORS) for all incoming origins
app.use(cors());

// 2. Add HTTP request logging using Morgan ('dev' format provides colored concise status logs)
app.use(morgan('dev'));

// 3. Mount microservice proxy routes BEFORE body-parsing middleware
// Placing proxy routes before express.json() ensures request streams (e.g. POST/PUT bodies) remain intact for proxy forwarding.
app.use(proxyRoutes);

// 4. Enable JSON and URL-encoded request body parsing for Gateway's own endpoints
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Mount health check endpoint at /health
app.use('/health', healthRoutes);

// 6. Fallback handler for unmatched non-proxied routes (404 Not Found)
app.use((req, res) => {
  res.status(404).json({
    status: 'Error',
    message: `Route ${req.originalUrl} not found on API Gateway`,
  });
});

module.exports = app;
