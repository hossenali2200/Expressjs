const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const expressMongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const validator = require('validator');

// Load environment variables from config.env using dotenv
dotenv.config();

const app = express();

// Apply security middleware
app.use(helmet()); // Set various HTTP headers for security
app.use(cors()); // Enable Cross-Origin Resource Sharing (CORS)
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse cookies

// MongoDB connection setup (assuming you have MongoDB and mongoose set up)
const mongoURI = process.env.MONGO_URI; // Define your MongoDB connection string in config.env
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sanitize data to prevent MongoDB injection
app.use(expressMongoSanitize());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Prevent HTTP Parameter Pollution (hpp)
app.use(hpp());

// Validate request data using the 'validator' library
app.use((req, res, next) => {
  // Example validation
  if (!validator.isEmail(req.body.email)) {
    return res.status(400).json({ status: 'error', message: 'Invalid email address' });
  }
  // Add more validation as needed for your specific routes and data
  next();
});

// Define your API routes here (import them from Routes/api.js)

// Example API route
app.use('/api/users', require('./src/Routes/api'));

// Undefined route handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

module.exports = app;
