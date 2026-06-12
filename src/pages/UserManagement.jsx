import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MetallicChic.css';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleEditStart = (user) => {
        setEditingId(user._id);
        setEditForm({
            displayName: user.displayName,
            email: user.email,
            phone: user.phone,
            department: user.department,
            role: user.role,
            bio: user.bio
        });
        setError('');
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/users/${userId}`,
                editForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.map(u => u._id === userId ? res.data : u));
            setEditingId(null);
            setSuccess('User updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u._id !== userId));
            setSuccess('User deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading users...</p>;

    return (
        <div className="mc-page-container">
            <h2 className="mc-title">Users Management</h2>

            {error && <div style={{ color: '#dc2626', padding: '12px', marginBottom: '16px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{error}</div>}
            {success && <div style={{ color: '#059669', padding: '12px', marginBottom: '16px', backgroundColor: '#d1fae5', borderRadius: '6px' }}>{success}</div>}

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search by username, name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mc-input"
                />
            </div>

            {filteredUsers.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                    {searchTerm ? 'No users match your search' : 'No users found'}
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
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Username</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Display Name</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Email</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Phone</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Role</th>
                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                editingId === user._id ? (
                                    <tr key={user._id} style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '12px' }}>{user.username}</td>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="text"
                                                name="displayName"
                                                value={editForm.displayName}
                                                onChange={handleEditChange}
                                                className="mc-input"
                                                style={{ fontSize: '12px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="email"
                                                name="email"
                                                value={editForm.email}
                                                onChange={handleEditChange}
                                                className="mc-input"
                                                style={{ fontSize: '12px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={editForm.phone}
                                                onChange={handleEditChange}
                                                className="mc-input"
                                                style={{ fontSize: '12px' }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <select
                                                name="role"
                                                value={editForm.role}
                                                onChange={handleEditChange}
                                                className="mc-input"
                                                style={{ fontSize: '12px' }}
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="user">User</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => handleUpdateUser(user._id)}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#10b981',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '11px'
                                                }}
                                            >
                                                ✓ Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#6b7280',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '11px'
                                                }}
                                            >
                                                ✕ Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '12px', color: '#1f2937', fontWeight: '600' }}>{user.username}</td>
                                        <td style={{ padding: '12px', color: '#6b7280' }}>{user.displayName || '—'}</td>
                                        <td style={{ padding: '12px', color: '#6b7280' }}>{user.email || '—'}</td>
                                        <td style={{ padding: '12px', color: '#6b7280' }}>{user.phone || '—'}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                backgroundColor: user.role === 'admin' ? '#dbeafe' : '#dcfce7',
                                                color: user.role === 'admin' ? '#1e40af' : '#166534',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '600'
                                            }}>
                                                {user.role?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => handleEditStart(user)}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#3b82f6',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '11px'
                                                }}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#ef4444',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '11px'
                                                }}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
