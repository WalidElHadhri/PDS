const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/projects', require('./routes/collaborators'));
app.use('/api/projects', require('./routes/versions'));
app.use('/api/projects', require('./routes/documentation'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to MongoDB
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pds');
    console.log('Connected to MongoDB');

    // Only start listening when not in a test environment. Tests will connect to the DB
    // but should not bind to a network port to avoid conflicts.
    if (process.env.NODE_ENV !== 'test' && require.main === module) {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // In test environments, throw so tests can surface the error
    if (process.env.NODE_ENV === 'test') throw error;
    process.exit(1);
  }
};

// Start server (connect to DB). This runs on import.
startServer();

module.exports = app;
