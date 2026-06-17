import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Divider,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import {
    IconArticle,
    IconPhoto,
    IconVideo,
    IconUsers,
    IconBriefcase,
    IconChartBar,
    IconRocket,
    IconFolder,
    IconRefresh,
} from '@tabler/icons-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        posts: { total: 0, galleries: 0, videos: 0 },
        users: { total: 0 },
        clients: { total: 0, totalShares: 0 },
        recent: { posts: [], clients: [] }
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
        // Refresh stats every 30 seconds for real-time updates
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 2 }}>
                <CircularProgress size={32} sx={{ color: '#355872' }} />
                <Typography variant="body2" sx={{ color: 'rgba(53, 88, 114, 0.8)' }}>Loading dashboard...</Typography>
            </Box>
        );
    }

    const statCards = [
        { label: 'Total Articles', value: stats.posts.total, caption: 'Published items', icon: IconArticle },
        { label: 'Media Assets', value: stats.posts.galleries, caption: 'Images in galleries', icon: IconPhoto },
        { label: 'Video Streams', value: stats.posts.videos, caption: 'Embedded links & files', icon: IconVideo },
        { label: 'System Users', value: stats.users.total, caption: 'Admin accounts', icon: IconUsers },
        { label: 'Meroshare Clients', value: stats.clients.total, caption: 'Active accounts', icon: IconBriefcase },
        { label: 'Total Shares', value: stats.clients.totalShares.toLocaleString(), caption: 'Client portfolio', icon: IconChartBar },
    ];

    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#355872', mb: 0.5 }}>System Overview</Typography>
            <Typography variant="body2" sx={{ mb: 4, color: 'rgba(53, 88, 114, 0.7)', fontWeight: 500 }}>
                Brushed Metal Control Center Platform
            </Typography>

            {/* Dashboard Statistics Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2.5 }}>
                {statCards.map(({ label, value, caption, icon: Icon }) => (
                    <Card
                        key={label}
                        variant="outlined"
                        sx={{
                            bgcolor: '#F7F8F0',
                            borderColor: 'rgba(122, 170, 206, 0.4)',
                            borderRadius: 3,
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s',
                            '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: '0 6px 20px rgba(53, 88, 114, 0.1)',
                                borderColor: '#355872'
                            }
                        }}
                    >
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'rgba(53, 88, 114, 0.75)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {label}
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, mt: 0.5, mb: 0.5, color: '#355872' }}>
                                        {value}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#7AAACE', fontWeight: 500 }}>
                                        {caption}
                                    </Typography>
                                </Box>
                                <Icon size={24} stroke={1.5} color="#7AAACE" style={{ mt: 0.5 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Recent Activity Section */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 4 }}>
                <Card variant="outlined" sx={{ bgcolor: '#F7F8F0', borderColor: 'rgba(122, 170, 206, 0.4)', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#355872', mb: 2 }}>Recent Posts</Typography>
                        {stats.recent.posts.length === 0 ? (
                            <Typography variant="body2" sx={{ color: 'rgba(53, 88, 114, 0.6)' }}>No posts yet</Typography>
                        ) : (
                            <List disablePadding>
                                {stats.recent.posts.map((post, idx) => (
                                    <Box key={idx}>
                                        <ListItem disableGutters sx={{ py: 1.5 }}>
                                            <ListItemText
                                                primary={post.title}
                                                secondary={new Date(post.createdAt).toLocaleDateString()}
                                                primaryTypographyProps={{ fontWeight: 600, fontSize: 13.5, color: '#355872' }}
                                                secondaryTypographyProps={{ fontSize: 12, color: 'rgba(53, 88, 114, 0.65)', sx: { mt: 0.25 } }}
                                            />
                                        </ListItem>
                                        {idx < stats.recent.posts.length - 1 && <Divider sx={{ borderColor: 'rgba(122, 170, 206, 0.25)' }} />}
                                    </Box>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ bgcolor: '#F7F8F0', borderColor: 'rgba(122, 170, 206, 0.4)', borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#355872', mb: 2 }}>Recent Clients</Typography>
                        {stats.recent.clients.length === 0 ? (
                            <Typography variant="body2" sx={{ color: 'rgba(53, 88, 114, 0.6)' }}>No clients yet</Typography>
                        ) : (
                            <List disablePadding>
                                {stats.recent.clients.map((client, idx) => (
                                    <Box key={idx}>
                                        <ListItem disableGutters sx={{ py: 1.5 }}>
                                            <ListItemText
                                                primary={client.name}
                                                secondary={`@${client.username} • ${new Date(client.createdAt).toLocaleDateString()}`}
                                                primaryTypographyProps={{ fontWeight: 600, fontSize: 13.5, color: '#355872' }}
                                                secondaryTypographyProps={{ fontSize: 12, color: 'rgba(53, 88, 114, 0.65)', sx: { mt: 0.25 } }}
                                            />
                                        </ListItem>
                                        {idx < stats.recent.clients.length - 1 && <Divider sx={{ borderColor: 'rgba(122, 170, 206, 0.25)' }} />}
                                    </Box>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Quick Actions */}
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#355872', mt: 5, mb: 2 }}>Quick Actions</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                {[
                    { label: 'Draft New Post', icon: <IconRocket size={18} />, action: () => navigate('/create') },
                    { label: 'Manage Posts', icon: <IconFolder size={18} />, action: () => navigate('/posts') },
                    { label: 'Manage Clients', icon: <IconUsers size={18} />, action: () => navigate('/clients') },
                    { label: 'Refresh Stats', icon: <IconRefresh size={18} />, action: fetchStats },
                ].map((btn, index) => (
                    <Button
                        key={index}
                        variant="outlined"
                        size="large"
                        startIcon={btn.icon}
                        onClick={btn.action}
                        sx={{
                            borderColor: '#7AAACE',
                            color: '#355872',
                            borderRadius: 2.5,
                            py: 1.2,
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            '&:hover': {
                                borderColor: '#355872',
                                bgcolor: 'rgba(156, 213, 255, 0.25)', // Smooth tint matching your palette highlight
                                transform: 'translateY(-1px)'
                            }
                        }}
                    >
                        {btn.label}
                    </Button>
                ))}
            </Box>
        </Box>
    );
}