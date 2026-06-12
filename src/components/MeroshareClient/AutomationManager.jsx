import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AutomationManager.css';

// Removed unused 'userId' prop to fix Vite/Rolldown parser crash and ESLint warning
const AutomationManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    scheduleType: 'hourly',
    intervalHours: 2,
    specificTimes: [],
    timeRangeStart: '09:00',
    timeRangeEnd: '17:00',
    frequencyInRange: 30,
    maxSharesPerDay: 10,
    targetCompanyShareId: '',
    notes: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [testingClientId, setTestingClientId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    loadSchedules();
    loadClients();
    loadStats();
    loadLogs();

    const interval = setInterval(() => {
      loadStats();
      loadLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadSchedules = async () => {
    try {
      const response = await axios.get('/api/automation/schedules', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSchedules(response.data);
    } catch (err) {
      setError('Failed to load schedules');
      console.error(err);
    }
  };

  const loadClients = async () => {
    try {
      const response = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setClients(response.data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/automation/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await axios.get('/api/automation/logs?limit=20', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLogs(response.data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['intervalHours', 'maxSharesPerDay', 'frequencyInRange'];
    setFormData({
      ...formData,
      [name]: numericFields.includes(name) ? parseInt(value) : value,
    });
  };

  const handleSpecificTimesChange = (index, value) => {
    const newTimes = [...(formData.specificTimes || [])];
    newTimes[index] = value;
    setFormData({ ...formData, specificTimes: newTimes });
  };

  const addTimeField = () => {
    setFormData({
      ...formData,
      specificTimes: [...(formData.specificTimes || []), '09:15'],
    });
  };

  const removeTimeField = (index) => {
    const newTimes = formData.specificTimes.filter((_, i) => i !== index);
    setFormData({ ...formData, specificTimes: newTimes });
  };

  const testClient = async (clientId) => {
    setTestingClientId(clientId);
    setTestResult(null);
    try {
      const response = await axios.post(`/api/automation/test/${clientId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTestResult({
        success: true,
        data: response.data.details,
      });
      setSuccess('Connection test successful!');
    } catch (err) {
      setTestResult({
        success: false,
        error: err.response?.data?.error || err.message,
      });
      setError('Connection test failed');
    }
    setTestingClientId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await axios.put(`/api/automation/schedule/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSuccess('Schedule updated successfully!');
        setEditingId(null);
      } else {
        await axios.post('/api/automation/schedule', formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setSuccess('Schedule created successfully!');
      }

      setFormData({
        clientId: '',
        scheduleType: 'hourly',
        intervalHours: 2,
        specificTimes: [],
        timeRangeStart: '09:00',
        timeRangeEnd: '17:00',
        frequencyInRange: 30,
        maxSharesPerDay: 10,
        targetCompanyShareId: '',
        notes: '',
      });
      setShowForm(false);

      loadSchedules();
      loadStats();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    setFormData({
      clientId: schedule.clientId._id,
      scheduleType: schedule.scheduleType,
      intervalHours: schedule.intervalHours || 2,
      specificTimes: schedule.specificTimes || [],
      timeRangeStart: schedule.timeRangeStart || '09:00',
      timeRangeEnd: schedule.timeRangeEnd || '17:00',
      frequencyInRange: schedule.frequencyInRange || 30,
      maxSharesPerDay: schedule.maxSharesPerDay || 10,
      targetCompanyShareId: schedule.targetCompanyShareId || '',
      notes: schedule.notes || '',
    });
    setEditingId(schedule._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;

    try {
      await axios.delete(`/api/automation/schedule/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess('Schedule deleted successfully!');
      loadSchedules();
      loadStats();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleTrigger = async (id) => {
    setLoading(true);
    try {
      await axios.post(`/api/automation/trigger/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccess('Schedule triggered manually!');
      loadSchedules();
      loadLogs();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (schedule) => {
    try {
      await axios.put(
        `/api/automation/schedule/${schedule._id}`,
        { isActive: !schedule.isActive },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setSuccess(schedule.isActive ? 'Schedule deactivated' : 'Schedule activated');
      loadSchedules();
      loadStats();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const getScheduleTypeLabel = (type) => {
    const labels = {
      hourly: 'Every N Hours',
      'specific-time': 'Specific Times Daily',
      'time-range': 'Within Time Range',
      daily: 'Daily',
      once: 'One-Time',
    };
    return labels[type] || type;
  };

  const getScheduleDescription = (sched) => {
    switch (sched.scheduleType) {
      case 'hourly':
        return `Every ${sched.intervalHours} hour(s)`;
      case 'specific-time':
        return `At ${sched.specificTimes?.join(', ')}`;
      case 'time-range':
        return `${sched.timeRangeStart}-${sched.timeRangeEnd} every ${sched.frequencyInRange}min`;
      case 'daily':
        return `Daily at ${sched.specificTimes?.[0]}`;
      case 'once':
        return `Once at ${new Date(sched.nextScheduledTime).toLocaleString()}`;
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="automation-manager">
      <div className="automation-header">
        <h1>🤖 MeroShare Automation</h1>
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + New Schedule
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Schedules</h3>
            <div className="value">{stats.totalSchedules}</div>
          </div>
          <div className="stat-card">
            <h3>Active Schedules</h3>
            <div className="value">{stats.activeSchedules}</div>
          </div>
          <div className="stat-card">
            <h3>Applied Today</h3>
            <div className="value">{stats.totalAppliedToday}</div>
          </div>
          <div className="stat-card">
            <h3>Active Jobs</h3>
            <div className="value">{stats.activeJobs}</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? 'Edit Schedule' : 'Create New Schedule'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="clientId">Client *</label>
                <select
                  name="clientId"
                  id="clientId"
                  value={formData.clientId}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name} ({client.username})
                    </option>
                  ))}
                </select>
                {formData.clientId && (
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => testClient(formData.clientId)}
                    disabled={testingClientId === formData.clientId}
                  >
                    {testingClientId === formData.clientId ? 'Testing...' : '🧪 Test Connection'}
                  </button>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="scheduleType">Schedule Type *</label>
                <select
                  name="scheduleType"
                  id="scheduleType"
                  value={formData.scheduleType}
                  onChange={handleFormChange}
                >
                  <option value="hourly">Every N Hours</option>
                  <option value="specific-time">Specific Times Daily</option>
                  <option value="daily">Daily</option>
                  <option value="time-range">Within Time Range</option>
                  <option value="once">One-Time</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="maxSharesPerDay">Max Per Day *</label>
                <input
                  type="number"
                  name="maxSharesPerDay"
                  id="maxSharesPerDay"
                  value={formData.maxSharesPerDay}
                  onChange={handleFormChange}
                  min="1"
                  max="50"
                />
              </div>
            </div>

            {testResult && (
              <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                <h4>{testResult.success ? '✅ Test Successful' : '❌ Test Failed'}</h4>
                <div className="test-result-content">
                  {testResult.success ? (
                    <>
                      <p><strong>User:</strong> {testResult.data.username}</p>
                      <p><strong>DEMAT:</strong> {testResult.data.demat}</p>
                      <p><strong>BOID:</strong> {testResult.data.boid}</p>
                      <p><strong>Available IPOs:</strong> {testResult.data.applicableIssuesCount}</p>
                    </>
                  ) : (
                    <p>{testResult.error}</p>
                  )}
                </div>
              </div>
            )}

            <div className="conditional-fields">
              {formData.scheduleType === 'hourly' && (
                <div className="form-group">
                  <label htmlFor="intervalHours">Interval (hours) *</label>
                  <input
                    type="number"
                    name="intervalHours"
                    id="intervalHours"
                    value={formData.intervalHours}
                    onChange={handleFormChange}
                    min="1"
                    max="24"
                  />
                </div>
              )}

              {(formData.scheduleType === 'specific-time' || formData.scheduleType === 'daily') && (
                <div className="time-fields">
                  <label>Application Times</label>
                  {(formData.specificTimes || []).map((time, index) => (
                    <div key={index} className="time-input-row">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleSpecificTimesChange(index, e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeTimeField(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-add" onClick={addTimeField}>
                    + Add Time
                  </button>
                </div>
              )}

              {formData.scheduleType === 'time-range' && (
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="timeRangeStart">Start Time</label>
                    <input
                      type="time"
                      name="timeRangeStart"
                      id="timeRangeStart"
                      value={formData.timeRangeStart}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="timeRangeEnd">End Time</label>
                    <input
                      type="time"
                      name="timeRangeEnd"
                      id="timeRangeEnd"
                      value={formData.timeRangeEnd}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="frequencyInRange">Frequency (minutes)</label>
                    <input
                      type="number"
                      name="frequencyInRange"
                      id="frequencyInRange"
                      value={formData.frequencyInRange}
                      onChange={handleFormChange}
                      min="5"
                      max="120"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="targetCompanyShareId">Target IPO (optional)</label>
                <input
                  type="text"
                  name="targetCompanyShareId"
                  id="targetCompanyShareId"
                  value={formData.targetCompanyShareId}
                  onChange={handleFormChange}
                  placeholder="Leave blank for auto-select"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <input
                  type="text"
                  name="notes"
                  id="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="e.g., Primary account"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setTestResult(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Schedule' : 'Create Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="schedules-container">
        <div className="schedules-header">
          <h2>📅 Schedules ({schedules.length})</h2>
        </div>
        {schedules.length === 0 ? (
          <div className="empty-state">
            <p>No schedules created yet. Create your first automation schedule to get started!</p>
          </div>
        ) : (
          schedules.map((schedule) => (
            <div key={schedule._id} className="schedule-item">
              <div className="schedule-info">
                <div className="schedule-info-item">
                  <label>Client</label>
                  <div>{schedule.clientId?.name}</div>
                </div>
                <div className="schedule-info-item">
                  <label>Type</label>
                  <div>{getScheduleTypeLabel(schedule.scheduleType)}</div>
                </div>
                <div className="schedule-info-item">
                  <label>Details</label>
                  <div>{getScheduleDescription(schedule)}</div>
                </div>
                <div className="schedule-info-item">
                  <label>Applied Today</label>
                  <div>{schedule.appliedTodayCount}/{schedule.maxSharesPerDay}</div>
                </div>
                <div className="schedule-info-item">
                  <label>Last Applied</label>
                  <div>{schedule.lastApplied ? new Date(schedule.lastApplied).toLocaleTimeString() : 'Never'}</div>
                </div>
                <div className="schedule-info-item">
                  <label>Status</label>
                  <span className={`status-badge ${schedule.isActive ? 'status-active' : 'status-inactive'}`}>
                    {schedule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="schedule-actions">
                <button className="btn-small btn-trigger" onClick={() => handleTrigger(schedule._id)} disabled={loading} type="button">
                  ▶️ Trigger
                </button>
                <button className="btn-small btn-toggle" onClick={() => handleToggleActive(schedule)} type="button">
                  {schedule.isActive ? '⏸ Pause' : '▶ Resume'}
                </button>
                <button className="btn-small btn-edit" onClick={() => handleEdit(schedule)} type="button">
                  ✏️ Edit
                </button>
                <button className="btn-small btn-delete" onClick={() => handleDelete(schedule._id)} type="button">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {logs.length > 0 && (
        <div className="logs-container">
          <div className="logs-header">
            <h2>📋 Recent Activity</h2>
          </div>
          {logs.map((log, index) => (
            <div key={index} className="log-item">
              <div className="log-time">{new Date(log.timestamp).toLocaleString()}</div>
              <div className={`log-type ${log.type.includes('SUCCESS') ? 'success' : log.type.includes('ERROR') ? 'error' : 'info'}`}>
                {log.type}
              </div>
              <div className="log-message">{log.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomationManager;