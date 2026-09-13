const express = require('express');
const cors = require('cors');
const passport = require('passport');
const configurePassport = require('../config/passport');
const authRoutes = require('../routes/authRoutes');
const googleAuthRoutes = require('../routes/googleAuthRoutes');

const app = express();

// Initialize Passport strategy configuration
configurePassport();
app.use(passport.initialize());

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Auth Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auth', googleAuthRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Auth Service is active' });
});

module.exports = app;
