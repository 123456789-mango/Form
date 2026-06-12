import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AutomationManager.css'; // Ensure this CSS file exists

export default function AutomationManager() {
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  
  // Configuration States
  const [startDateTime, setStartDateTime] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(2);
  const [targetShareId, setTargetShareId] = useState('');
  
  // Execution States
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadClients();
    // Set default start time to current local time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setStartDateTime(now.toISOString().slice(0, 16));
  }, []);

  const loadClients = async () => {
    try {
      const res = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setClients(res.data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  const toggleClient = (id) => {
    setSelectedClients(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(c => c._id));
    }
  };

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, time }]);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const startAutomation = async () => {
    if (selectedClients.length === 0) {
      alert('Please select at least one client to apply for.');
      return;
    }
    
    const startTime = new Date(startDateTime);
    const confirmMsg = `Start applying for ${selectedClients.length} accounts?\n\nStart Time: ${startTime.toLocaleString()}\nDelay between accounts: ${delayMinutes} minutes`;
    
    if (!window.confirm(confirmMsg)) return;

    setIsRunning(true);
    setLogs([]);
    addLog(`🚀 Batch initialized for ${selectedClients.length} accounts.`);

    // 1. Wait until the specified Start Time (if it's in the future)
    const now = new Date();
    const initialDelay = startTime - now;
    if (initialDelay > 0) {
      addLog(`⏳ Waiting until ${startTime.toLocaleString()} to start...`);
      await sleep(initialDelay);
    }

    // 2. Process each client sequentially
    for (let i = 0; i < selectedClients.length; i++) {
      const clientId = selectedClients[i];
      const client = clients.find(c => c._id === clientId);
      
      addLog(`🔄 [${i + 1}/${selectedClients.length}] Processing: ${client.name}...`);

      try {
        const res = await axios.post('/api/automation/apply', { 
          clientId, 
          targetShareId 
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        addLog(`✅ Success: ${client.name} - ${res.data.message}`, 'success');
      } catch (err) {
        const errMsg = err.response?.data?.error || err.message;
        addLog(`❌ Failed: ${client.name} - ${errMsg}`, 'error');
      }

      // 3. Wait for the specified delay before the next account (if not the last one)
      if (i < selectedClients.length - 1) {
        addLog(`⏳ Waiting ${delayMinutes} minutes before next account...`);
        await sleep(delayMinutes * 60 * 1000);
      }
    }

    addLog('🏁 Batch automation completed!');
    setIsRunning(false);
  };

  return (
    <div className="automation-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🤖 Sequential IPO Automation</h1>
      <p style={{ color: '#666' }}>Select accounts, set your timing, and let the system apply sequentially.</p>

      {/* Configuration Panel */}
      <div className="config-card" style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>⚙️ Configuration</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '10px' }}>
          <div>
            <label>Start Time</label>
            <input 
              type="datetime-local" 
              value={startDateTime} 
              onChange={(e) => setStartDateTime(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label>Delay Between Accounts (Mins)</label>
            <input 
              type="number" 
              min="1" 
              value={delayMinutes} 
              onChange={(e) => setDelayMinutes(parseInt(e.target.value))}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div>
            <label>Target IPO ID (Optional)</label>
            <input 
              type="text" 
              value={targetShareId} 
              onChange={(e) => setTargetShareId(e.target.value)}
              placeholder="Leave blank for auto-select"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>
      </div>

      {/* Client Selection */}
      <div className="clients-card" style={{ background: '#fff', border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>👥 Select Accounts ({selectedClients.length} selected)</h3>
          <button onClick={selectAll} style={{ padding: '5px 10px', cursor: 'pointer' }}>
            {selectedClients.length === clients.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
          {clients.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No clients found. Please add clients first.</p>
          ) : (
            clients.map(client => (
              <div key={client._id} style={{ 
                padding: '10px 15px', 
                borderBottom: '1px solid #f0f0f0', 
                display: 'flex', 
                alignItems: 'center',
                background: selectedClients.includes(client._id) ? '#e6f7ff' : 'transparent'
              }}>
                <input 
                  type="checkbox" 
                  checked={selectedClients.includes(client._id)} 
                  onChange={() => toggleClient(client._id)}
                  style={{ marginRight: '15px', width: '18px', height: '18px' }}
                />
                <div>
                  <strong>{client.name}</strong>
                  <span style={{ color: '#666', marginLeft: '10px', fontSize: '0.9em' }}>
                    ({client.username})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={startAutomation} 
        disabled={isRunning || selectedClients.length === 0}
        style={{
          width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold',
          background: isRunning ? '#ccc' : '#007bff', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: isRunning ? 'not-allowed' : 'pointer', marginBottom: '20px'
        }}
      >
        {isRunning ? '⏳ Automation Running... (Keep this tab open)' : '🚀 Start Batch Apply'}
      </button>

      {/* Live Logs */}
      {logs.length > 0 && (
        <div className="logs-card" style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', maxHeight: '400px', overflowY: 'auto' }}>
          <h3 style={{ color: '#fff', marginTop: 0 }}>📋 Live Activity Log</h3>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
              <span style={{ color: '#858585', marginRight: '10px' }}>[{log.time}]</span>
              <span style={{ 
                color: log.type === 'success' ? '#4ec9b0' : log.type === 'error' ? '#f48771' : '#dcdcaa' 
              }}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}