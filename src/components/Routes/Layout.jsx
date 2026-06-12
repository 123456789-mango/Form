import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSessionManagement } from '../../hooks/useSessionManagement';
import '../../styles/MetallicChic.css';
import Header from './Header';
import Sidebar from './Sidebar';
import AppRoutes from './AppRoutes';

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [userRole, setUserRole] = useState('user');
    const [userName, setUserName] = useState('User');

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

    useSessionManagement(() => {
        navigate('/login?reason=sessionExpired');
    });

    useEffect(() => {
        setProfileDropdownOpen(false);
    }, [location.pathname]);

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

    return (
        <div className="mc-admin-shell">
            <Header
                sidebarExpanded={sidebarExpanded}
                setSidebarExpanded={setSidebarExpanded}
                userName={userName}
                isAdmin={isAdmin}
                profileDropdownOpen={profileDropdownOpen}
                setProfileDropdownOpen={setProfileDropdownOpen}
                handleLogout={handleLogout}
                handleProfileClick={handleProfileClick}
            />
            <div className="mc-layout-body">
                <Sidebar
                    sidebarExpanded={sidebarExpanded}
                    isAdmin={isAdmin}
                    currentPath={location.pathname}
                />
                <main className="mc-main-content">
                    <AppRoutes isAdmin={isAdmin} />
                </main>
            </div>
        </div>
    );
}