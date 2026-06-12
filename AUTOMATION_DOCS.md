# MeroShare Automation System

A sophisticated automation system for scheduling and executing MeroShare IPO applications with rate-limiting protection to prevent account bans.

## Features

- ✅ **Multiple Schedule Types**: Hourly, daily, specific times, time ranges, one-time
- ✅ **Rate Limiting**: Safe delays between requests (2-5 seconds) with random jitter
- ✅ **Daily Limits**: Configurable max applications per day
- ✅ **Error Handling**: Automatic failure tracking and schedule disabling after 5 failures
- ✅ **Session Management**: Automatic login/logout with session handling
- ✅ **IPO Intelligence**: Automatic selection of best available IPOs
- ✅ **Audit Logging**: Complete audit trail of all operations
- ✅ **Admin Dashboard**: View and manage all schedules and logs

## Architecture

```
MeroShare Automation System
├── Models
│   ├── ShareSchedule.js      (Schedule configuration and status)
│   └── Client.js             (MeroShare client credentials)
├── Services
│   ├── MeroShareService.js    (API interactions with MeroShare backend)
│   └── AutomationScheduler.js (Job scheduling and execution)
├── Routes
│   └── automation.js          (API endpoints)
└── Components
    └── AutomationManager.jsx  (Frontend UI)
```

## Setup

### 1. Install Dependencies

```bash
npm install node-schedule
```

This is already added to `package.json`.

### 2. Environment Variables

No additional environment variables required. The system uses existing `MONGO_URI`.

### 3. Start the Server

```bash
npm run server
```

The scheduler will automatically initialize on startup and load all active schedules from the database.

## API Endpoints

### Getting Started

All endpoints require authentication (JWT token in Authorization header).

#### Get All Schedules
```
GET /api/automation/schedules
```

Returns all schedules for the current user (admins see all).

**Response:**
```json
[
  {
    "_id": "65f4a1b2c3d4e5f6g7h8i9j0",
    "clientId": { "_id": "...", "name": "Client 1", "username": "dpid123" },
    "userId": { "_id": "...", "username": "admin" },
    "scheduleType": "hourly",
    "intervalHours": 2,
    "isActive": true,
    "lastApplied": "2024-06-12T10:30:00Z",
    "appliedTodayCount": 5,
    "maxSharesPerDay": 10,
    "failureCount": 0,
    "nextInvocation": "2024-06-12T12:30:00Z"
  }
]
```

#### Get Schedule Details
```
GET /api/automation/schedule/:id
```

Returns detailed information about a specific schedule including next invocation time.

#### Create New Schedule
```
POST /api/automation/schedule
Content-Type: application/json

{
  "clientId": "65f4a1b2c3d4e5f6g7h8i9j0",
  "scheduleType": "hourly",
  "intervalHours": 2,
  "maxSharesPerDay": 10,
  "notes": "Daily automated application"
}
```

**Schedule Types:**

1. **Hourly**
   ```json
   {
     "scheduleType": "hourly",
     "intervalHours": 2
   }
   ```
   Applies every N hours.

2. **Specific Times**
   ```json
   {
     "scheduleType": "specific-time",
     "specificTimes": ["09:15", "14:30", "16:45"]
   }
   ```
   Applies at exact times daily.

3. **Daily**
   ```json
   {
     "scheduleType": "daily",
     "specificTimes": ["09:15"]
   }
   ```
   Applies once per day at specific time.

4. **Time Range**
   ```json
   {
     "scheduleType": "time-range",
     "timeRangeStart": "09:00",
     "timeRangeEnd": "17:00",
     "frequencyInRange": 30
   }
   ```
   Applies within time range at specified frequency (minutes).

5. **Once**
   ```json
   {
     "scheduleType": "once",
     "nextScheduledTime": "2024-06-12T10:30:00Z"
   }
   ```
   Applies one time at specified moment.

#### Update Schedule
```
PUT /api/automation/schedule/:id
Content-Type: application/json

{
  "isActive": true,
  "maxSharesPerDay": 15,
  "intervalHours": 3
}
```

#### Manually Trigger Schedule
```
POST /api/automation/trigger/:scheduleId
```

Immediately executes an application without waiting for schedule time.

#### Test Client Connection
```
POST /api/automation/test/:clientId
```

Tests MeroShare connection before creating schedule. Returns:
```json
{
  "success": true,
  "message": "Connection test successful",
  "details": {
    "username": "John Doe",
    "demat": "123456789",
    "boid": "ABCD1234",
    "applicableIssuesCount": 5
  }
}
```

#### Get Scheduler Stats
```
GET /api/automation/stats
```

Returns overview statistics:
```json
{
  "totalSchedules": 15,
  "activeSchedules": 12,
  "inactiveSchedules": 3,
  "totalAppliedToday": 47,
  "activeJobs": 12,
  "recentLogs": [...]
}
```

#### Get Audit Logs
```
GET /api/automation/logs?limit=100
```

