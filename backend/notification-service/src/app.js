const express = require('express');
const cors = require('cors');
const healthRoutes = require('../routes/health.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Notification Service is active' });
});

// Mount routes
app.use('/api/v1/notifications', healthRoutes);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on Notification Service`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Notification Service Global Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
