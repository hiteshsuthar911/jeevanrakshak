const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect, authorize } = require('../middleware/auth');

// GET all resources
router.get('/', protect, async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('assignedTo', 'title location')
      .populate('assignedTeam', 'name teamName')
      .sort({ status: 1 });
    res.json(resources);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET resource by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create resource (admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH assign/update resource
router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'title')
      .populate('assignedTeam', 'name teamName');
    res.json(resource);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE resource (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
