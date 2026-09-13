const dns = require('dns');

// Configure public DNS servers to resolve MongoDB Atlas SRV records reliably on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore fallback error if DNS modification fails
}

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[Item Service] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Item Service] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
