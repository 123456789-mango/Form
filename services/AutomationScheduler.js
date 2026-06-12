const schedule = require('node-schedule');
const ShareSchedule = require('../models/ShareSchedule');
const Client = require('../models/Client');
const MeroShareService = require('./MeroShareService');

class AutomationScheduler {
  constructor() {
    this.jobs = new Map(); // { scheduleId: job }
    this.logs = []; // Audit log
  }

  /**
   * Initialize scheduler - load all active schedules from DB
   */
  async initialize() {
    try {
      console.log('🔄 Initializing automation scheduler...');
      const schedules = await ShareSchedule.find({ isActive: true }).populate('clientId userId');

      for (const sched of schedules) {
        try {
          await this.createSchedule(sched);
        } catch (err) {
          console.error(`Failed to schedule ${sched._id}:`, err.message);
        }
      }

      console.log(`✅ Scheduler initialized with ${schedules.length} active schedules`);
    } catch (error) {
      console.error('❌ Scheduler initialization failed:', error.message);
    }
  }

  /**
   * Create and register a new schedule
   */
  async createSchedule(scheduleDoc) {
    try {
      const { _id, scheduleType, intervalHours, specificTimes, timeRangeStart, frequencyInRange } = scheduleDoc;

      // Cancel existing job if any
      if (this.jobs.has(_id.toString())) {
        this.jobs.get(_id.toString()).cancel();
      }

      let job;

      if (scheduleType === 'hourly') {
        // Every N hours
        job = schedule.scheduleJob(`0 */${intervalHours} * * *`, () => this.executeApplication(_id));
      } else if (scheduleType === 'specific-time') {
        // At specific times like 09:15, 10:30, etc.
        const cronTimes = specificTimes.map((time) => {
          const [hours, minutes] = time.split(':');
          return `${minutes} ${hours} * * *`;
        });

        job = schedule.scheduleJob(cronTimes, () => this.executeApplication(_id));
      } else if (scheduleType === 'time-range') {
        // Between time range with frequency
        job = schedule.scheduleJob(`*/${frequencyInRange} ${timeRangeStart.split(':')[0]} * * *`, () => {
          this.executeApplication(_id);
        });
      } else if (scheduleType === 'daily') {
        // Daily at specific time
        const time = specificTimes?.[0] || '09:15';
        const [hours, minutes] = time.split(':');
        job = schedule.scheduleJob(`${minutes} ${hours} * * *`, () => this.executeApplication(_id));
      } else if (scheduleType === 'once') {
        // One-time execution
        const nextTime = scheduleDoc.nextScheduledTime;
        if (nextTime) {
          job = schedule.scheduleJob(nextTime, () => this.executeApplication(_id));
        }
      }

      if (job) {
        this.jobs.set(_id.toString(), job);
        this.log('SCHEDULE_CREATED', _id, `Schedule created: ${scheduleType}`);
        return job;
      }
    } catch (error) {
      this.log('SCHEDULE_ERROR', scheduleDoc._id, error.message);
      throw error;
    }
  }

