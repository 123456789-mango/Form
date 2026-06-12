# 🔌 Integration Guide - Using AutomationManager Component

## Adding to Your App

### 1. Import the Component

In your main dashboard or wherever you want to show automation:

```jsx
import AutomationManager from '../components/MeroshareClient/AutomationManager';
```

### 2. Add Route (if not already there)

In [src/App.jsx](src/App.jsx), add:

```jsx
import AutomationManager from './components/MeroshareClient/AutomationManager';

// In your routes:
<Route path="/automation" element={<AutomationManager />} />
```

### 3. Add Navigation Link

In [src/components/Routes/Navbar.jsx](src/components/Routes/Navbar.jsx), add:

```jsx
<Link to="/automation">🤖 Automation</Link>
```

---

## Complete Integration Example

### App.jsx

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Routes/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import AutomationManager from './components/MeroshareClient/AutomationManager';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/automation" element={<AutomationManager />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;
```

### Navbar.jsx Example

```jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/">📊 Dashboard</Link>
      <Link to="/clients">👥 Clients</Link>
      <Link to="/automation">🤖 Automation</Link>
      <Link to="/profile">👤 Profile</Link>
    </nav>
  );
}
```

---

## Authentication Token Setup

The component uses localStorage for token. Ensure your app has:

```jsx
// On login
localStorage.setItem('token', jwtToken);

// The component will use it automatically:
// Authorization: Bearer TOKEN
```

---

## Full File Structure After Implementation

```
Form/
├── api/
│   └── index.js                          ✏️ (UPDATED - scheduler init)
├── models/
│   ├── Client.js
│   └── ShareSchedule.js                  ✨ (NEW)
├── routes/
│   ├── automation.js                     ✨ (NEW)
│   ├── clients.js
│   ├── auth.js
│   └── ...
├── services/
│   ├── MeroShareService.js               ✨ (NEW)
│   └── AutomationScheduler.js            ✨ (NEW)
├── src/
│   ├── components/
│   │   ├── MeroshareClient/
│   │   │   ├── ClientList.jsx
│   │   │   ├── ClientManagement.jsx
│   │   │   └── AutomationManager.jsx     ✨ (NEW)
│   │   ├── Routes/
│   │   │   └── Navbar.jsx                (ADD LINK)
│   │   └── ...
│   ├── App.jsx                           (ADD ROUTE)
│   └── ...
├── AUTOMATION_DOCS.md                    ✨ (NEW - Complete API docs)
├── AUTOMATION_SETUP.md                   ✨ (NEW - Quick start)
├── AUTOMATION_IMPLEMENTATION.md          ✨ (NEW - This summary)
└── package.json                          ✏️ (UPDATED - added node-schedule)
```

---

## Component Features Explained

### Statistics Dashboard
```jsx
// Shows real-time stats
- Total Schedules
- Active Schedules  
- Applied Today Count
- Active Jobs Running
```

### Schedule Form
```jsx
// Create/Edit schedules with:
- Client selector
- Schedule type (hourly, daily, specific-time, time-range)
- Time configuration
- Safety limits
- Optional: Target specific IPO
- Notes field
```

### Connection Testing
```jsx
// Test MeroShare connection
- Validates credentials
- Shows user info
- Displays available IPOs
- Checks eligibility
```

### Schedule List
```jsx
// Shows all schedules with:
- Client name
- Schedule type and details
- Application count today
- Last applied time
- Active/Inactive status
- Action buttons (trigger, edit, delete)
```

### Activity Logs
```jsx
// Real-time activity feed
- Login/logout events
- Successful applications
- Errors and failures
- Timestamps
- Color-coded by type
```

---

## API Integration Checklist

✅ Backend Routes
- [x] `/api/automation/schedules` - List
- [x] `/api/automation/schedule/:id` - Get details
- [x] `/api/automation/schedule` - Create
- [x] `/api/automation/schedule/:id` - Update
- [x] `/api/automation/schedule/:id` - Delete
- [x] `/api/automation/trigger/:id` - Manual trigger
- [x] `/api/automation/test/:clientId` - Test connection
- [x] `/api/automation/stats` - Statistics
- [x] `/api/automation/logs` - Activity logs

✅ Database Models
- [x] ShareSchedule collection created
- [x] Indexes configured
- [x] Relationships setup

✅ Services
- [x] MeroShareService for API calls
- [x] AutomationScheduler for job management

✅ Frontend
- [x] AutomationManager component
- [x] Styling and responsiveness
- [x] Real-time updates

---

## Running the System

### Terminal 1: Backend
```bash
cd Form
npm run server
```

### Terminal 2: Frontend
```bash
cd Form
npm run dev
```

### Access the Dashboard
```
http://localhost:5173
```

Then navigate to: **🤖 Automation** (in navbar)

---

## Testing the Implementation

### 1. Create a Client First
Navigate to Client Management and create a MeroShare client with credentials

### 2. Test Connection
In Automation Manager, click "🧪 Test Connection"

### 3. Create Schedule
Click "New Schedule" and configure

### 4. Monitor Execution
Watch the logs and stats update in real-time

### 5. Trigger Manually
Click "▶️ Trigger" to test immediately

---

## Customization

### Change Default Settings

In [services/AutomationScheduler.js](services/AutomationScheduler.js):

```javascript
// Adjust delays
delayBetweenRequests: 2000,    // milliseconds
randomDelayRange: 3000,        // milliseconds
maxSharesPerDay: 10,           // adjust as needed
```

### Change UI Colors

In [src/components/MeroshareClient/AutomationManager.jsx](src/components/MeroshareClient/AutomationManager.jsx):

```css
/* Update color scheme */
--primary-color: #667eea;
--success-color: #4CAF50;
--danger-color: #f44336;
--warning-color: #FF9800;
```

### Add Custom Fields

In [models/ShareSchedule.js](models/ShareSchedule.js), add new fields:

```javascript
customField: { type: String, default: null }
```

Then update the form in AutomationManager.jsx

---

## Error Handling

The system handles:

✅ **Login Errors**
- Invalid credentials
- Account locked
- Network issues

✅ **Application Errors**
- Not eligible
- IPO closed
- Server errors

✅ **Scheduler Errors**
- Database connection issues
- Corrupted schedule
- Job execution failures

All errors are logged and the schedule auto-disables after 5 failures.

---

## Performance Optimization

### Caching
- Schedules cached in memory
- Job registry in Map structure
- Quick lookups by ID

### Database Queries
- Indexed by userId, clientId
- Selective field retrieval
- Efficient aggregations

### API Calls
- Rate limited at 2-5 second intervals
- Random jitter prevents detection
- Batch operations where possible

---

## Scaling Considerations

For multiple users/schedules:

1. **Job Queue**: Consider moving to Bull/Redis for large scale
2. **Database**: Add connection pooling
3. **Caching**: Implement Redis caching layer
4. **Load Balancing**: Use PM2 for clustering
5. **Monitoring**: Add alerting system

---

## Security Best Practices

1. **Credentials**
   - Encrypt passwords before storing
   - Use environment variables
   - Rotate credentials regularly

2. **API Access**
   - Use HTTPS only
   - Implement rate limiting
   - Add IP whitelisting

3. **Database**
   - Use connection pooling
   - Enable encryption at rest
   - Regular backups

4. **Audit**
   - Log all operations
   - Monitor for suspicious activity
   - Set up alerts

---

## Deployment

### Docker Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["npm", "run", "server"]
```

