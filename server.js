const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const tasksRouter = require('./routes/tasks');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: 'Something went wrong!'
  });
});

app.use('/api/tasks', tasksRouter);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS enabled for origins: http://localhost:3000, http://localhost:3001');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please make sure no other instance is running.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