Returns recent activity logs:
```json
[
  {
    "timestamp": "2024-06-12T10:30:00Z",
    "type": "APPLY_SUCCESS",
    "scheduleId": "65f4a1b2c3d4e5f6g7h8i9j0",
    "message": "Applied for: Nepal Investment Bank"
  },
  {
    "timestamp": "2024-06-12T10:28:00Z",
    "type": "LOGIN_SUCCESS",
    "scheduleId": "65f4a1b2c3d4e5f6g7h8i9j0",
    "message": "Logged in successfully"
  }
]
```

#### Delete Schedule
```
DELETE /api/automation/schedule/:id
```

Removes and deactivates a schedule.

## Safety Features

### Rate Limiting
- **Minimum delay**: 2 seconds between API requests
- **Random jitter**: 0-3 seconds added to prevent pattern detection
- **Daily limits**: Configurable maximum applications per day (default: 10)

### Error Handling
- **Automatic retry**: Failed applications are logged
- **Auto-disable**: Schedule disables after 5 consecutive failures
- **Error tracking**: Each failure is recorded with timestamp and message

### Session Management
- **Auto-login**: Session automatically created before application
- **Auto-logout**: Session terminated after operation (even on error)
- **Session persistence**: Session stored with client record

## Example Usage

### 1. Create a Client
```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Neuma Poudel",
    "dpId": "DP001234",
    "username": "NPPOUDEL",
    "password": "securepwd",
    "pin": "1234",
    "crn": "12345"
  }'
```

### 2. Create Hourly Schedule
```bash
curl -X POST http://localhost:3000/api/automation/schedule \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "65f4a1b2c3d4e5f6g7h8i9j0",
    "scheduleType": "hourly",
    "intervalHours": 2,
    "maxSharesPerDay": 10
  }'
```

### 3. Create Specific Times Schedule
```bash
curl -X POST http://localhost:3000/api/automation/schedule \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "65f4a1b2c3d4e5f6g7h8i9j0",
    "scheduleType": "specific-time",
    "specificTimes": ["09:15", "14:30"],
    "maxSharesPerDay": 5
  }'
```

### 4. Monitor Activity
```bash
# Get recent logs
curl http://localhost:3000/api/automation/logs?limit=50 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get statistics
curl http://localhost:3000/api/automation/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema

### ShareSchedule Collection

```javascript
{
  _id: ObjectId,
  
  // References
  clientId: ObjectId (ref: Client),
  userId: ObjectId (ref: User),
  
  // Schedule Configuration
  scheduleType: String ("hourly" | "specific-time" | "time-range" | "daily" | "once"),
  intervalHours: Number,
  specificTimes: [String], // ["09:15", "14:30"]
  timeRangeStart: String, // "09:00"
  timeRangeEnd: String, // "17:00"
  frequencyInRange: Number, // minutes
  
  // Safety Settings
  maxSharesPerDay: Number,
  delayBetweenRequests: Number, // milliseconds
  randomDelayRange: Number, // milliseconds
  
  // Status
  isActive: Boolean,
  lastApplied: Date,
  nextScheduledTime: Date,
  appliedTodayCount: Number,
  lastCountResetDate: Date,
  
  // Target
  targetCompanyShareId: String,
  
  // Error Tracking
  failureCount: Number,
  lastError: String,
  lastErrorTime: Date,
  
  // Other
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### "Schedule not executing"
- Check if schedule is active: `isActive: true`
- Verify client credentials are correct
- Test connection using `/api/automation/test/:clientId`
- Check logs for errors

### "Account ban warnings"
- Increase `delayBetweenRequests` (minimum 2000ms)
- Reduce `maxSharesPerDay`
- Increase `intervalHours` for hourly schedules

### "Login failed"
- Verify client credentials in database
- Ensure MeroShare is accessible
- Check PIN is correct

### "No applicable issues"
- Check if current IPO application windows are open
- Verify demat account is eligible
- Try again during IPO application period

## Best Practices

1. **Start Conservative**: Begin with long intervals (2-3 hours) and few daily applications
2. **Monitor Logs**: Check logs regularly for patterns
3. **Test First**: Always use `/test/:clientId` before creating schedule
4. **Set Limits**: Use `maxSharesPerDay` to prevent aggressive applications
5. **Vary Schedule**: Mix specific times and hourly to appear natural
6. **Error Handling**: Monitor for repeated errors and disable schedule if needed
7. **Credentials**: Store credentials securely (consider encryption in future)

## Security Considerations

⚠️ **Important Notes:**
- Credentials are stored in database - ensure database is secured
- Consider encrypting passwords/PINs in future
- Use HTTPS in production
- Implement rate limiting per user
- Add IP whitelisting if possible
- Never share client credentials

## Future Enhancements

- [ ] Credential encryption
- [ ] Email notifications on success/failure
- [ ] Webhook callbacks
- [ ] Advanced IPO selection strategy
- [ ] Machine learning for optimal timing
- [ ] Multi-account pooling
- [ ] Advanced reporting dashboard
- [ ] Export logs to CSV/PDF

## Support

For issues or questions, check logs at `/api/automation/logs`.

---

**Last Updated**: June 2024
