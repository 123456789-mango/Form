import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSessionManagement } from '../../hooks/useSessionManagement';
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

    const { stopSession } = useSessionManagement(() => {
        navigate('/login?reason=sessionExpired');
    });

    useEffect(() => {
        setProfileDropdownOpen(false);
    }, [location.pathname]);

    const isAdmin = userRole === 'admin';

    const handleLogout = () => {
        stopSession();
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
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                bgcolor: '#ffffff',
                overflowX: 'hidden'
            }}
        >
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

            <Box sx={{ display: 'flex', flex: 1, position: 'relative' }}>
                <Sidebar
                    sidebarExpanded={sidebarExpanded}
                    isAdmin={isAdmin}
                    currentPath={location.pathname}
                />

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2.5, sm: 4 },
                        bgcolor: 'rgba(247, 248, 240, 0.4)',
                        minHeight: 'calc(100vh - 64px)',
                        boxSizing: 'border-box',
                        overflowY: 'auto'
                    }}
                >
                    <AppRoutes isAdmin={isAdmin} />
                </Box>
            </Box>
        </Box>
    );
}