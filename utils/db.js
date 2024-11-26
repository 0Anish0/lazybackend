const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // Check if the admin user exists on server startup
        checkAndCreateAdminUser();
        // await mongoose.connection.db.collection('users').drop();
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;