const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const User = require('../models/User');
const { check, validationResult } = require('express-validator');

// List all users
const listUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false, role: { $ne: 'admin' } }); // Only non-deleted users
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({status:false, message: 'Server error' });
  }
};

// Create a user
const createUser = [
  // Validation middleware
  check('first_name', 'First name is required').notEmpty(),
  check('last_name', 'Last name is required').notEmpty(),
  check('mobile', 'Invalid mobile number').isMobilePhone(),
  check('mobile').custom(async (value) => {
    const user = await User.findOne({ mobile: value });
    if (user) {
      throw new Error('Mobile number already in use');
    }
  }),
  check('password', 'Password should be at least 6 characters').isLength({ min: 6 }),
  check('gender', 'Gender is required').isIn(['male', 'female', 'other']),
  check('country', 'Country is required').notEmpty(),
  check('state', 'State is required').notEmpty(),
  check('city', 'City is required').notEmpty(),
  check('live_image', 'Live image URL is required').notEmpty(),
  
  // Controller function
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { first_name, last_name, mobile, password, gender, country, state, city, live_image } = req.body;

      // Generate unique user ID
      const userId = `${first_name.slice(0, 2).toLowerCase()}${moment().format('MMYYYYDDHHmmss')}`;

      // Create new user object
      const newUser = new User({
        first_name,
        last_name,
        mobile,
        password,
        gender,
        country,
        state,
        city,
        live_image,
        user_id: userId,
      });

      // Save the new user
      await newUser.save();

      res.status(201).json({status:true, message: 'User created successfully', userId });
    } catch (error) {
      console.error(error);
      res.status(500).json({status:false, message: 'Server error' });
    }
  }
];

// Get a single user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ user_id: id })

    if (!user || user.isDeleted) {
      return res.status(404).json({status:false, message: 'User not found or deleted' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({status:false, message: 'Server error' });
  }
};
// Save or Update a user
const updateUser = [
    // Validation middleware
    check('mobile').custom(async (value, { req }) => {
      if (value) {
        // Check if mobile number is unique (excluding the current user if updating)
        const user = await User.findOne({ mobile: value, user_id: { $ne: req.params.id } });
        if (user) {
          throw new Error('Mobile number already in use');
        }
      }
    }),
  
    // The main controller function
    async (req, res) => {
      try {
        const { id } = req.params; // id is the custom user_id
        const updatedData = req.body;
  
        // Check if user exists by custom user_id
        let user = await User.findOne({ user_id: id });
        if (!user || user.isDeleted) {
            return res.status(404).json({status:false, message: 'User not found or deleted' });
        }
        if (user) {
          // User exists, update the user
          user = await User.findOneAndUpdate({ user_id: id }, updatedData, { new: true });
          res.status(200).json({status:true, message: 'User updated successfully', user });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({status:false, message: 'Server error' });
      }
    }
  ];

// Soft delete a user
const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ user_id: id })

    if (!user || user.isDeleted) {
      return res.status(404).json({status:false, message: 'User not found or already deleted' });
    }

    // Mark the user as deleted (soft delete)
    user.isDeleted = true;
    await user.save();

    res.status(200).json({status:true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({status:false, message: 'Server error' });
  }
};

module.exports = {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  softDeleteUser,
};
