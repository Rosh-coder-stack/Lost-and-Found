require('dotenv').config();
const app = require('./app');
const connectDB = require('../config/db');

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Claim Service] Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`[Claim Service] Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
