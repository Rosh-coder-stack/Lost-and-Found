const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Auth Routes
app.use('/api/v1/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Auth Service is active' });
});

module.exports = app;
