const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { protect, authorize } = require('../middleware/auth');

// GET all incidents (all authenticated roles)
router.get('/', protect, async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate('assignedTeam', 'name teamName phone location status')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET incidents assigned to rescue team — MUST be before /:id to avoid route conflict
router.get('/rescue/assigned', protect, authorize('rescue'), async (req, res) => {
  try {
    const incidents = await Incident.find({ assignedTeam: req.user._id, status: { $in: ['open', 'active'] } })
      .sort({ severity: -1, createdAt: -1 });
    res.json(incidents);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET single incident
router.get('/:id', protect, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('assignedTeam', 'name teamName phone location status')
      .populate('resources');
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    res.json(incident);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create incident (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const incident = await Incident.create({ ...req.body, reportedBy: req.user._id });
    res.status(201).json(incident);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH update incident
router.patch('/:id', protect, authorize('admin', 'rescue'), async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTeam', 'name teamName');
    if (!incident) return res.status(404).json({ message: 'Incident not found' });
    res.json(incident);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE incident (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Incident.findByIdAndDelete(req.params.id);
    res.json({ message: 'Incident removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
