import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClientManagement({ clientId, onSuccess, onCancel }) {
    const [form, setForm] = useState({
        id: '',
        name: '',
        dpId: '',
        username: '',
        password: '',
        pin: '',
        crn: '',
        noOfShare: 0,
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
            setForm(res.data);
        } catch (err) {
            setError('Failed to load client data');
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

        // Validation
        if (!form.name || !form.dpId || !form.username || !form.password || !form.pin || !form.crn) {
            setError('All fields are required');
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mc-form-container">
            <h2 className="mc-title">{clientId ? 'Edit Client' : 'Add New Client'}</h2>

            {error && <div style={{ color: '#dc2626', padding: '12px', marginBottom: '16px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <label className="mc-label">Client ID</label>
                <input
                    type="text"
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    className="mc-input"
                    placeholder="Client unique ID"
                />

                <label className="mc-label">Display Name</label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mc-input"
                    placeholder="Display name"
                    required
                />

                <label className="mc-label">DP ID (Client ID)</label>
                <input
                    type="text"
                    name="dpId"
                    value={form.dpId}
                    onChange={handleChange}
                    className="mc-input"
                    placeholder="DP ID / Client ID"
                    required
                />

                <div className="mc-header-row" style={{ marginTop: '24px' }}>
                    <div style={{ flex: 1 }}>
                        <label className="mc-label" style={{ marginTop: '0' }}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            className="mc-input"
                            placeholder="Username"
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="mc-label" style={{ marginTop: '0' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="mc-input"
                            placeholder="Password"
                            required
                        />
                    </div>
                </div>

                <div className="mc-header-row">
                    <div style={{ flex: 1 }}>
                        <label className="mc-label" style={{ marginTop: '0' }}>Transaction PIN</label>
                        <input
                            type="password"
                            name="pin"
                            value={form.pin}
                            onChange={handleChange}
                            className="mc-input"
                            placeholder="4-digit PIN"
                            required
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="mc-label" style={{ marginTop: '0' }}>CRN</label>
                        <input
                            type="text"
                            name="crn"
                            value={form.crn}
                            onChange={handleChange}
                            className="mc-input"
                            placeholder="CRN"
                            required
                        />
                    </div>
                </div>

                <label className="mc-label">Number of Shares</label>
                <input
                    type="number"
                    name="noOfShare"
                    value={form.noOfShare}
                    onChange={handleChange}
                    className="mc-input"
                    placeholder="0"
                />

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
            </form>
        </div>
    );
}
