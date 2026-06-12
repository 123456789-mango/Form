import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';

import { useSessionManagement } from './hooks/useSessionManagement';
import './styles/MetallicChic.css';
import Unauthorized from './components/unauthorized/Unauthorized';
import Dashboard from './components/Dashboard/Dashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import PostList from './components/Post/PostList';
import CreatePost from './components/Post/CreatePost';
import EditPost from './components/Post/EditPost';
import UserManagement from './components/User/UserManagement';
import RoleManagement from './components/Role/RoleManagement';
import ClientList from './components/MeroshareClient/ClientList';
import UserProfile from './components/User/UserProfile';
import Login from './components/User/Login';

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
        const [userRole, setUserRole] = useState('user');
        const [userName, setUserName] = useState('User');

        // Get user role from localStorage
        useEffect(() => {
            const userData = localStorage.getItem('user');
            if (userData) {
                try {
                    const user = JSON.parse(userData);
                    setUserRole(user.role || 'user');
                    setUserName(user.displayName || user.username || 'User');
                } catch (err) {
                    console.error('Error parsing user data:', err);
                }
            }
        }, []);

        // Session management with inactivity logout and token refresh
        useSessionManagement(() => {
            navigate('/login?reason=sessionExpired');
        });

        // Close dropdown when location changes
        useEffect(() => {
            setProfileDropdownOpen(false);
        }, [location.pathname]);

        const isAuthPage = location.pathname === '/login';
        const isAdmin = userRole === 'admin';

        const handleLogout = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
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
                                <div className="mc-avatar">{isAdmin ? 'AD' : 'US'}</div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>{userName}</span>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>▼</span>
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

                            {/* Admin-only menu items */}
                            {isAdmin && (
                                <>
                                    <Link to="/posts" className={`mc-sidebar-item ${location.pathname === '/posts' ? 'active' : ''}`}>
                                        <span className="mc-sidebar-icon">📰</span>
                                        {sidebarExpanded && <span>All Posts</span>}
                                    </Link>
                                    {/* <Link to="/create" className={`mc-sidebar-item ${location.pathname === '/create' ? 'active' : ''}`}>
                                        <span className="mc-sidebar-icon">✨</span>
                                        {sidebarExpanded && <span>Create Post</span>}
                                    </Link> */}
                                </>
                            )}

                            {/* Available to all users */}
                            <Link to="/clients" className={`mc-sidebar-item ${location.pathname === '/clients' ? 'active' : ''}`}>
                                <span className="mc-sidebar-icon">👥</span>
                                {sidebarExpanded && <span>Clients</span>}
                            </Link>

                            {/* Admin-only menu items */}
                            {isAdmin && (
                                <>
                                    <Link to="/users" className={`mc-sidebar-item ${location.pathname === '/users' ? 'active' : ''}`}>
                                        <span className="mc-sidebar-icon">👨‍💼</span>
                                        {sidebarExpanded && <span>Users</span>}
                                    </Link>
                                    <Link to="/roles" className={`mc-sidebar-item ${location.pathname === '/roles' ? 'active' : ''}`}>
                                        <span className="mc-sidebar-icon">🔐</span>
                                        {sidebarExpanded && <span>Roles</span>}
                                    </Link>
                                </>
                            )}
                        </nav>
                    </aside>

                    {/* Primary Application Target Port */}
                    <main className="mc-main-content">
                        <Routes>
                            {/* Dashboard - different for admin and users */}
                            <Route path="/" element={<Private>{isAdmin ? <Dashboard /> : <UserDashboard />}</Private>} />

                            {/* Admin-only routes */}
                            {isAdmin && (
                                <>
                                    <Route path="/posts" element={<Private><PostList /></Private>} />
                                    <Route path="/create" element={<Private><CreatePost /></Private>} />
                                    <Route path="/edit/:id" element={<Private><EditPost /></Private>} />
                                    <Route path="/users" element={<Private><UserManagement /></Private>} />
                                    <Route path="/roles" element={<Private><RoleManagement /></Private>} />
                                </>
                            )}

                            {/* Available to all users */}
                            <Route path="/clients" element={<Private><ClientList /></Private>} />
                            <Route path="/profile" element={<Private><UserProfile /></Private>} />

                            {/* Fallback for unauthorized access attempts */}
                            {/* Fallback for unauthorized access attempts */}
                            {!isAdmin && (
                                <>
                                    <Route path="/posts" element={<Private><Unauthorized /></Private>} />
                                    <Route path="/create" element={<Private><Unauthorized /></Private>} />
                                    <Route path="/edit/:id" element={<Private><Unauthorized /></Private>} />
                                    <Route path="/users" element={<Private><Unauthorized /></Private>} />
                                    <Route path="/roles" element={<Private><Unauthorized /></Private>} />
                                </>
                            )}
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