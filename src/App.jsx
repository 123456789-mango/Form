import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import PostList from './pages/PostList';
import ClientList from './pages/ClientList';
import UserProfile from './pages/UserProfile';
import UserManagement from './pages/UserManagement';
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
        const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

        // Close dropdown when location changes
        useEffect(() => {
            setProfileDropdownOpen(false);
        }, [location.pathname]);

        const isAuthPage = location.pathname === '/login';

        const handleLogout = () => {
            localStorage.removeItem('token');
            setProfileDropdownOpen(false);
            navigate('/login');
        };

        const handleProfileClick = () => {
            navigate('/profile');
            setProfileDropdownOpen(false);
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
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    transition: 'background-color 0.2s',
                                    backgroundColor: profileDropdownOpen ? '#f3f4f6' : 'transparent'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = profileDropdownOpen ? '#f3f4f6' : 'transparent'}
                            >
                                <div className="mc-avatar">AD</div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>Administrator</span>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>▼</span>
                            </button>

                            {profileDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    minWidth: '200px',
                                    zIndex: 1000,
                                    overflow: 'hidden'
                                }}>
                                    <button
                                        onClick={handleProfileClick}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            color: '#1f2937',
                                            fontWeight: '500',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        👤 My Profile
                                    </button>
                                    <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: 'none',
                                            backgroundColor: 'transparent',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            color: '#dc2626',
                                            fontWeight: '500',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>
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
                            {/* <Link to="/profile" className={`mc-sidebar-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                                <span className="mc-sidebar-icon">👤</span>
                                {sidebarExpanded && <span>My Profile</span>}
                            </Link> */}
                            <Link to="/users" className={`mc-sidebar-item ${location.pathname === '/users' ? 'active' : ''}`}>
                                <span className="mc-sidebar-icon">👨‍💼</span>
                                {sidebarExpanded && <span>Users</span>}
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
                            <Route path="/profile" element={<Private><UserProfile /></Private>} />
                            <Route path="/users" element={<Private><UserManagement /></Private>} />
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