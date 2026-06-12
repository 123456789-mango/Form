import { useState, useEffect } from 'react';
import axios from 'axios';
import ClientManagement from '../components/ClientManagement';
import '../styles/MetallicChic.css';

export default function ClientList() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/clients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(res.data);
        } catch (err) {
            console.error('Failed to fetch clients:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this client?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(clients.filter(c => c._id !== id));
        } catch (err) {
            alert('Failed to delete client');
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingId(null);
        fetchClients();
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.dpId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showForm || editingId) {
        return (
            <ClientManagement
                clientId={editingId}
                onSuccess={handleFormSuccess}
                onCancel={handleCancel}
            />
        );
    }

    if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading clients...</p>;

    return (
        <div className="mc-page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="mc-title">Clients Management ({clients.length})</h2>
                <button onClick={() => setShowForm(true)} className="mc-btn-primary">
                    ➕ Add New Client
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search by name, username, or DP ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mc-input"
                />
            </div>

            {filteredClients.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                    {searchTerm ? 'No clients match your search' : 'No clients yet. Add your first client!'}
                </p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Name</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Username</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>DP ID</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Shares</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>CRN</th>
                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client) => (
                                <tr key={client._id} style={{ borderBottom: '1px solid #e5e7eb', '&:hover': { backgroundColor: '#f9fafb' } }}>
                                    <td style={{ padding: '12px', color: '#1f2937' }}>{client.name}</td>
                                    <td style={{ padding: '12px', color: '#6b7280' }}>{client.username}</td>
                                    <td style={{ padding: '12px', color: '#6b7280' }}>{client.dpId}</td>
                                    <td style={{ padding: '12px', color: '#6b7280' }}>{client.noOfShare}</td>
                                    <td style={{ padding: '12px', color: '#6b7280' }}>{client.crn}</td>
                                    <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => setEditingId(client._id)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#3b82f6',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(client._id)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#ef4444',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
