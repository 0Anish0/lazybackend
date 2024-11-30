const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const User = require('../models/User');
const moment = require('moment');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        // await mongoose.connection.db.collection('users').drop();

        // Check if the admin user exists on server startup
        checkAndCreateAdminUser();
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

// Function to check and create the default admin user
async function checkAndCreateAdminUser() {
    try {
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        console.log('Admin user not found');
        const yearMonth = moment().format('YYMM'); // Current year and month
        const userId = `Lz${yearMonth}0001`;
        // Create a default admin user
        const newAdmin = new User({
          first_name: 'Lzy',
          last_name: 'Crazy',
          mobile: '1234567899', // Provide a mobile number
          password: 'lzyadmin@123',
          gender: 'male',
          country: 'INDIA',
          state: 'Uttar Pradesh',
          city: 'Noida',
          live_image: 'your-image-url',
          role: 'admin',
          user_id: userId // Or generate a unique user ID
        });
  
        await newAdmin.save();
        console.log('admin user created successfully');
      } else {
        console.log('Admin user already exists');
      }
    } catch (error) {
      console.error('Error checking/creating admin user:', error);
    }
}

module.exports = connectDB;