  /**
   * Execute application for a schedule
   */
  async executeApplication(scheduleId) {
    const startTime = Date.now();
    const scheduleIdStr = scheduleId.toString();

    try {
      // Get schedule document
      const schedule = await ShareSchedule.findById(scheduleId).populate('clientId userId');
      if (!schedule) {
        throw new Error('Schedule not found');
      }

      if (!schedule.isActive) {
        throw new Error('Schedule is disabled');
      }

      // Check daily limit
      if (schedule.appliedTodayCount >= schedule.maxSharesPerDay) {
        this.log('DAILY_LIMIT', scheduleId, `Daily limit reached (${schedule.appliedTodayCount}/${schedule.maxSharesPerDay})`);
        return;
      }

      // Reset daily counter if date changed
      const today = new Date().toDateString();
      const lastResetDate = schedule.lastCountResetDate.toDateString();
      if (today !== lastResetDate) {
        schedule.appliedTodayCount = 0;
        schedule.lastCountResetDate = new Date();
      }

      // Get client
      const client = await Client.findById(schedule.clientId);
      if (!client) {
        throw new Error('Client not found');
      }

      // Validate client has required data
      if (!client.username || !client.password || !client.pin) {
        throw new Error('Client missing required credentials');
      }

      // Initialize MeroShare service
      const meroShare = new MeroShareService();

      try {
        // Login
        this.log('LOGIN_START', scheduleId, `Logging in as ${client.username}`);
        const loginResult = await meroShare.login(client.username, client.password, client.pin);

        // Update client session info
        client.sessionId = loginResult.sessionId;
        client.demat = loginResult.demat;
        client.boid = loginResult.boid;
        client.loggedInName = loginResult.userName;
        await client.save();

        this.log('LOGIN_SUCCESS', scheduleId, `Logged in successfully`);

        // Add safe random delay
        const randomDelay = Math.random() * schedule.randomDelayRange;
        await new Promise((resolve) => setTimeout(resolve, schedule.delayBetweenRequests + randomDelay));

        // Apply for share
        this.log('APPLY_START', scheduleId, `Attempting to apply for share`);

        const applyResult = await meroShare.findAndApplyForShare({
          targetCompanyShareId: schedule.targetCompanyShareId,
          crn: client.crn,
          noOfShare: client.noOfShare || 1,
          bankCode: client.bankCode,
        });

        // Update schedule
        schedule.lastApplied = new Date();
        schedule.appliedTodayCount += 1;
        schedule.failureCount = 0;
        schedule.lastError = null;
        await schedule.save();

        this.log('APPLY_SUCCESS', scheduleId, `Applied for: ${applyResult.appliedFor}`);

        // Logout
        try {
          await meroShare.logout();
        } catch (err) {
          console.error('Logout error:', err.message);
        }

        const duration = Date.now() - startTime;
        console.log(`✅ Application successful (${duration}ms)`);

        return {
          success: true,
          result: applyResult,
        };
      } catch (error) {
        // Logout on error
        try {
          await meroShare.logout();
        } catch (err) {
          console.error('Logout error:', err.message);
        }

        schedule.failureCount += 1;
        schedule.lastError = error.message;
        schedule.lastErrorTime = new Date();

        // Disable after 5 consecutive failures
        if (schedule.failureCount >= 5) {
          schedule.isActive = false;
          this.log('SCHEDULE_DISABLED', scheduleId, `Disabled after ${schedule.failureCount} failures`);
        }

        await schedule.save();
        this.log('APPLY_ERROR', scheduleId, error.message);

        throw error;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Application failed (${duration}ms):`, error.message);
      this.log('EXECUTION_ERROR', scheduleId, error.message);
    }
  }

  /**
   * Cancel a schedule
   */
  cancelSchedule(scheduleId) {
    const scheduleIdStr = scheduleId.toString();
    const job = this.jobs.get(scheduleIdStr);

    if (job) {
      job.cancel();
      this.jobs.delete(scheduleIdStr);
      this.log('SCHEDULE_CANCELLED', scheduleId, 'Schedule cancelled');
      return true;
    }

    return false;
  }

  /**
   * Update a schedule
   */
  async updateSchedule(scheduleDoc) {
    try {
      this.cancelSchedule(scheduleDoc._id);
      await this.createSchedule(scheduleDoc);
      this.log('SCHEDULE_UPDATED', scheduleDoc._id, 'Schedule updated');
      return true;
    } catch (error) {
      this.log('SCHEDULE_UPDATE_ERROR', scheduleDoc._id, error.message);
      throw error;
    }
  }

  /**
   * Get all scheduled jobs
   */
  getScheduledJobs() {
    return Array.from(this.jobs.entries()).map(([id, job]) => ({
      scheduleId: id,
      nextInvocation: job.nextInvocation(),
    }));
  }

  /**
   * Log event for audit trail
   */
  log(type, scheduleId, message) {
    const logEntry = {
      timestamp: new Date(),
      type,
      scheduleId: scheduleId.toString(),
      message,
    };

    this.logs.push(logEntry);

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    console.log(`[${type}] ${message}`);
  }

  /**
   * Get logs
   */
  getLogs(limit = 100) {
    return this.logs.slice(-limit).reverse();
  }

  /**
   * Get schedule status
   */
  async getScheduleStatus(scheduleId) {
    try {
      const schedule = await ShareSchedule.findById(scheduleId);
      if (!schedule) {
        return null;
      }

      const job = this.jobs.get(scheduleId.toString());

      return {
        id: schedule._id,
        isActive: schedule.isActive,
        lastApplied: schedule.lastApplied,
        nextScheduledTime: job ? job.nextInvocation() : null,
        appliedTodayCount: schedule.appliedTodayCount,
        maxSharesPerDay: schedule.maxSharesPerDay,
        failureCount: schedule.failureCount,
        lastError: schedule.lastError,
      };
    } catch (error) {
      console.error('Error getting schedule status:', error.message);
      return null;
    }
  }

  /**
   * Manually trigger an application
   */
  async triggerManual(scheduleId) {
    return this.executeApplication(scheduleId);
  }
}

// Singleton instance
let schedulerInstance = null;

/**
 * Get or create scheduler instance
 */
function getScheduler() {
  if (!schedulerInstance) {
    schedulerInstance = new AutomationScheduler();
  }
  return schedulerInstance;
}

module.exports = {
  AutomationScheduler,
  getScheduler,
};
