const User = require('../models/User');
const mongoose = require('mongoose');

// List all users
const listUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }); // Only non-deleted users
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a user
const createUser = async (req, res) => {
  try {
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

    res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found or deleted' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a user by ID
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Validate if the user exists
    const user = await User.findById(id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found or deleted' });
    }

    // Update the user details
    await User.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Soft delete a user
const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found or already deleted' });
    }

    // Mark the user as deleted (soft delete)
    user.isDeleted = true;
    await user.save();

    res.status(200).json({ message: 'User soft deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  softDeleteUser
};
