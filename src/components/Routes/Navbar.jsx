import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, AppBar, ToolbarContainer } from '@mui/material';
import { IconNotebook, IconPlus, IconLogout, IconLogin } from '@tabler/icons-react';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Box
            component="header"
            sx={{
                bgcolor: '#355872', // Deep Blue Frame
                borderBottom: '1px solid rgba(122, 170, 206, 0.3)',
                boxShadow: '0 2px 12px rgba(35, 56, 114, 0.15)',
                width: '100%',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    maxHeight: '64px',
                    height: '64px',
                    px: { xs: 2, sm: 4 }
                }}
            >
                {/* Brand Logo Section */}
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Box sx={{ bgcolor: '#9CD5FF', p: 0.5, borderRadius: 1.5, display: 'flex', alignItems: 'center' }}>
                        <IconNotebook size={18} color="#355872" stroke={2.5} />
                    </Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 800,
                            color: '#F7F8F0', // Off-White Text
                            fontSize: '1.15rem',
                            letterSpacing: '0.5px'
                        }}
                    >
                        Blog Admin
                    </Typography>
                </Link>

                {/* Navigation Links & Action Path controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.5 } }}>
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#7AAACE',
                                fontWeight: 700,
                                '&:hover': { color: '#F7F8F0' },
                                transition: 'color 0.2s'
                            }}
                        >
                            All Posts
                        </Typography>
                    </Link>

                    <Button
                        component={Link}
                        to="/create"
                        variant="contained"
                        size="small"
                        startIcon={<IconPlus size={16} stroke={2.5} />}
                        sx={{
                            bgcolor: '#7AAACE',
                            color: '#355872',
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 2,
                            '&:hover': {
                                bgcolor: '#9CD5FF',
                            }
                        }}
                        disableElevation
                    >
                        New Post
                    </Button>

                    {/* Authentication Section Toggle */}
                    <Box sx={{ ml: { xs: 0.5, sm: 1 }, pl: { xs: 1, sm: 2 }, borderLeft: '1px solid rgba(247, 248, 240, 0.2)' }}>
                        {token ? (
                            <Button
                                onClick={handleLogout}
                                variant="outlined"
                                size="small"
                                startIcon={<IconLogout size={15} />}
                                sx={{
                                    borderColor: 'rgba(247, 248, 240, 0.4)',
                                    color: '#F7F8F0',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    '&:hover': {
                                        borderColor: '#F7F8F0',
                                        bgcolor: 'rgba(247, 248, 240, 0.08)'
                                    }
                                }}
                            >
                                Logout
                            </Button>
                        ) : (
                            <Button
                                component={Link}
                                to="/login"
                                variant="text"
                                size="small"
                                startIcon={<IconLogin size={15} />}
                                sx={{
                                    color: '#7AAACE',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    '&:hover': { color: '#F7F8F0' }
                                }}
                            >
                                Login
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}