const express = require('express');
const Cab = require('../models/cab');
const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');

const router = express.Router();

// Upload JSON to allocate cabs to users
router.post('/allocate', auth, async (req, res) => {
  const cabs = req.body; // Array of cab objects with users

  if (!Array.isArray(cabs) || cabs.length === 0) {
    return res.status(400).json({ message: 'Input must be a non-empty array of cabs' });
  }

  try {
    const createdCabs = [];

    for (const cabData of cabs) {
      const {
        driverName,
        driverNumber,
        cabNumber,
        startingPoint,
        middleStoppagePoints,
        stoppingPoint,
        users,
      } = cabData;

      if (
        !driverName ||
        !driverNumber ||
        !cabNumber ||
        !startingPoint ||
        !stoppingPoint ||
        !Array.isArray(users) ||
        users.length === 0 ||
        users.length > 5
      ) {
        return res.status(400).json({
          message:
            'Each cab must have driverName, driverNumber, cabNumber, startingPoint, stoppingPoint, and 1-5 users',
        });
      }

      // Get user IDs by username
      const userDocs = await User.find({ username: { $in: users } }, '_id');
      const userIds = userDocs.map((u) => u._id);

      if (userIds.length === 0) {
        return res.status(400).json({ message: 'No valid users found for provided usernames' });
      }

      // Check if cab already exists for this driver and cabNumber
      let cab = await Cab.findOne({ driverName, cabNumber });

      console.log('Processing cab for driver:', driverName, 'with users:', users);
      console.log('Found cab:', cab);

      if (cab) {
        // Update cab: merge userIds (avoid duplicates)
        const updatedUserIds = [
            ...new Set([...cab.users.map((id) => id.toString()), ...userIds.map((id) => id.toString())]),
        ];
        cab.users = updatedUserIds;
        await cab.save();
      } else {
        // Create new cab
        cab = new Cab({
          driverName,
          driverNumber,
          cabNumber,
          startingPoint,
          middleStoppagePoints: Array.isArray(middleStoppagePoints) ? middleStoppagePoints : [],
          stoppingPoint,
          users: userIds,
        });
        await cab.save();
      }

      // Update each user with cab allocation
      const failedUsers = [];
      for (const userId of userIds) {
        try {
          await User.updateOne(
            { _id: userId },
            {
              $set: {
                cabStatus: 'allocated',
                cabDetail: {
                  cabId: cab._id,
                  driverName,
                  driverNumber,
                  cabNumber,
                  startingPoint,
                  middleStoppagePoints: cab.middleStoppagePoints,
                  stoppingPoint,
                },
              },
            }
          );
        } catch (err) {
          failedUsers.push(userId);
        }
      }

      createdCabs.push({ cab, failedUsers });
    }

    res.status(201).json({ cabs: createdCabs });
  } catch (err) {
    console.error('Cab allocation error:', err);
    res.status(500).json({ message: 'Cab allocation error', error: err.message });
  }
});

// Get cab route by driverId
router.get('/route/:driverId', auth, async (req, res) => {
  try {
    const cab = await Cab.findOne({ driverId: req.params.driverId }).populate('users', '-password');
    if (!cab) return res.status(404).json({ message: 'Cab not found' });
    res.json(cab);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cab', error: err.message });
  }
});

// Get all cab drivers with user details (admin only)
router.get('/drivers', auth, async (req, res) => {
  try {
    // Check if requester is admin
    const User = require('../models/user');
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: admin only' });
    }
    // Populate users for each cab
    const cabs = await require('../models/cab').find().populate('users', '-password');
    const drivers = cabs.map(cab => ({
      driverId: cab.driverId,
      driverName: cab.driverName,
      driverNumber: cab.driverNumber,
      startingPoint: cab.startingPoint,
      middleStoppagePoints: cab.middleStoppagePoints,
      stoppingPoint: cab.stoppingPoint,
      cabNumber: cab.cabNumber,
      users: cab.users
    }));
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching drivers', error: err.message });
  }
});

module.exports = router;
