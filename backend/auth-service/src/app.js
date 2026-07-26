const express = require('express');

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app;
