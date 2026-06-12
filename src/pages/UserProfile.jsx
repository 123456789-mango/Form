import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MetallicChic.css';

export default function UserProfile() {
    const [user, setUser] = useState({
        username: '',
        email: '',
        displayName: '',
        phone: '',
        department: '',
        bio: '',
        role: ''
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
        setSuccess('');
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
        setSuccess('');
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/users/me`,
                {
                    displayName: user.displayName,
                    email: user.email,
                    phone: user.phone,
                    department: user.department,
                    bio: user.bio
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(res.data);
            setEditing(false);
            setSuccess('Profile updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwords.newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/api/users/me/password`,
                {
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setChangingPassword(false);
            setSuccess('Password changed successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user.username) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading profile...</p>;

    return (
        <div className="mc-page-container">
            <h2 className="mc-title">User Profile</h2>

            {error && <div style={{ color: '#dc2626', padding: '12px', marginBottom: '16px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{error}</div>}
            {success && <div style={{ color: '#059669', padding: '12px', marginBottom: '16px', backgroundColor: '#d1fae5', borderRadius: '6px' }}>{success}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                {/* Profile Information */}
                <div className="mc-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className="mc-title" style={{ fontSize: '18px', margin: 0 }}>Profile Information</h3>
                        {!editing && (
                            <button onClick={() => setEditing(true)} className="mc-btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                ✏️ Edit
                            </button>
                        )}
                    </div>

                    {!editing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label className="mc-sub-label">Username</label>
                                <p style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>{user.username}</p>
                            </div>
                            <div>
                                <label className="mc-sub-label">Display Name</label>
                                <p style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>{user.displayName || '—'}</p>
                            </div>
                            <div>
                                <label className="mc-sub-label">Email</label>
                                <p style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>{user.email || '—'}</p>
                            </div>
                            <div>
                                <label className="mc-sub-label">Phone</label>
                                <p style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>{user.phone || '—'}</p>
                            </div>
                            <div>
                                <label className="mc-sub-label">Department</label>
                                <p style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>{user.department || '—'}</p>
                            </div>
                            <div>
                                <label className="mc-sub-label">Role</label>
                                <p style={{ margin: 0, color: '#1f2937', fontWeight: '500' }}>
                                    <span style={{
                                        backgroundColor: user.role === 'admin' ? '#dbeafe' : '#dcfce7',
                                        color: user.role === 'admin' ? '#1e40af' : '#166534',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        {user.role?.toUpperCase() || 'USER'}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <label className="mc-sub-label">Bio</label>
                                <p style={{ margin: 0, color: '#1f2937', fontWeight: '500', wordBreak: 'break-word' }}>{user.bio || '—'}</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label className="mc-label" style={{ marginBottom: '6px' }}>Display Name</label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={user.displayName}
                                    onChange={handleUserChange}
                                    className="mc-input"
                                    placeholder="Your display name"
                                />
                            </div>
                            <div>
                                <label className="mc-label" style={{ marginBottom: '6px' }}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    onChange={handleUserChange}
                                    className="mc-input"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            <div>
                                <label className="mc-label" style={{ marginBottom: '6px' }}>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={user.phone}
                                    onChange={handleUserChange}
                                    className="mc-input"
                                    placeholder="+977 98XXXXXXXX"
                                />
                            </div>
                            <div>
                                <label className="mc-label" style={{ marginBottom: '6px' }}>Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={user.department}
                                    onChange={handleUserChange}
                                    className="mc-input"
                                    placeholder="Your department"
                                />
                            </div>
                            <div>
                                <label className="mc-label" style={{ marginBottom: '6px' }}>Bio</label>
                                <textarea
                                    name="bio"
                                    value={user.bio}
                                    onChange={handleUserChange}
                                    className="mc-input"
                                    placeholder="Tell us about yourself..."
                                    rows="3"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <button type="submit" disabled={loading} className="mc-btn-primary" style={{ flex: 1 }}>
                                    💾 Save Changes
                                </button>
                                <button type="button" onClick={() => setEditing(false)} className="mc-btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Change Password */}
                <div className="mc-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 className="mc-title" style={{ fontSize: '18px', margin: 0 }}>Security</h3>
                        {!changingPassword && (
                            <button onClick={() => setChangingPassword(true)} className="mc-btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                                🔐 Change Password
                            </button>
                        )}
                    </div>

                    {changingPassword ? (
                        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label className="mc-label" style={{ marginBottom: '6px' }}>Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwords.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="mc-input"
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mc-label" style={{ marginBottom: '6px' }}>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwords.newPassword}
                                    onChange={handlePasswordChange}
                                    className="mc-input"
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mc-label" style={{ marginBottom: '6px' }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwords.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="mc-input"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <button type="submit" disabled={loading} className="mc-btn-primary" style={{ flex: 1 }}>
                                    🔄 Update Password
                                </button>
                                <button type="button" onClick={() => setChangingPassword(false)} className="mc-btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{ color: '#6b7280', fontSize: '14px' }}>
                            <p>🔒 Keep your account secure by updating your password regularly.</p>
                            <p style={{ marginTop: '8px' }}>Password requirements:</p>
                            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                                <li>At least 6 characters long</li>
                                <li>Mix of uppercase, lowercase, and numbers recommended</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Details */}
            <div className="mc-card" style={{ marginTop: '24px' }}>
                <h3 className="mc-title" style={{ fontSize: '18px', marginBottom: '16px' }}>Account Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '13px' }}>
                    <div>
                        <label className="mc-sub-label">Account Created</label>
                        <p style={{ margin: 0, color: '#1f2937' }}>{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <label className="mc-sub-label">Last Updated</label>
                        <p style={{ margin: 0, color: '#1f2937' }}>{new Date(user.updatedAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
