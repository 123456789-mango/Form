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
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary">Loading dashboard...</Typography>
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
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>System Overview</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Brushed Metal Control Center Platform
            </Typography>

            {/* Dashboard Statistics Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                {statCards.map(({ label, value, caption, icon: Icon }) => (
                    <Card key={label} variant="outlined">
                        <CardContent>
                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                                <Box>
                                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2, mt: 0.5 }}>{value}</Typography>
                                    <Typography variant="caption" color="text.disabled">{caption}</Typography>
                                </Box>
                                <Icon size={22} stroke={1.5} style={{ opacity: 0.55, flexShrink: 0 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* Recent Activity Section */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 4 }}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Recent Posts</Typography>
                        {stats.recent.posts.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No posts yet</Typography>
                        ) : (
                            <List disablePadding>
                                {stats.recent.posts.map((post, idx) => (
                                    <Box key={idx}>
                                        <ListItem disableGutters sx={{ py: 1.25 }}>
                                            <ListItemText
                                                primary={post.title}
                                                secondary={new Date(post.createdAt).toLocaleDateString()}
                                                primaryTypographyProps={{ fontWeight: 600, fontSize: 13 }}
                                                secondaryTypographyProps={{ fontSize: 12 }}
                                            />
                                        </ListItem>
                                        {idx < stats.recent.posts.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>

                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Recent Clients</Typography>
                        {stats.recent.clients.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No clients yet</Typography>
                        ) : (
                            <List disablePadding>
                                {stats.recent.clients.map((client, idx) => (
                                    <Box key={idx}>
                                        <ListItem disableGutters sx={{ py: 1.25 }}>
                                            <ListItemText
                                                primary={client.name}
                                                secondary={`@${client.username} • ${new Date(client.createdAt).toLocaleDateString()}`}
                                                primaryTypographyProps={{ fontWeight: 600, fontSize: 13 }}
                                                secondaryTypographyProps={{ fontSize: 12 }}
                                            />
                                        </ListItem>
                                        {idx < stats.recent.clients.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Quick Actions */}
            <Typography variant="h6" sx={{ fontWeight: 600, mt: 5, mb: 1.5 }}>Quick Actions</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                <Button variant="outlined" size="large" startIcon={<IconRocket size={18} />} onClick={() => navigate('/create')}>
                    Draft New Post
                </Button>
                <Button variant="outlined" size="large" startIcon={<IconFolder size={18} />} onClick={() => navigate('/posts')}>
                    Manage Posts
                </Button>
                <Button variant="outlined" size="large" startIcon={<IconUsers size={18} />} onClick={() => navigate('/clients')}>
                    Manage Clients
                </Button>
                <Button variant="outlined" size="large" startIcon={<IconRefresh size={18} />} onClick={fetchStats}>
                    Refresh Stats
                </Button>
            </Box>
        </Box>
    );
}