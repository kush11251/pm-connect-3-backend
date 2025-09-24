const express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { SECRET } = require('../middleware/auth');

const router = express.Router();

// Token verification endpoint
router.post('/verify', auth, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Generate a new token (for demo)
router.post('/generate', (req, res) => {
  const { id, username } = req.body;
  if (!id || !username) return res.status(400).json({ message: 'id and username required' });
  const token = jwt.sign({ id, username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
