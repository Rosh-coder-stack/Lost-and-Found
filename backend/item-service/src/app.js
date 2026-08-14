const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const itemRoutes = require('../routes/item.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev')); // Logging middleware for HTTP requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Item Routes
app.use('/api/v1/items', itemRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Item Service is active' });
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on Item Service`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Item Service Global Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
