require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const authRoutes = require('./apiRoutes');
const multer = require('multer');  // Ensure multer is imported
const upload = multer({ storage: multer.memoryStorage() }).single('live_image');  // Memory storage

// Connect to MongoDB
connectDB();
const app = express();
app.use(cors());
app.use(express.json());  // For parsing JSON bodies
app.use(express.urlencoded({ extended: true }));  // For parsing URL-encoded data, especially for form-data

// Routes
// Apply multer upload as middleware for your API that handles file upload
app.post('/api/signup', upload, authRoutes);  // Use multer middleware here
app.use('/api', authRoutes);  // Define other routes after multer

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
