import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAllPosts } from '../api/blog';
import '../styles/MetallicChic.css';

export default function Dashboard() {
    const [stats, setStats] = useState({ posts: 0, galleries: 0, videos: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        getAllPosts().then(posts => {
            let totalGalleries = 0;
            let totalVideos = 0;
            posts.forEach(p => {
                if (p.gallery) totalGalleries += p.gallery.length;
                if (p.videos) totalVideos += p.videos.length;
            });
            setStats({
                posts: posts.length,
                galleries: totalGalleries,
                videos: totalVideos
            });
        }).catch(() => { });
    }, []);

    return (
        <div>
            <h2 className="mc-title" style={{ fontSize: '28px', marginBottom: '4px' }}>System Overview</h2>
            <p className="mc-meta" style={{ marginBottom: '24px' }}>Brushed Metal Control Center Platform</p>

            {/* Dashboard Statistics Grid */}
            <div className="mc-dash-grid">
                <div className="mc-dash-stat-card">
                    <span className="mc-sub-label" style={{ margin: 0 }}>Total Articles</span>
                    <div className="mc-dash-stat-val">{stats.posts}</div>
                    <span className="mc-meta" style={{ margin: 0 }}>Published items</span>
                </div>
                <div className="mc-dash-stat-card">
                    <span className="mc-sub-label" style={{ margin: 0 }}>Media Assets</span>
                    <div className="mc-dash-stat-val">{stats.galleries}</div>
                    <span className="mc-meta" style={{ margin: 0 }}>Images in galleries</span>
                </div>
                <div className="mc-dash-stat-card">
                    <span className="mc-sub-label" style={{ margin: 0 }}>Video Streams</span>
                    <div className="mc-dash-stat-val">{stats.videos}</div>
                    <span className="mc-meta" style={{ margin: 0 }}>Embedded links & files</span>
                </div>
            </div>

            {/* Quick Actions Engine */}
            <h3 className="mc-title" style={{ fontSize: '18px', marginTop: '40px' }}>Quick Actions</h3>
            <div className="mc-grid" style={{ marginTop: '12px' }}>
                <button onClick={() => navigate('/create')} className="mc-btn" style={{ padding: '16px 24px' }}>
                    🚀 Draft New Post
                </button>
                <button onClick={() => navigate('/posts')} className="mc-btn" style={{ padding: '16px 24px' }}>
                    📁 Modify Database Records
                </button>
            </div>
        </div>
    );
}