require('dotenv').config();
const express = require('express');
const connectDB = require('./utils/db');
const authRoutes = require('./apiRoutes');
const cors = require('cors');
const multer = require('multer');  // Ensure multer is imported
const upload = multer({ storage: multer.memoryStorage() }).single('live_image');  // Memory storage

const app = express();
app.use(express.json());  // This is for parsing JSON bodies
app.use(express.urlencoded({ extended: true }));  // This is for parsing URL-encoded data, especially for form-data

// Connect to MongoDB
connectDB();

// Enable CORS
const corsOptions = {
    origin: 'https://lazycrazyy.netlify.app', // Your frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  };
app.use(cors(corsOptions));

// Routes
// Apply multer upload as middleware for your API that handles file upload
app.post('/api/signup', upload, authRoutes);  // Use multer middleware here
app.use('/api', authRoutes);  // Make sure your other routes are defined after multer

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});