### Environment Variables

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
PORT=3000
JWT_SECRET=your_secret_key
ADMIN_USER=admin
ADMIN_PASS=secure_password
```

---

## Monitoring & Maintenance

### Regular Checks
- Monitor logs for errors
- Check daily application counts
- Verify schedules are running
- Update dependencies

### Maintenance Tasks
- Clear old logs (>30 days)
- Verify database integrity
- Test backup/restore
- Security updates

---

## Support & Documentation

📚 **Documentation Files**:
- [AUTOMATION_DOCS.md](../AUTOMATION_DOCS.md) - Complete API reference
- [AUTOMATION_SETUP.md](../AUTOMATION_SETUP.md) - Quick start guide
- [AUTOMATION_IMPLEMENTATION.md](../AUTOMATION_IMPLEMENTATION.md) - Implementation details

📧 **Getting Help**:
- Check logs at `/api/automation/logs`
- Test connection manually
- Review error messages
- Consult API documentation

---

## Quick Reference

| Task | Location |
|------|----------|
| View Logs | `/api/automation/logs` |
| Dashboard Stats | `/api/automation/stats` |
| Test Connection | `POST /api/automation/test/:clientId` |
| Create Schedule | `POST /api/automation/schedule` |
| View Schedules | `GET /api/automation/schedules` |
| Trigger Manual | `POST /api/automation/trigger/:id` |

---

## Success Checklist

- [ ] ✅ npm install completed
- [ ] ✅ MongoDB connected
- [ ] ✅ Server running (npm run server)
- [ ] ✅ Frontend running (npm run dev)
- [ ] ✅ Created first client
- [ ] ✅ Tested connection
- [ ] ✅ Created first schedule
- [ ] ✅ Viewed automation manager
- [ ] ✅ Checked activity logs
- [ ] ✅ Verified execution

---

**Ready to automate! 🚀**

Questions? Check the [documentation](../AUTOMATION_DOCS.md) or test the connection manually.

---

*Last Updated: June 2024*
