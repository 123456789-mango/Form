const mongoose = require('mongoose');

const shareScheduleSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'MeroshareClient', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Schedule configuration
  scheduleType: { 
    type: String, 
    enum: ['hourly', 'specific-time', 'time-range', 'daily', 'once'], 
    required: true 
  },
  
  // For hourly schedules: number of hours between applications
  intervalHours: { type: Number, default: null }, // e.g., 1, 2, 3, etc.
  
  // For specific-time schedules: array of times like ["09:15", "10:30"]
  specificTimes: [{ type: String, default: null }], // format: "HH:mm"
  
  // For time-range schedules: apply between start and end times
  timeRangeStart: { type: String, default: null }, // format: "HH:mm"
  timeRangeEnd: { type: String, default: null },
  frequencyInRange: { type: Number, default: 30 }, // minutes between applies in range
  
  // Safe operation settings
  maxSharesPerDay: { type: Number, default: 10 }, // prevent ban
  delayBetweenRequests: { type: Number, default: 2000 }, // milliseconds (min 2000 to avoid ban)
  randomDelayRange: { type: Number, default: 3000 }, // add 0-3000ms random delay
  
  // Status tracking
  isActive: { type: Boolean, default: true },
  lastApplied: { type: Date, default: null },
  nextScheduledTime: { type: Date, default: null },
  appliedTodayCount: { type: Number, default: 0 },
  
  // Auto-reset daily count at midnight
  lastCountResetDate: { type: Date, default: Date.now },
  
  // Company share preference (if specific IPO)
  targetCompanyShareId: { type: String, default: null }, // optional: specific IPO only
  
  // Error tracking
  failureCount: { type: Number, default: 0 },
  lastError: { type: String, default: null },
  lastErrorTime: { type: Date, default: null },
  
  // Notes
  notes: { type: String, default: '' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ShareSchedule', shareScheduleSchema);
