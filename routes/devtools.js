const express = require('express');
const User = require('../models/user');
const Cab = require('../models/cab');
const UserPreference = require('../models/userPreference');
const auth = require('../middleware/auth');

const router = express.Router();

// Danger: Delete all data from all collections (admin only)
router.get('/all-data', async (req, res) => {
  try {
    console.log(req);

    await User.deleteMany({});
    await Cab.deleteMany({});
    await UserPreference.deleteMany({});
    res.json({ message: 'All data deleted from User, Cab, and UserPreference collections.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Signup a user with provided data (open, for setup/demo)
router.get('/signup-master', async (req, res) => {
  try {
    const data = {
      username: "master123",
      password: "admin",
      firstName: "Master",
      middleName: "A",
      lastName: "Admin",
      gender: "male",
      post: "Admin",
      role: "admin",
      project: "PM Connect",
      email: "master123@example.com",
      phoneNumber: "9999000012"
    };
    // Check if user exists
    const exists = await User.findOne({ username: data.username });
    if (exists) return res.status(400).json({ message: 'User already exists' });
    // Hash password
    const user = new User(data);
    await user.save();
    res.json({ message: 'Master admin user created', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
