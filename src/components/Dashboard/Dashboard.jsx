import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../styles/MetallicChic.css';
export default function Dashboard() {
    const [stats, setStats] = useState({
        posts: { total: 0, galleries: 0, videos: 0 },
        users: { total: 0 },
        clients: { total: 0, totalShares: 0 },
        recent: { posts: [], clients: [] }
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
        // Refresh stats every 30 seconds for real-time updates
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading dashboard...</p>;

    return (
        <div>
            <h2 className="mc-title" style={{ fontSize: '28px', marginBottom: '4px' }}>System Overview</h2>
            <p className="mc-meta" style={{ marginBottom: '24px' }}>Brushed Metal Control Center Platform</p>

            {/* Dashboard Statistics Grid */}
            <div className="mc-dash-grid">
                <div className="mc-dash-stat-card">
                    <span className="mc-sub-label" style={{ margin: 0 }}>Total Articles</span>
                    <div className="mc-dash-stat-val">{stats.posts.total}</div>
                    <span className="mc-meta" style={{ margin: 0 }}>Published items</span>
                </div>
                <div className="mc-dash-stat-card">
                    <span className="mc-sub-label" style={{ margin: 0 }}>Media Assets</span>
                    <div className="mc-dash-stat-val">{stats.posts.galleries}</div>
                    <span className="mc-meta" style={{ margin: 0 }}>Images in galleries</span>
                </div>
                <div className="mc-dash-stat-card">
                    <span className="mc-sub-label" style={{ margin: 0 }}>Video Streams</span>
                    <div className="mc-dash-stat-val">{stats.posts.videos}</div>
                    <span className="mc-meta" style={{ margin: 0 }}>Embedded links & files</span>
                </div>
                <div className="mc-dash-stat-card">
                    <span className="mc-sub-label" style={{ margin: 0 }}>System Users</span>
                    <div className="mc-dash-stat-val">{stats.users.total}</div>
                    <span className="mc-meta" style={{ margin: 0 }}>Admin accounts</span>
                </div>
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
            </div>
            {/* Recent Activity Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
                {/* Recent Posts */}
                <div className="mc-card">
                    <h3 className="mc-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Recent Posts</h3>
                    {stats.recent.posts.length === 0 ? (
                        <p style={{ color: '#999' }}>No posts yet</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {stats.recent.posts.map((post, idx) => (
                                <li key={idx} style={{
                                    padding: '10px 0',
                                    borderBottom: idx < stats.recent.posts.length - 1 ? '1px solid #e5e7eb' : 'none',
                                    fontSize: '13px'
                                }}>
                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{post.title}</div>
                                    <div style={{ color: '#9ca3af', marginTop: '4px' }}>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recent Clients */}
                <div className="mc-card">
                    <h3 className="mc-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Recent Clients</h3>
                    {stats.recent.clients.length === 0 ? (
                        <p style={{ color: '#999' }}>No clients yet</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {stats.recent.clients.map((client, idx) => (
                                <li key={idx} style={{
                                    padding: '10px 0',
                                    borderBottom: idx < stats.recent.clients.length - 1 ? '1px solid #e5e7eb' : 'none',
                                    fontSize: '13px'
                                }}>
                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{client.name}</div>
                                    <div style={{ color: '#9ca3af', marginTop: '4px' }}>
                                        @{client.username} • {new Date(client.createdAt).toLocaleDateString()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Quick Actions Engine */}
            <h3 className="mc-title" style={{ fontSize: '18px', marginTop: '40px' }}>Quick Actions</h3>
            <div className="mc-grid" style={{ marginTop: '12px' }}>
                <button onClick={() => navigate('/create')} className="mc-btn" style={{ padding: '16px 24px' }}>
                    🚀 Draft New Post
                </button>
                <button onClick={() => navigate('/posts')} className="mc-btn" style={{ padding: '16px 24px' }}>
                    📁 Manage Posts
                </button>
                <button onClick={() => navigate('/clients')} className="mc-btn" style={{ padding: '16px 24px' }}>
                    👥 Manage Clients
                </button>
                <button onClick={fetchStats} className="mc-btn" style={{ padding: '16px 24px' }}>
                    🔄 Refresh Stats
                </button>
            </div>
        </div>
    );
}