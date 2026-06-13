const router = require('express').Router();
const ShareSchedule = require('../models/ShareSchedule');
const Client = require('../models/Client');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getScheduler } = require('../services/AutomationScheduler');
const MeroShareService = require('../services/MeroShareService');

// ==========================================
// GET ROUTES
// ==========================================

/**
 * Get all schedules for current user
 */
router.get('/schedules', auth, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const user = await User.findById(req.user.id);
    let schedules;

    if (user.role === 'admin') {
      schedules = await ShareSchedule.find()
        .populate('clientId', 'name username dpId')
        .populate('userId', 'username displayName')
        .sort({ createdAt: -1 });
    } else {
      schedules = await ShareSchedule.find({ userId: req.user.id })
        .populate('clientId', 'name username dpId')
        .populate('userId', 'username displayName')
        .sort({ createdAt: -1 });
    }

    // Add job status info
    const scheduler = getScheduler();
    const schedulesWithStatus = schedules.map((sched) => {
      const job = scheduler.jobs.get(sched._id.toString());
      return {
        ...sched.toObject(),
        nextInvocation: job ? job.nextInvocation() : null,
      };
    });

    res.json(schedulesWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get single schedule details
 */
router.get('/schedule/:id', auth, async (req, res) => {
  try {
    const schedule = await ShareSchedule.findById(req.params.id)
      .populate('clientId', 'name username dpId')
      .populate('userId', 'username displayName');

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && schedule.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const scheduler = getScheduler();
    const status = await scheduler.getScheduleStatus(schedule._id);

    res.json({ schedule, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get scheduler logs
 */
router.get('/logs', auth, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const limit = parseInt(req.query.limit) || 100;
    const scheduler = getScheduler();
    const logs = scheduler.getLogs(limit);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get scheduler stats
 */
router.get('/stats', auth, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const user = await User.findById(req.user.id);
    const query = {};

    if (user.role !== 'admin') {
      query.userId = req.user.id;
    }

    const totalSchedules = await ShareSchedule.countDocuments(query);
    const activeSchedules = await ShareSchedule.countDocuments({ ...query, isActive: true });
    const totalAppliedToday = await ShareSchedule.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$appliedTodayCount' } } },
    ]);

    const scheduler = getScheduler();
    const jobs = scheduler.getScheduledJobs();

    res.json({
      totalSchedules,
      activeSchedules,
      inactiveSchedules: totalSchedules - activeSchedules,
      totalAppliedToday: totalAppliedToday[0]?.total || 0,
      activeJobs: jobs.length,
      recentLogs: scheduler.getLogs(10),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// POST ROUTES
// ==========================================

/**
 * Create new automation schedule
 */
router.post('/schedule', auth, async (req, res) => {
  try {
    const { clientId, scheduleType, intervalHours, specificTimes, timeRangeStart, timeRangeEnd, frequencyInRange, maxSharesPerDay, targetCompanyShareId, notes } = req.body;

    // Validate required fields
    if (!clientId || !scheduleType) {
      return res.status(400).json({ error: 'Missing required fields: clientId, scheduleType' });
    }

    // Verify client exists and belongs to user
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && client.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to use this client' });
    }

    // Validate schedule config based on type
    if (scheduleType === 'hourly' && !intervalHours) {
      return res.status(400).json({ error: 'intervalHours required for hourly schedule' });
    }

    if (scheduleType === 'specific-time' && (!specificTimes || specificTimes.length === 0)) {
      return res.status(400).json({ error: 'specificTimes required for specific-time schedule' });
    }

    if (scheduleType === 'time-range' && (!timeRangeStart || !timeRangeEnd)) {
      return res.status(400).json({ error: 'timeRangeStart and timeRangeEnd required for time-range schedule' });
    }

    // Create schedule
    const schedule = new ShareSchedule({
      clientId,
      userId: req.user.id,
      scheduleType,
      intervalHours,
      specificTimes,
      timeRangeStart,
      timeRangeEnd,
      frequencyInRange,
      maxSharesPerDay: maxSharesPerDay || 10,
      targetCompanyShareId,
      notes,
      isActive: true,
    });

    await schedule.save();

    // Register with scheduler
    const scheduler = getScheduler();
    await scheduler.createSchedule(schedule);

    await schedule.populate('clientId userId');

    res.status(201).json({
      message: 'Schedule created and activated',
      schedule,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Update schedule
 */
router.put('/schedule/:id', auth, async (req, res) => {
  try {
    const schedule = await ShareSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && schedule.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Allow updating these fields
    const allowedFields = ['scheduleType', 'intervalHours', 'specificTimes', 'timeRangeStart', 'timeRangeEnd', 'frequencyInRange', 'maxSharesPerDay', 'targetCompanyShareId', 'isActive', 'notes'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        schedule[field] = req.body[field];
      }
    });

    schedule.updatedAt = new Date();
    await schedule.save();

    // Update scheduler
    const scheduler = getScheduler();
    if (schedule.isActive) {
      await scheduler.updateSchedule(schedule);
    } else {
      scheduler.cancelSchedule(schedule._id);
    }

    await schedule.populate('clientId userId');

    res.json({
      message: 'Schedule updated',
      schedule,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Manually trigger a schedule
 */
router.post('/trigger/:scheduleId', auth, async (req, res) => {
  try {
    const schedule = await ShareSchedule.findById(req.params.scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && schedule.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const scheduler = getScheduler();
    const result = await scheduler.triggerManual(schedule._id);

    res.json({
      message: 'Manual trigger executed',
      result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Test MeroShare connection for a client
 */
router.post('/test/:clientId', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && client.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!client.username || !client.password || !client.pin) {
      return res.status(400).json({ error: 'Client missing required credentials' });
    }

    const meroShare = new MeroShareService();

    try {
      // Try login
      const loginResult = await meroShare.login(client.username, client.password, client.pin);

      // Try getting own details
      const ownDetails = await meroShare.getOwnDetails();

      // Try getting applicable issues
      const issues = await meroShare.getApplicableIssues();

      // Logout
      await meroShare.logout();

      res.json({
        success: true,
        message: 'Connection test successful',
        details: {
          username: loginResult.userName,
          demat: loginResult.demat,
          boid: loginResult.boid,
          ownDetails,
          applicableIssuesCount: issues.length,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// DELETE ROUTES
// ==========================================

/**
 * Delete schedule
 */
router.delete('/schedule/:id', auth, async (req, res) => {
  try {
    const schedule = await ShareSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && schedule.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Cancel from scheduler
    const scheduler = getScheduler();
    scheduler.cancelSchedule(schedule._id);

    // Delete from DB
    await ShareSchedule.findByIdAndDelete(req.params.id);

    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/apply', auth, async (req, res) => {
  const { clientId, targetShareId } = req.body;
  let service = null;

  try {
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && client.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to use this client' });
    }

    if (!client.username || !client.password || !client.dpId || !client.pin) {
      return res.status(400).json({ error: 'Client missing required credentials (username, password, dpId, pin)' });
    }

    service = new MeroShareService();
    await service.login(client.username, client.password, client.dpId);

    const options = {
      targetCompanyShareId: targetShareId || undefined,
      crn: client.crn,
      bankId: client.bankId,
      noOfShare: client.noOfShare,
      transactionPIN: client.pin,
      demat: client.demat,
      boid: client.boid,
    };

    const result = await service.findAndApplyForShare(options);

    res.json({
      success: true,
      message: `Successfully applied for ${result.appliedFor}`,
      details: result,
    });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ error: err.message || 'Failed to apply for IPO' });
  } finally {
    if (service) {
      await service.logout().catch((logoutErr) => {
        console.error('Logout cleanup failed:', logoutErr.message);
      });
    }
  }
});


module.exports = router;
