import React, { useState, useEffect } from 'react'; // ✅ Added React to imports
import axios from 'axios';

export default function ClientManagement({ clientId, onSuccess, onCancel }) {
    const [form, setForm] = useState({
        name: '',
        dpId: '',
        username: '',
        password: '',
        pin: '',
        crn: '',
        demat: '', 
        bankCode: '',
        noOfShare: 10,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (clientId) {
            fetchClient();
        }
    }, [clientId]);

    const fetchClient = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/clients/${clientId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForm({
                name: res.data.name || '',
                dpId: res.data.dpId || '',
                username: res.data.username || '',
                password: res.data.password || '',
                pin: res.data.pin || '',
                crn: res.data.crn || '',
                demat: res.data.demat || '', 
                bankCode: res.data.bankCode || '',
                noOfShare: res.data.noOfShare || 10,
            });
        } catch (err) {
            setError('Failed to load client data');
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'noOfShare' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!form.name || !form.dpId || !form.username || !form.password || !form.pin || !form.crn || !form.demat) {
            setError('All required fields must be filled');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (clientId) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/clients/${clientId}`, form, config);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/clients`, form, config);
            }

            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save client');
            console.error('Save error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mc-form-container">
            <h2 className="mc-title">{clientId ? 'Edit Client' : 'Add New Client'}</h2>

            {error && <div style={{ color: '#dc2626', padding: '12px', marginBottom: '16px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{error}</div>}

            {/* ✅ ADDED THE FORM TAG HERE TO FIX THE WARNING */}
            <form onSubmit={handleSubmit}>
                <label className="mc-label">Display Name *</label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mc-input"
                    placeholder="e.g., Saugat Magar"
                    required
                />

                <label className="mc-label">DP ID *</label>
                <input
                    type="text"
                    name="dpId"
                    value={form.dpId}
                    onChange={handleChange}
                    className="mc-input"
                    placeholder="e.g., 130"
                    required
                />

                <div className="mc-header-row" style={{ marginTop: '24px' }}>
                    <div style={{ flex: 1, marginRight: '12px' }}>
                        <label className="mc-label" style={{ marginTop: '0' }}>Username *</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            className="mc-input"
                            placeholder="MeroShare Username"
                            required
                        />
                    </div>
                    <div style={{ flex: 1, marginLeft: '12px' }}>
                        <label className="mc-label" style={{ marginTop: '0' }}>Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="mc-input"
                            placeholder="MeroShare Password"
                            required
                        />
                    </div>
                </div>

                <div className="mc-header-row">
                    <div style={{ flex: 1, marginRight: '12px' }}>
                        <label className="mc-label" style={{ marginTop: '0' }}>Transaction PIN *</label>
                        <input
                            type="password"
                            name="pin"
                            value={form.pin}
                            onChange={handleChange}
                            className="mc-input"
                            placeholder="4-digit PIN"
                            maxLength="4"
                            required
                        />
                    </div>
                    <div style={{ flex: 1, marginLeft: '12px' }}>
                        <label className="mc-label" style={{ marginTop: '0' }}>CRN *</label>
                        <input
                            type="text"
                            name="crn"
                            value={form.crn}
                            onChange={handleChange}
                            className="mc-input"
                            placeholder="e.g., 01-R01247238"
                            required
                        />
                    </div>
                </div>

                <label className="mc-label">Demat Number *</label>
                <input
                    type="text"
                    name="demat"
                    value={form.demat}
                    onChange={handleChange}
                    className="mc-input"
                    placeholder="e.g., 1301370004752141"
                    required
                />

                <div className="mc-header-row">
                    <div style={{ flex: 1, marginRight: '12px' }}>
                        <label className="mc-label" style={{ marginTop: '0' }}>Bank Code</label>
                        <input
                            type="text"
                            name="bankCode"
                            value={form.bankCode}
                            onChange={handleChange}
                            className="mc-input"
                            placeholder="e.g., 030 (for Nabil)"
                        />
                    </div>
                    <div style={{ flex: 1, marginLeft: '12px' }}>
                        <label className="mc-label" style={{ marginTop: '0' }}>Number of Shares</label>
                        <input
                            type="number"
                            name="noOfShare"
                            value={form.noOfShare}
                            onChange={handleChange}
                            className="mc-input"
                            placeholder="10"
                            min="1"
                            max="100"
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                    <button type="submit" disabled={loading} className="mc-btn-primary">
                        {loading ? 'Saving...' : '💾 Save Client'}
                    </button>
                    {onCancel && (
                        <button type="button" onClick={onCancel} className="mc-btn-secondary">
                            Cancel
                        </button>
                    )}
                </div>
            </form> {/* ✅ CLOSED THE FORM TAG HERE */}
        </div>
    );
}