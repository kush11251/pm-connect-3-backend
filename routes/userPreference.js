const express = require('express');
const UserPreference = require('../models/userPreference');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

// Insert or update user preference (user submits their preference)
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accommodationRequired, arrivalDate, departureDate, foodPreference } = req.body;
    if (typeof accommodationRequired !== 'boolean' || !foodPreference) {
      return res.status(400).json({ message: 'accommodationRequired (boolean) and foodPreference are required.' });
    }
    // Upsert user preference
    const pref = await UserPreference.findOneAndUpdate(
      { userId },
      { accommodationRequired, arrivalDate, departureDate, foodPreference },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    // Update user model's userPreference field to 'done'
    await User.updateOne({ _id: userId }, { $set: { userPreference: 'done' } });
    res.json({ message: 'Preference saved', preference: pref });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Admin: View all user preferences
router.get('/all', auth, async (req, res) => {
  try {
    console.log(req.user);

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const prefs = await UserPreference.find().populate('userId', 'username firstName middleName lastName email phoneNumber userPreference');
    res.json(prefs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// API to update userPreference status from 'done' to 'active' (admin only)
router.patch('/status/:userId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.userPreference !== 'done') {
      return res.status(400).json({ message: 'User preference status must be "done" to update to "active"' });
    }
    user.userPreference = 'active';
    await user.save();
    res.json({ message: 'User preference status updated to active' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get current user's preference
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const pref = await UserPreference.findOne({ userId });
    if (!pref) return res.status(404).json({ message: 'No preference found for this user' });
    res.json(pref);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
