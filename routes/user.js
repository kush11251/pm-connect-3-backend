const auth = require('../middleware/auth');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { SECRET } = require('../middleware/auth');

const router = express.Router();


// Signup
router.post('/signup', async (req, res) => {
  const { username, password, firstName, lastName, middleName, gender, post, role, project, email, phoneNumber } = req.body;
  if (!username || !password || !firstName || !lastName || !email) {
    return res.status(400).json({ message: 'username, password, firstName, lastName, and email are required' });
  }
  try {
    const existing = await User.findOne({ $or: [ { username }, { email } ] });
    if (existing) return res.status(409).json({ message: 'User already exists' });
    const user = new User({ username, password, firstName, lastName, middleName, gender, post, role, project, email, phoneNumber });
    await user.save();
    res.status(201).json({ id: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

// Bulk Signup
router.post('/bulk-signup', async (req, res) => {
  const users = req.body;
  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({ message: 'Input must be a non-empty array of users' });
  }
  // Helper to generate password
  function generatePassword(firstName, middleName, lastName) {
    const clean = str => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean(firstName) + clean(middleName) + clean(lastName);
  }
  try {
    const toInsert = users.map(u => {
      const { username, firstName, lastName, middleName, gender, post, role, project, email, phoneNumber } = u;
      if (!username || !firstName || !lastName || !email) {
        throw new Error('Each user must have username, firstName, lastName, and email');
      }
      return {
        username,
        password: generatePassword(firstName, middleName, lastName),
        firstName,
        lastName,
        middleName,
        gender,
        post,
        role,
        project,
        email,
        phoneNumber
      };
    });
    // Check for existing users by username or email
    const usernames = toInsert.map(u => u.username);
    const emails = toInsert.map(u => u.email);
    const existing = await User.find({ $or: [ { username: { $in: usernames } }, { email: { $in: emails } } ] });
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Some users already exist', existing });
    }
    const created = await User.insertMany(toInsert);
    res.status(201).json({ created: created.map(u => ({ id: u._id, username: u.username })) });
  } catch (err) {
    res.status(500).json({ message: 'Bulk signup error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password }).lean();
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const { password: _, ...userData } = user;
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, SECRET, { expiresIn: '1d' });
    res.json({ user: userData, token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Get current user by id from token
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
});

// Get all users (admin only)
router.get('/all', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: admin only' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

module.exports = router;
