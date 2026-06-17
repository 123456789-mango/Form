import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
} from '@mui/material';
import { IconUser, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react';

const backgroundImages = Object.values(
    import.meta.glob('../../assets/images/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
);

const BASE_URL = import.meta.env.VITE_API_URL || '';
const SLIDE_INTERVAL_MS = 6000;

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageSeverity, setMessageSeverity] = useState('warning');
    const [bgIndex, setBgIndex] = useState(0);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const reason = searchParams.get('reason');
        if (reason === 'inactive') {
            setMessageSeverity('warning');
            setMessage('Session expired due to inactivity. Please log in again.');
        } else if (reason === 'sessionExpired') {
            setMessageSeverity('warning');
            setMessage('Your session has expired. Please log in again.');
        }
    }, [searchParams]);

    // Background slideshow loop
    useEffect(() => {
        if (backgroundImages.length <= 1) return;
        const id = setInterval(() => {
            setBgIndex((i) => (i + 1) % backgroundImages.length);
        }, SLIDE_INTERVAL_MS);
        return () => clearInterval(id);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setMessageSeverity('error');
            setMessage('Enter username and password');
            return;
        }
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
        } catch (err) {
            setMessageSeverity('error');
            setMessage(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                bgcolor: '#355872', // Fallback color using your Deep Blue
                p: 2,
            }}
        >
            {backgroundImages.map((src, i) => (
                <Box
                    key={src}
                    component="img"
                    src={src}
                    alt=""
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: i === bgIndex ? 1 : 0,
                        transition: 'opacity 1.5s ease-in-out',
                    }}
                />
            ))}

            {/* Overlay using your Deep Blue rgb(53, 88, 114) with alpha opacity */}
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(53, 88, 114, 0.65)' }} />

            <Card
                elevation={12}
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    maxWidth: 420,
                    borderRadius: 4,
                    // Blended glassmorphism using your Off-White color #F7F8F0
                    background: 'rgba(247, 248, 240, 0.92)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px rgba(35, 56, 114, 0.25)'
                }}
            >
                <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#355872', mb: 1 }}>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(53, 88, 114, 0.75)', fontWeight: 500 }}>
                            Please enter your details to sign in
                        </Typography>
                    </Box>

                    {message && (
                        <Alert severity={messageSeverity} sx={{ mb: 3, borderRadius: 2 }}>
                            {message}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            label="Username"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            fullWidth
                            autoFocus
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconUser size={20} stroke={1.75} color="#7AAACE" />
                                        </InputAdornment>
                                    ),
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#7AAACE' },
                                    '&:hover fieldset': { borderColor: '#355872' },
                                    '&.Mui-focused fieldset': { borderColor: '#355872' },
                                },
                                '& .MuiInputLabel-root': { color: '#7AAACE' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#355872' },
                            }}
                        />

                        <TextField
                            label="Password"
                            variant="outlined"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconLock size={20} stroke={1.75} color="#7AAACE" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={() => setShowPassword((v) => !v)}
                                                onMouseDown={(e) => e.preventDefault()}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? (
                                                    <IconEyeOff size={20} stroke={1.75} color="#7AAACE" />
                                                ) : (
                                                    <IconEye size={20} stroke={1.75} color="#7AAACE" />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }

                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#7AAACE' },
                                    '&:hover fieldset': { borderColor: '#355872' },
                                    '&.Mui-focused fieldset': { borderColor: '#355872' },
                                },
                                '& .MuiInputLabel-root': { color: '#7AAACE' },
                                '& .MuiInputLabel-root.Mui-focused': { color: '#355872' },
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                            sx={{
                                mt: 2,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: '1.05rem',
                                // Custom coloring matching your pallet
                                bgcolor: '#355872',
                                color: '#F7F8F0',
                                '&:hover': {
                                    bgcolor: '#7AAACE',
                                    color: '#355872'
                                },
                                '&.Mui-disabled': {
                                    bgcolor: 'rgba(53, 88, 114, 0.4)',
                                    color: 'rgba(247, 248, 240, 0.6)'
                                }
                            }}
                            disableElevation
                        >
                            {loading ? 'Authenticating...' : 'Log In'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}