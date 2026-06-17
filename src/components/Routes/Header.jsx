import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, IconButton, Avatar, Button } from '@mui/material';
import { IconMenu2, IconChevronDown, IconUser, IconLogout, IconNotebook } from '@tabler/icons-react';

export default function Header({
    sidebarExpanded,
    setSidebarExpanded,
    userName,
    isAdmin,
    profileDropdownOpen,
    setProfileDropdownOpen,
    handleLogout,
    handleProfileClick
}) {
    return (
        <Box
            component="header"
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: '#355872', // Deep Blue Header Background
                color: '#F7F8F0',
                px: 3,
                height: '64px',
                borderBottom: '1px solid rgba(122, 170, 206, 0.3)',
                boxShadow: '0 2px 10px rgba(35, 56, 114, 0.15)',
                position: 'relative',
                zIndex: 1100,
                boxSizing: 'border-box'
            }}
        >
            {/* Header Left Area */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    title="Toggle System Menu"
                    sx={{
                        color: '#F7F8F0',
                        bgcolor: 'rgba(247, 248, 240, 0.1)',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'rgba(247, 248, 240, 0.2)' }
                    }}
                >
                    <IconMenu2 size={20} stroke={1.75} />
                </IconButton>

                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box sx={{ bgcolor: '#9CD5FF', p: 0.5, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconNotebook size={20} color="#355872" stroke={2} />
                    </Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: '#F7F8F0',
                            letterSpacing: '0.5px',
                            fontSize: '1.2rem',
                            margin: 0
                        }}
                    >
                        Core Engine
                    </Typography>
                </Link>
            </Box>

            {/* Header Right Area */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ position: 'relative' }}>
                    <Button
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        endIcon={<IconChevronDown size={14} stroke={2.5} style={{ opacity: 0.8 }} />}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#F7F8F0',
                            textTransform: 'none',
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 2.5,
                            transition: 'background-color 0.2s',
                            bgcolor: profileDropdownOpen ? 'rgba(247, 248, 240, 0.15)' : 'transparent',
                            '&:hover': {
                                bgcolor: 'rgba(247, 248, 240, 0.2)'
                            }
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 28,
                                height: 28,
                                fontSize: '11px',
                                fontWeight: 700,
                                bgcolor: '#7AAACE',
                                color: '#355872'
                            }}
                        >
                            {isAdmin ? 'AD' : 'US'}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '13.5px' }}>
                            {userName}
                        </Typography>
                    </Button>

                    {/* Profile Custom Dropdown Context Box */}
                    {profileDropdownOpen && (
                        <Box sx={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            bgcolor: '#F7F8F0', // Off-White container background
                            borderRadius: 3,
                            boxShadow: '0 4px 24px rgba(35, 56, 114, 0.2)',
                            minWidth: '210px',
                            zIndex: 1200,
                            overflow: 'hidden',
                            border: '1px solid rgba(122, 170, 206, 0.3)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <Button
                                onClick={handleProfileClick}
                                startIcon={<IconUser size={16} stroke={2} />}
                                sx={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    borderRadius: 0,
                                    fontSize: '14px',
                                    color: '#355872',
                                    fontWeight: 600,
                                    transition: 'background-color 0.2s',
                                    '&:hover': { bgcolor: 'rgba(156, 213, 255, 0.25)' }
                                }}
                            >
                                My Profile
                            </Button>

                            <Box sx={{ height: '1px', bgcolor: 'rgba(122, 170, 206, 0.25)' }} />

                            <Button
                                onClick={handleLogout}
                                startIcon={<IconLogout size={16} stroke={2} />}
                                sx={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    borderRadius: 0,
                                    fontSize: '14px',
                                    color: '#dc2626',
                                    fontWeight: 600,
                                    transition: 'background-color 0.2s',
                                    '&:hover': { bgcolor: '#fee2e2' }
                                }}
                            >
                                Logout
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}