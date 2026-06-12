import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/MetallicChic.css';

export default function UserDashboard() {
    const [stats, setStats] = useState({
        clients: { total: 0, totalShares: 0 },
        recent: { clients: [] }
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Get current user from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchStats();
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats({
                clients: res.data.clients,
                recent: { clients: res.data.recent?.clients || [] }
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading dashboard...</p>;

    return (
        <div>
            <h2 className="mc-title" style={{ fontSize: '28px', marginBottom: '4px' }}>
                Welcome, {user?.displayName || user?.username}
            </h2>
            <p className="mc-meta" style={{ marginBottom: '24px' }}>Meroshare Client Management Dashboard</p>

            {/* Client Statistics */}
            <div className="mc-dash-grid">
                <div className="mc-dash-stat-card">
                    <span className="mc-sub-label" style={{ margin: 0 }}>Meroshare Clients</span>
                    <div className="mc-dash-stat-val">{stats.clients.total}</div>
                    <span className="mc-meta" style={{ margin: 0 }}>Active accounts</span>
                </div>
                <div className="mc-dash-stat-card">
                    <span className="mc-sub-label" style={{ margin: 0 }}>Total Shares</span>
                    <div className="mc-dash-stat-val">{stats.clients.totalShares.toLocaleString()}</div>
                    <span className="mc-meta" style={{ margin: 0 }}>Client portfolio</span>
                </div>
                <div className="mc-dash-stat-card">
                    <span className="mc-sub-label" style={{ margin: 0 }}>Quick Action</span>
                    <Link to="/clients" style={{ textDecoration: 'none' }}>
                        <button className="mc-btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                            👥 View Clients
                        </button>
                    </Link>
                </div>
            </div>

            {/* Recent Clients */}
            {stats.recent.clients && stats.recent.clients.length > 0 && (
                <div style={{ marginTop: '32px' }}>
                    <h3 className="mc-title" style={{ fontSize: '18px', marginBottom: '16px' }}>
                        📋 Recently Added Clients
                    </h3>
                    <div className="mc-card">
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse'
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>DP ID</th>
                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Shares</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent.clients.map((client, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '12px', color: '#1f2937' }}>{client.name}</td>
                                        <td style={{ padding: '12px', color: '#6b7280' }}>{client.dpId}</td>
                                        <td style={{ padding: '12px', color: '#3b82f6', fontWeight: '600' }}>
                                            {client.noOfShare?.toLocaleString() || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {(!stats.recent.clients || stats.recent.clients.length === 0) && (
                <div style={{ marginTop: '32px', textAlign: 'center', padding: '48px 24px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                    <h3 style={{ margin: 0, marginBottom: '8px', color: '#1f2937', fontWeight: '600' }}>No Clients Yet</h3>
                    <p style={{ margin: 0, color: '#6b7280' }}>New clients will appear here once added to the system.</p>
                    <Link to="/clients" style={{ textDecoration: 'none' }}>
                        <button className="mc-btn-primary" style={{ marginTop: '16px' }}>
                            View All Clients →
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
