import { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import PostList from './pages/PostList';
import ClientList from './pages/ClientList';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './styles/MetallicChic.css';

function Private({ children }) {
    const token = localStorage.getItem('token');
    const location = useLocation();
    if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
    return children;
}

export default function App() {

    function InnerApplicationShell() {
        const location = useLocation();
        const navigate = useNavigate();
        const [sidebarExpanded, setSidebarExpanded] = useState(true);

        const isAuthPage = location.pathname === '/login';

        const handleLogout = () => {
            localStorage.removeItem('token');
            navigate('/login');
        };

        // Render pure page component without system chrome if viewing authentication page
        if (isAuthPage) {
            return (
                <Routes>
                    <Route path="/login" element={<Login />} />
                </Routes>
            );
        }

        return (
            <div className="mc-admin-shell">
                {/* Unified Master Header Block */}
                <header className="mc-header">
                    <div className="mc-header-left">
                        <button
                            className="mc-sidebar-toggle"
                            onClick={() => setSidebarExpanded(!sidebarExpanded)}
                            title="Toggle System Menu"
                        >
                            ☰
                        </button>
                        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '22px' }}>📝</span>
                            <h2 className="mc-navbar-logo-text" style={{ margin: 0 }}>Core Engine</h2>
                        </Link>
                    </div>

                    <div className="mc-header-right">
                        <div className="mc-profile-zone">
                            <div className="mc-avatar">AD</div>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>Administrator</span>
                        </div>
                        <button onClick={handleLogout} className="mc-btn-danger" style={{ padding: '8px 14px', fontSize: '12px' }}>
                            Logout
                        </button>
                    </div>
                </header>

                <div className="mc-layout-body">
                    {/* Collapsible Left Navigation System */}
                    <aside className={`mc-sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
                        <nav className="mc-sidebar-menu">
                            <Link to="/" className={`mc-sidebar-item ${location.pathname === '/' ? 'active' : ''}`}>
                                <span className="mc-sidebar-icon">📊</span>
                                {sidebarExpanded && <span>Dashboard</span>}
                            </Link>
                            <Link to="/posts" className={`mc-sidebar-item ${location.pathname === '/posts' ? 'active' : ''}`}>
                                <span className="mc-sidebar-icon">📰</span>
                                {sidebarExpanded && <span>All Posts</span>}
                            </Link>
                            <Link to="/create" className={`mc-sidebar-item ${location.pathname === '/create' ? 'active' : ''}`}>
                                <span className="mc-sidebar-icon">✨</span>
                                {sidebarExpanded && <span>Create Post</span>}
                            </Link>
                            <Link to="/clients" className={`mc-sidebar-item ${location.pathname === '/clients' ? 'active' : ''}`}>
                                <span className="mc-sidebar-icon">👥</span>
                                {sidebarExpanded && <span>Clients</span>}
                            </Link>
                        </nav>
                    </aside>

                    {/* Primary Application Target Port */}
                    <main className="mc-main-content">
                        <Routes>
                            <Route path="/" element={<Private><Dashboard /></Private>} />
                            <Route path="/posts" element={<Private><PostList /></Private>} />
                            <Route path="/create" element={<Private><CreatePost /></Private>} />
                            <Route path="/edit/:id" element={<Private><EditPost /></Private>} />
                            <Route path="/clients" element={<Private><ClientList /></Private>} />
                        </Routes>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <InnerApplicationShell />
        </BrowserRouter>
    );
}