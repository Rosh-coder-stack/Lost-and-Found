const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const claimRoutes = require('../routes/claim.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Claim Routes
app.use('/api/v1/claims', claimRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Claim Service is active' });
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found on Claim Service`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Claim Service Global Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
