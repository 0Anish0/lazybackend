require('dotenv').config();
const cors = require('cors');
const express = require('express');
const connectDB = require('./utils/db');
const authRoutes = require('./apiRoutes');

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Enable CORS
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
app.use(cors(corsOptions));

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
