const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('./auth');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// GET users by role (admin only) — used for rescue team assignment
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('name email role teamName phone location status');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
