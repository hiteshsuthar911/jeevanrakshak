const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect, authorize } = require('../middleware/auth');

// GET messages for current user
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ from: req.user._id }, { to: req.user._id }, { toRole: req.user.role }, { toRole: 'all' }]
    })
      .populate('from', 'name role teamName')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET unread count
router.get('/unread', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      $or: [{ to: req.user._id }, { toRole: req.user.role }, { toRole: 'all' }],
      read: false,
      from: { $ne: req.user._id }
    });
    res.json({ count });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST send message
router.post('/', protect, async (req, res) => {
  try {
    const message = await Message.create({ ...req.body, from: req.user._id });
    const populated = await message.populate('from', 'name role teamName');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH mark read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST broadcast (admin to all citizens in area)
router.post('/broadcast', protect, authorize('admin'), async (req, res) => {
  try {
    const { content, toRole } = req.body;
    const message = await Message.create({
      from: req.user._id,
      toRole: toRole || 'all',
      content,
      type: 'broadcast'
    });
    res.status(201).json(message);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
