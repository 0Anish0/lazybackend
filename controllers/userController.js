const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');
const express = require('express');
const multer = require('multer'); // For handling file uploads
const { uploadImage, deleteImage } = require('../helpers/cloudinaryHelper');

// For storing OTP temporarily (can use a cache like Redis for production)
let otpStore = {}; 
// Set up multer for temporary file storage
const upload = multer({ dest: 'uploads/' });

// **Signup Controller**
const signup = async (req, res) => {
  try {
    console.log('Body:', req.body); // Capture text fields
    console.log('File:', req.file); // Capture file details
    // Validation for signup fields
    await check('first_name', 'First name is required').notEmpty().run(req);
    await check('last_name', 'Last name is required').notEmpty().run(req);
    await check('mobile', 'Invalid mobile number').isMobilePhone().run(req);
    await check('password', 'Password should be at least 6 characters').isLength({ min: 6 }).run(req);
    await check('gender', 'Gender is required').isIn(['male', 'female', 'other']).run(req);
    await check('country', 'Country is required').notEmpty().run(req);
    await check('state', 'State is required').notEmpty().run(req);
    await check('city', 'City is required').notEmpty().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, mobile, password, gender, country, state, city } = req.body;

    // Check if the mobile number already exists in the database
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      return res.status(400).json({ message: 'Mobile number is already in use' });
    }

    // Check if a file is provided for the live image
    if (!req.file) {
      return res.status(400).json({ message: 'Live image is required' });
    }

    // Upload the live image to Cloudinary
    let liveImageUrl;
    const filePath = req.file.path; // Path of the uploaded file
    try {
      const cloudinaryResponse = await uploadImage(filePath, { folder: 'live_images' });
      liveImageUrl = cloudinaryResponse.url;
    } catch (uploadError) {
      fs.unlinkSync(filePath); // Remove the temporary file
      return res.status(500).json({ message: 'Failed to upload live image', error: uploadError.message });
    }

    // Clean up the temporary file
    fs.unlinkSync(filePath);

    // Generate unique user ID
    const userId = `${first_name.slice(0, 2).toLowerCase()}${moment().format('MMYYYYDDHHmmss')}`;

    // Create and save the new user
    const newUser = new User({
      first_name,
      last_name,
      mobile,
      password,
      gender,
      country,
      state,
      city,
      live_image: liveImageUrl, // Save Cloudinary URL
      user_id: userId,
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// **Login Controller (Mobile OTP)**
const login = async (req, res) => {
  const { mobile, password, otp } = req.body;

  // Validate mobile number
  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  try {
    // Validation for login fields
    await check('mobile', 'Invalid mobile number').isMobilePhone().run(req);

    if (password) {
      await check('password', 'Password is required').notEmpty().run(req);
    }

    if (otp) {
      await check('otp', 'OTP is required').notEmpty().run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Case 1: Login with Mobile and Password
    if (password) {
      const user = await User.findOne({ mobile });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
      // Check if password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      // Generate JWT Token
      const token = jwt.sign(
        { userId: user.user_id, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: '6h' }
      );

      return res.status(200).json({ token, message: 'Login successful' });
    }

    // Case 2: Login with Mobile and OTP
    // else if (otp) {
    //   // Check if OTP exists for the mobile number and if it has expired
    //   if (!otpStore[mobile] || otpStore[mobile].otp !== otp || otpStore[mobile].expiresAt < Date.now()) {
    //     return res.status(400).json({ message: 'Invalid or expired OTP' });
    //   }

    //   // OTP is valid, generate JWT token
    //   const user = await User.findOne({ mobile });
    //   if (!user) {
    //     return res.status(400).json({ message: 'User not found' });
    //   }

    //   const token = jwt.sign(
    //     { userId: user.user_id, role: user.role },
    //     process.env.JWT_SECRET_KEY,
    //     { expiresIn: '1h' }
    //   );

    //   // Clean up OTP store after use
    //   delete otpStore[mobile];

    //   return res.status(200).json({ token, message: 'Login successful' });
    // } 
    else {
      return res.status(400).json({ message: 'Either password or OTP is required for login' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// **Send OTP Controller**
const sendOtp = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: 'Mobile number is required' });
  }

  try {
    await check('mobile', 'Invalid mobile number').isMobilePhone().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ message: 'Error sending OTP' });
  }
};

// **Forget Password Controller**
const forgetPassword = async (req, res) => {
  const { mobile, otp, live_image, new_password } = req.body;

  // Validate fields for forget password
  await check('mobile', 'Invalid mobile number').isMobilePhone().run(req);
  await check('otp', 'OTP is required').notEmpty().run(req);
  await check('new_password', 'New password should be at least 6 characters').isLength({ min: 6 }).run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (otp === process.env.OTP || otpStore[mobile] === otp) {
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = new_password;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(400).json({ message: 'Invalid OTP' });
  }
};

// **User Dashboard Controller**
const dashboard = async (req, res) => {
  try {
    // Count the total number of users in the database
    const totalUsers = await User.countDocuments();

    // Aggregate user counts per month (1 to 12 for Jan to Dec)
    const monthlyUserStats = await User.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' }, // Group by month from createdAt field
          count: { $sum: 1 },  // Count the number of users in each month
        },
      },
      { $sort: { '_id': 1 } }, // Sort by month (1 = January, 2 = February, etc.)
    ]);

    // Month names for reference
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    // Fill in the missing months (if a month has no users, it won't show in the result)
    const userStatsPerMonth = {};
    for (let i = 1; i <= 12; i++) {
      // Check if the month exists in the aggregated data
      const monthStat = monthlyUserStats.find(stat => stat._id === i);
      if (monthStat) {
        userStatsPerMonth[monthNames[i - 1]] = monthStat.count;
      } else {
        userStatsPerMonth[monthNames[i - 1]] = 0;
      }
    }

    // Return total users and the monthly statistics with month names as keys
    res.json({
      totalUsers,
      monthlyUserStats: userStatsPerMonth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  signup,
  login,
  sendOtp,
  forgetPassword,
  dashboard,
};
