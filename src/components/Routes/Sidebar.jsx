import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import {
    IconLayoutDashboard,
    IconNews,
    IconUsers,
    IconKey,
    IconRobot
} from '@tabler/icons-react';

export default function Sidebar({ sidebarExpanded, isAdmin, currentPath }) {

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: IconLayoutDashboard, visible: true },
        { path: '/posts', label: 'All Posts', icon: IconNews, visible: isAdmin },
        { path: '/clients', label: 'Clients', icon: IconUsers, visible: true },
        { path: '/users', label: 'Users', icon: IconUsers, visible: isAdmin },
        { path: '/roles', label: 'Roles', icon: IconKey, visible: isAdmin },
        { path: '/automation', label: 'Automation', icon: IconRobot, visible: isAdmin },
    ];

    return (
        <Box
            component="aside"
            sx={{
                width: sidebarExpanded ? '240px' : '72px',
                transition: 'width 0.2s ease-in-out',
                bgcolor: '#F7F8F0', // Off-White Sidebar
                borderRight: '1px solid rgba(122, 170, 206, 0.3)',
                minHeight: 'calc(100vh - 64px)',
                display: 'flex',
                flexDirection: 'column',
                pt: 2,
                boxSizing: 'border-box',
                overflowX: 'hidden'
            }}
        >
            <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1 }}>
                {menuItems.map((item) => {
                    if (!item.visible) return null;
                    const isActive = currentPath === item.path;
                    const Icon = item.icon;

                    return (
                        <Box
                            key={item.path}
                            component={Link}
                            to={item.path}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                px: sidebarExpanded ? 2 : 0,
                                justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                                py: 1.5,
                                borderRadius: 2,
                                color: isActive ? '#355872' : 'rgba(53, 88, 114, 0.8)',
                                bgcolor: isActive ? 'rgba(122, 170, 206, 0.25)' : 'transparent',
                                borderLeft: isActive ? '4px solid #355872' : '4px solid transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    bgcolor: isActive ? 'rgba(122, 170, 206, 0.25)' : 'rgba(156, 213, 255, 0.2)',
                                    color: '#355872',
                                    '& .sidebar-icon': { color: '#355872' }
                                }
                            }}
                        >
                            <Box
                                className="sidebar-icon"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isActive ? '#355872' : '#7AAACE',
                                    transition: 'color 0.2s',
                                    ml: sidebarExpanded ? 0 : 0.5
                                }}
                            >
                                <Icon size={20} stroke={isActive ? 2 : 1.75} />
                            </Box>

                            {sidebarExpanded && (
                                <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 600, fontSize: '0.9rem' }}>
                                    {item.label}
                                </Typography>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}