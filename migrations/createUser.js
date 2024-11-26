// migrations/createUser.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createUser = async () => {
  try {
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    if (existingUser) return console.log('User already exists');

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);

    const user = new User({
        "first_name": "Lzy",
        "last_name": "Crazy",
        "mobile": "9876543213",
        "password": "admin@123",
        "country": "INDIA",
        "state": "Uttar Pradesh",
        "city": "Noida",
    });

    await user.save();
    console.log('Admin user created');
  } catch (error) {
    console.error('Error creating user', error);
  }
};

createUser();
