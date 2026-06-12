import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MetallicChic.css';

export default function RoleManagement() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [
            { feature: 'posts', canCreate: false, canRead: false, canUpdate: false, canDelete: false },
            { feature: 'clients', canCreate: false, canRead: false, canUpdate: false, canDelete: false },
            { feature: 'users', canCreate: false, canRead: false, canUpdate: false, canDelete: false },
            { feature: 'roles', canCreate: false, canRead: false, canUpdate: false, canDelete: false }
        ],
        isActive: true
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(res.data);
        } catch (err) {
            setError('Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handlePermissionChange = (featureIndex, permission) => {
        const updated = [...formData.permissions];
        updated[featureIndex][permission] = !updated[featureIndex][permission];
        setFormData(prev => ({ ...prev, permissions: updated }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('Role name is required');
            return;
        }

        if (formData.name.toLowerCase() === 'admin' && !editingId) {
            setError('Cannot create a role named "admin". The admin role is system-defined.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (editingId) {
                const res = await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/roles/${editingId}`,
                    formData,
                    config
                );
                setRoles(roles.map(r => r._id === editingId ? res.data : r));
                setSuccess('Role updated successfully');
            } else {
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/roles`,
                    formData,
                    config
                );
                setRoles([res.data, ...roles]);
                setSuccess('Role created successfully');
            }

            resetForm();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save role');
        }
    };

    const handleEdit = (role) => {
        setEditingId(role._id);
        setFormData({
            name: role.name,
            description: role.description,
            permissions: role.permissions,
            isActive: role.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (id, roleName) => {
        if (roleName.toLowerCase() === 'admin') {
            setError('Cannot delete the admin role. This is a system-defined role.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this role?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/roles/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRoles(roles.filter(r => r._id !== id));
            setSuccess('Role deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete role');
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            permissions: [
                { feature: 'posts', canCreate: false, canRead: false, canUpdate: false, canDelete: false },
                { feature: 'clients', canCreate: false, canRead: false, canUpdate: false, canDelete: false },
                { feature: 'users', canCreate: false, canRead: false, canUpdate: false, canDelete: false },
                { feature: 'roles', canCreate: false, canRead: false, canUpdate: false, canDelete: false }
            ],
            isActive: true
        });
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading roles...</p>;

    return (
        <div className="mc-page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 className="mc-title">Roles Management</h2>
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="mc-btn-primary">
                        ➕ Add New Role
                    </button>
                )}
            </div>

            {error && <div style={{ color: '#dc2626', padding: '12px', marginBottom: '16px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{error}</div>}
            {success && <div style={{ color: '#059669', padding: '12px', marginBottom: '16px', backgroundColor: '#d1fae5', borderRadius: '6px' }}>{success}</div>}

            {showForm && (
                <div className="mc-card" style={{ marginBottom: '24px' }}>
                    <h3 className="mc-title" style={{ fontSize: '18px', marginBottom: '16px' }}>
                        {editingId ? 'Edit Role' : 'Create New Role'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <label className="mc-label">Role Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="mc-input"
                            placeholder="e.g., Editor, Viewer, Manager"
                            required
                        />

                        <label className="mc-label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="mc-input"
                            placeholder="Describe this role..."
                            rows="3"
                        />

                        <label className="mc-label">Permissions</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            {formData.permissions.map((perm, idx) => (
                                <div key={perm.feature} style={{ border: '1px solid #e5e7eb', padding: '12px', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                                    <h4 style={{ margin: '0 0 12px 0', textTransform: 'capitalize', fontWeight: '600', color: '#1f2937' }}>
                                        {perm.feature}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {['canCreate', 'canRead', 'canUpdate', 'canDelete'].map(action => (
                                            <label key={action} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={perm[action]}
                                                    onChange={() => handlePermissionChange(idx, action)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                {action === 'canCreate' && 'Create'}
                                                {action === 'canRead' && 'Read'}
                                                {action === 'canUpdate' && 'Update'}
                                                {action === 'canDelete' && 'Delete'}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px' }}>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                style={{ cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>Active</span>
                        </label>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="mc-btn-primary">
                                💾 {editingId ? 'Update Role' : 'Create Role'}
                            </button>
                            <button type="button" onClick={resetForm} className="mc-btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {roles.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>No roles yet</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                    {roles.map(role => (
                        <div key={role._id} className="mc-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#1f2937', fontWeight: '600', fontSize: '16px' }}>
                                        {role.name}
                                    </h3>
                                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '13px' }}>
                                        {role.description || 'No description'}
                                    </p>
                                </div>
                                <span style={{
                                    backgroundColor: role.isActive ? '#dcfce7' : '#fee2e2',
                                    color: role.isActive ? '#166534' : '#dc2626',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                }}>
                                    {role.isActive ? '✓ Active' : '✗ Inactive'}
                                </span>
                            </div>

                            <div style={{ marginBottom: '12px', fontSize: '13px' }}>
                                <p style={{ margin: 0, fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Permissions:</p>
                                {role.permissions.map(perm => (
                                    <div key={perm.feature} style={{ marginBottom: '6px', color: '#6b7280' }}>
                                        <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{perm.feature}:</span>
                                        <span style={{ marginLeft: '8px' }}>
                                            {[
                                                perm.canCreate && '✎ Create',
                                                perm.canRead && '👁 Read',
                                                perm.canUpdate && '✎ Update',
                                                perm.canDelete && '✕ Delete'
                                            ].filter(Boolean).join(', ') || 'None'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => handleEdit(role)}
                                    disabled={role.name.toLowerCase() === 'admin'}
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        backgroundColor: role.name.toLowerCase() === 'admin' ? '#9ca3af' : '#3b82f6',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: role.name.toLowerCase() === 'admin' ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        opacity: role.name.toLowerCase() === 'admin' ? 0.6 : 1
                                    }}
                                    title={role.name.toLowerCase() === 'admin' ? 'Cannot edit system admin role' : 'Edit this role'}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(role._id, role.name)}
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        backgroundColor: role.name.toLowerCase() === 'admin' ? '#9ca3af' : '#ef4444',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: role.name.toLowerCase() === 'admin' ? 'not-allowed' : 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        opacity: role.name.toLowerCase() === 'admin' ? 0.6 : 1
                                    }}
                                    disabled={role.name.toLowerCase() === 'admin'}
                                    title={role.name.toLowerCase() === 'admin' ? 'Cannot delete system admin role' : 'Delete this role'}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
