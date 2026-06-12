# MeroShare Automation - Quick Setup Guide

## 🚀 Installation

### 1. Install Dependencies
```bash
npm install
```

This will install `node-schedule` which is already in `package.json`.

### 2. Verify Database Connection
Ensure your `.env` file has:
```env
MONGO_URI=your_mongodb_connection_string
```

### 3. Start the Application
```bash
npm run start
# or individually:
npm run server  # Backend
npm run dev     # Frontend
```

The automation scheduler will automatically start and load all active schedules.

---

## 📋 Quick Start Guide

### Step 1: Create a MeroShare Client
Use the client management page to add a MeroShare account with credentials:
- Name: Display name for reference
- DP ID: Your DP account ID
- Username: MeroShare username
- Password: MeroShare password
- PIN: Transaction PIN
- CRN: Client Registration Number

### Step 2: Test Connection
Before creating automation, test the connection:
1. Go to Automation Manager
2. Click "🧪 Test Connection" next to the client
3. Verify it shows your details and available IPOs

### Step 3: Create Your First Schedule
Click "New Schedule" and configure:

**Basic Setup (Beginner):**
```
Schedule Type: Hourly
Interval: 2 hours
Max Per Day: 5-10
```

**Advanced Setup (Daily):**
```
Schedule Type: Specific Times Daily
Times: 09:15, 14:30, 17:00
Max Per Day: 3-5
```

### Step 4: Monitor & Adjust
- Watch the activity logs
- Check daily application count
- If errors occur, check credentials
- Adjust timing if needed

---

## 🔧 Configuration Options

### Schedule Types

#### Hourly Automation
Best for: Passive automation, long intervals
```json
{
  "scheduleType": "hourly",
  "intervalHours": 3,
  "maxSharesPerDay": 5
}
```

#### Specific Times
Best for: Hitting IPO opening times
```json
{
  "scheduleType": "specific-time",
  "specificTimes": ["09:15", "14:30"],
  "maxSharesPerDay": 2
}
```

#### Time Range
Best for: Active trading hours
```json
{
  "scheduleType": "time-range",
  "timeRangeStart": "09:00",
  "timeRangeEnd": "17:00",
  "frequencyInRange": 30,
  "maxSharesPerDay": 10
}
```

---

## ⚠️ Safety Settings

These are already configured conservatively. Adjust if needed:

```javascript
delayBetweenRequests: 2000,    // Min 2 seconds (DO NOT REDUCE)
randomDelayRange: 3000,        // Add 0-3 seconds randomness
maxSharesPerDay: 10,           // Daily limit (recommended: 5-10)
```

### To Avoid Bans:
- ✅ Use delays ≥ 2 seconds
- ✅ Keep daily limit under 10
- ✅ Vary schedule times
- ✅ Monitor for errors
- ✅ Mix with manual applications

---

## 📊 Monitoring

### Dashboard Stats
- **Total Schedules**: All created schedules
- **Active Schedules**: Currently enabled
- **Applied Today**: Total applications
- **Active Jobs**: Running jobs

### Activity Logs
Shows:
- ✅ Successful logins
- ✅ Successful applications
- ⚠️ Warnings and issues
- ❌ Errors and failures

### Check Status Anytime
```bash
curl http://localhost:3000/api/automation/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### Schedule Not Running
- ✅ Check if schedule is "Active"
- ✅ Verify client credentials are correct
- ✅ Check application logs for errors
- ✅ Test connection manually

### "Account will be banned" errors
- ⬆️ Increase `delayBetweenRequests` to 3000+
- ⬇️ Reduce `maxSharesPerDay` to 5 or less
- 📈 Increase interval between applications

### Login failures
- 🔄 Test connection manually
- 🔐 Verify credentials are correct
- 📱 Check if MeroShare requires 2FA
- ⏰ Try during off-hours

### No applicable issues
- ⏰ IPO application window might be closed
- 📅 Try during IPO season
- 👤 Verify demat account eligibility

---

## 📱 API Examples

### Manual Test
```bash
curl -X POST http://localhost:3000/api/automation/test/CLIENT_ID \
  -H "Authorization: Bearer TOKEN"
```

### Trigger Manually
```bash
curl -X POST http://localhost:3000/api/automation/trigger/SCHEDULE_ID \
  -H "Authorization: Bearer TOKEN"
```

### View Logs
```bash
curl http://localhost:3000/api/automation/logs \
  -H "Authorization: Bearer TOKEN"
```

---

## 🎯 Best Practices

### For Success:
1. **Start Small**: Test with 1 schedule first
2. **Monitor Daily**: Check logs and adjust
3. **Vary Timing**: Don't always apply at same time
4. **Use Limits**: Keep daily count low (5-10)
5. **Mix Methods**: Combine with manual applications

### Recommended Setups:
- 📅 **Daily Morning**: 09:15 only
- 📅 **Extended Window**: 09:00-17:00 every 60min
- 📅 **Passive**: Every 3-4 hours, 5/day max

---

## 🔐 Security Notes

- Credentials are encrypted in transit (HTTPS required in production)
- Store passwords securely
- Don't share schedule links
- Use strong passwords for MeroShare account
- Enable 2FA on MeroShare if available

---

## 📞 Support

For issues:
1. Check logs: `/api/automation/logs`
2. Test connection: Manual test button
3. Verify credentials
4. Check MeroShare status
5. Review error messages

---

**Last Updated**: June 2024
**System**: MeroShare Automation v1.0
