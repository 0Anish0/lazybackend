require('dotenv').config();
const cors = require('cors');
const express = require('express');
const connectDB = require('./utils/db');

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Enable CORS
app.use(cors());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
