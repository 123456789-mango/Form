import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Grid, Card, CardContent, Divider, Stack } from '@mui/material';
import { IconArrowLeft, IconRocket, IconDeviceFloppy } from '@tabler/icons-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createPost, uploadImage } from '../../api/blog';
import GalleryUpload from './GalleryUpload';
import VideoUpload from './VideoUpload';

export default function CreatePost() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', tags: '', author: 'Admin', category: 'General' });
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!form.title || !content) return alert('Title and content required!');
        setLoading(true);
        try {
            let coverImage = '';
            if (image) {
                const uploaded = await uploadImage(image);
                coverImage = uploaded.url;
            }
            await createPost({
                ...form,
                content,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                coverImage,
                gallery,
                videos,
            });
            navigate('/');
        } catch {
            alert('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header / Navigation Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Button
                    variant="text"
                    startIcon={<IconArrowLeft />}
                    onClick={() => navigate(-1)}
                    sx={{ color: '#355872', textTransform: 'none', fontWeight: 600 }}
                >
                    Back to Posts
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#355872' }}>
                    Create New Post
                </Typography>
            </Box>

            <Stack spacing={3}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#355872' }}>General Details</Typography>
                        <Stack spacing={2.5}>
                            <TextField
                                label="Post Title"
                                fullWidth
                                required
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Author Name"
                                        fullWidth
                                        value={form.author}
                                        onChange={e => setForm({ ...form, author: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Category"
                                        fullWidth
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                            <TextField
                                label="Tags (comma separated)"
                                fullWidth
                                placeholder="react, hooks, metadata"
                                value={form.tags}
                                onChange={e => setForm({ ...form, tags: e.target.value })}
                            />
                        </Stack>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#355872' }}>Cover Imagery</Typography>
                        <Button variant="outlined" component="label" sx={{ textTransform: 'none', color: '#355872', borderColor: '#7AAACE' }}>
                            Upload Cover Photo
                            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </Button>
                        {preview && (
                            <Box sx={{ mt: 2, width: '100%', maxWidth: 320, height: 180, overflow: 'hidden', borderRadius: 2 }}>
                                <Box component="img" src={preview} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>
                        )}
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#355872' }}>Article Content Area</Typography>
                        <Box sx={{ '.ql-container': { minHeight: '250px', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }, '.ql-toolbar': { borderTopLeftRadius: 8, borderTopRightRadius: 8 } }}>
                            <ReactQuill value={content} onChange={setContent} theme="snow" />
                        </Box>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#355872' }}>Attached Gallery Mix</Typography>
                        <GalleryUpload gallery={gallery} setGallery={setGallery} />
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#355872' }}>Linked Videos</Typography>
                        <VideoUpload videos={videos} setVideos={setVideos} />
                    </CardContent>
                </Card>

                {/* Footer Navigation Execution Bar */}
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 1 }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => navigate('/')}
                        disabled={loading}
                        sx={{ textTransform: 'none', fontWeight: 600, px: 4, borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<IconRocket size={18} />}
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{ bgcolor: '#355872', '&:hover': { bgcolor: '#233872' }, textTransform: 'none', fontWeight: 600, px: 4, borderRadius: 2 }}
                    >
                        {loading ? 'Publishing...' : 'Publish Post'}
                    </Button>
                </Box>
            </Stack>
        </Container>
    );
}