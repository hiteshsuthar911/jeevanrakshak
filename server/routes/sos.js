const express = require('express');
const router  = express.Router();
const SOSAlert = require('../models/SOSAlert');
const { protect, authorize } = require('../middleware/auth');

// ── GET all SOS alerts (admin / rescue) ──────────────────────
router.get('/', protect, authorize('admin', 'rescue'), async (req, res) => {
  try {
    const alerts = await SOSAlert.find()
      .populate('citizen',     'name phone email location')
      .populate('assignedTeam','name teamName phone location')
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── GET citizen's own SOS requests ───────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const alerts = await SOSAlert.find({ citizen: req.user._id })
      .populate('assignedTeam', 'name teamName phone')
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── POST new SOS request (citizen) ───────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { location, message, disasterType } = req.body;
    const alert = await SOSAlert.create({
      citizen:      req.user._id,
      citizenName:  req.user.name,
      citizenPhone: req.user.phone,
      location,
      message:      message || 'Emergency! Need immediate help.',
      disasterType: disasterType || 'unknown',
      status:       'pending',
    });
    const populated = await alert.populate('citizen', 'name phone email');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH admin confirms request & sends back to citizen ─────
// Sets status → admin-confirmed, saves adminNotes
router.patch('/:id/admin-confirm', protect, authorize('admin'), async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.id,
      { status: 'admin-confirmed', adminNotes, acknowledgedBy: req.user._id },
      { new: true }
    )
      .populate('citizen',     'name phone email')
      .populate('assignedTeam','name teamName');

    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    // Emit socket event so citizen gets notified in real-time
    req.app.get('io')?.to(`user:${alert.citizen._id}`).emit('sos:admin-confirmed', alert);
    res.json(alert);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH citizen confirms details ───────────────────────────
router.patch('/:id/citizen-confirm', protect, async (req, res) => {
  try {
    const alert = await SOSAlert.findOne({ _id: req.params.id, citizen: req.user._id });
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    if (alert.status !== 'admin-confirmed')
      return res.status(400).json({ message: 'Alert is not in admin-confirmed state' });

    alert.status          = 'user-confirmed';
    alert.confirmedByUser = true;
    alert.userConfirmedAt = new Date();
    await alert.save();

    const populated = await alert.populate([
      { path: 'citizen',      select: 'name phone email' },
      { path: 'assignedTeam', select: 'name teamName' },
    ]);

    // Notify admin
    req.app.get('io')?.to('admin').emit('sos:user-confirmed', populated);
    res.json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH admin dispatches rescue team ───────────────────────
router.patch('/:id/dispatch', protect, authorize('admin'), async (req, res) => {
  try {
    const { assignedTeam } = req.body;
    if (!assignedTeam) return res.status(400).json({ message: 'assignedTeam required' });

    const alert = await SOSAlert.findByIdAndUpdate(
      req.params.id,
      { status: 'dispatched', assignedTeam, dispatchedAt: new Date() },
      { new: true }
    )
      .populate('citizen',     'name phone email location')
      .populate('assignedTeam','name teamName phone location');

    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    // Notify rescue team + citizen
    req.app.get('io')?.to('rescue').emit('sos:dispatched', alert);
    req.app.get('io')?.to(`user:${alert.citizen._id}`).emit('sos:dispatched', alert);
    res.json(alert);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── PATCH general update (rescue marks resolved etc.) ────────
router.patch('/:id', protect, async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.body.status === 'resolved') update.resolvedAt = new Date();
    const alert = await SOSAlert.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('citizen',     'name phone')
      .populate('assignedTeam','name teamName');
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
