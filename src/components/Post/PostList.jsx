import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, TablePagination,
    IconButton, Chip, Avatar, Tooltip, CircularProgress, Stack
} from '@mui/material';
import {
    IconPlus, IconPencil, IconTrash, IconCalendar, IconUser,
    IconFolder, IconPhoto, IconVideo, IconTags
} from '@tabler/icons-react';
import { deletePost, getAllPosts } from '../../api/blog';

export default function PostList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Pagination States
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        getAllPosts()
            .then(setPosts)
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you absolutely sure you want to delete this post?')) return;
        await deletePost(id);
        setPosts(posts.filter(p => p._id !== id));
        // Adjust page if deleting the last item on a page
        const totalRemaining = posts.length - 1;
        const maxPages = Math.ceil(totalRemaining / rowsPerPage);
        if (page >= maxPages && page > 0) {
            setPage(maxPages - 1);
        }
    };

    // Pagination Handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Calculate sliced array for current page display
    const visiblePosts = posts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Top Admin Dashboard Control Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#355872' }}>
                        Post Management Portal
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Review, modify, or clear administrative registry articles.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<IconPlus />}
                    onClick={() => navigate('/create')}
                    sx={{ bgcolor: '#355872', '&:hover': { bgcolor: '#233872' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                >
                    Create New Post
                </Button>
            </Box>

            {/* Main Admin Table Interface */}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <Table sx={{ minWidth: 800 }} aria-label="admin posts table">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell width="80px" align="center" sx={{ fontWeight: 700, color: '#475569' }}>Cover</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Post Info</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Author</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Date Posted</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Media Attachments</TableCell>
                            <TableCell align="center" width="120px" sx={{ fontWeight: 700, color: '#475569' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {visiblePosts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body1" color="textSecondary">
                                        No administrative posts registered in system database yet.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            visiblePosts.map((post) => (
                                <TableRow key={post._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>

                                    {/* Column 1: Image Thumbnail */}
                                    <TableCell align="center">
                                        <Avatar
                                            variant="rounded"
                                            src={post.coverImage || ''}
                                            alt={post.title}
                                            sx={{ width: 48, height: 48, bgcolor: '#e2e8f0', border: '1px solid #cbd5e1' }}
                                        >
                                            <IconPhoto size={20} color="#94a3b8" />
                                        </Avatar>
                                    </TableCell>

                                    {/* Column 2: Title & Categorization Summary */}
                                    <TableCell sx={{ maxWith: 300 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.3, mb: 0.5 }}>
                                            {post.title}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
                                            <Chip
                                                size="small"
                                                icon={<IconFolder size={12} style={{ color: '#355872' }} />}
                                                label={post.category || 'General'}
                                                sx={{ height: 20, fontSize: '0.75rem', fontWeight: 600, bgcolor: '#eff6ff', color: '#1e40af' }}
                                            />
                                            {post.tags?.slice(0, 3).map(tag => (
                                                <Typography key={tag} variant="caption" color="textSecondary" sx={{ bgcolor: '#f1f5f9', px: 0.8, py: 0.2, borderRadius: 1 }}>
                                                    #{tag}
                                                </Typography>
                                            ))}
                                            {post.tags?.length > 3 && (
                                                <Typography variant="caption" color="textSecondary">
                                                    +{post.tags.length - 3} more
                                                </Typography>
                                            )}
                                        </Stack>
                                    </TableCell>

                                    {/* Column 3: Author */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconUser size={16} style={{ color: '#64748b' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
                                                {post.author}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Column 4: Date Format */}
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconCalendar size={16} style={{ color: '#64748b' }} />
                                            <Typography variant="body2" color="textSecondary">
                                                {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </Typography>
                                        </Box>
                                    </TableCell>

                                    {/* Column 5: Counters for Files */}
                                    <TableCell>
                                        <Stack direction="row" spacing={2} sx={{ color: '#64748b' }}>
                                            <Tooltip title={`${post.gallery?.length || 0} Gallery Images`}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <IconPhoto size={18} style={{ color: (post.gallery?.length > 0) ? '#0284c7' : '#cbd5e1' }} />
                                                    <Typography variant="body2" sx={{ fontWeight: post.gallery?.length > 0 ? 600 : 400 }}>
                                                        {post.gallery?.length || 0}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                            <Tooltip title={`${post.videos?.length || 0} Embedded Videos`}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <IconVideo size={18} style={{ color: (post.videos?.length > 0) ? '#16a34a' : '#cbd5e1' }} />
                                                    <Typography variant="body2" sx={{ fontWeight: post.videos?.length > 0 ? 600 : 400 }}>
                                                        {post.videos?.length || 0}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>

                                    {/* Column 6: Action Triggers */}
                                    <TableCell align="center">
                                        <Stack direction="row" justifyContent="center" spacing={0.5}>
                                            <Tooltip title="Edit Post">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/edit/${post._id}`)}
                                                    sx={{ color: '#355872', '&:hover': { bgcolor: '#f0f4f8' } }}
                                                >
                                                    <IconPencil size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Post">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(post._id)}
                                                    sx={{ color: '#d32f2f', '&:hover': { bgcolor: '#fef2f2' } }}
                                                >
                                                    <IconTrash size={18} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>

                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Built-in Table Pagination Controls */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={posts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}
                />
            </TableContainer>
        </Container>
    );
}