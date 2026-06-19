import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Typography, TextField, Button, Grid, Card, CardContent, Divider, Stack, CircularProgress } from '@mui/material';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getPost, updatePost, uploadImage } from '../../api/blog';
import GalleryUpload from './GalleryUpload';
import VideoUpload from './VideoUpload';

export default function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', tags: '', author: '', category: 'General' });
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        getPost(id).then(post => {
            setForm({
                title: post.title,
                tags: post.tags?.join(', ') || '',
                author: post.author,
                category: post.category || 'General',
            });
            setContent(post.content);
            setPreview(post.coverImage);
            setGallery(post.gallery || []);
            setVideos(post.videos || []);
            setFetching(false);
        });
    }, [id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let coverImage = preview;
            if (image) {
                const uploaded = await uploadImage(image);
                coverImage = uploaded.url;
            }
            await updatePost(id, {
                ...form,
                content,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                coverImage,
                gallery,
                videos,
            });
            navigate('/');
        } catch (err) {
            alert('Failed to update post');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header Layout Control Block */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Button
                    variant="text"
                    startIcon={<IconArrowLeft />}
                    onClick={() => navigate(-1)}
                    sx={{ color: '#355872', textTransform: 'none', fontWeight: 600 }}
                >
                    Cancel & Back
                </Button>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#355872' }}>
                    Edit Post
                </Typography>
            </Box>

            <Stack spacing={3}>
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#355872' }}>Post Details</Typography>
                        <Stack spacing={2.5}>
                            <TextField
                                label="Title"
                                fullWidth
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Author"
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
                                value={form.tags}
                                onChange={e => setForm({ ...form, tags: e.target.value })}
                            />
                        </Stack>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#355872' }}>Cover Image</Typography>
                        <Button variant="outlined" component="label" sx={{ textTransform: 'none', color: '#355872', borderColor: '#7AAACE', mb: 2 }}>
                            Change Photo
                            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </Button>
                        {preview && (
                            <Box sx={{ width: '100%', maxWidth: 320, height: 180, overflow: 'hidden', borderRadius: 2 }}>
                                <Box component="img" src={preview} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>
                        )}
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#355872' }}>Content Area</Typography>
                        <Box sx={{ '.ql-container': { minHeight: '250px', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }, '.ql-toolbar': { borderTopLeftRadius: 8, borderTopRightRadius: 8 } }}>
                            <ReactQuill value={content} onChange={setContent} theme="snow" />
                        </Box>
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#355872' }}>Gallery Images</Typography>
                        <GalleryUpload gallery={gallery} setGallery={setGallery} />
                    </CardContent>
                </Card>

                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#355872' }}>Videos</Typography>
                        <VideoUpload videos={videos} setVideos={setVideos} />
                    </CardContent>
                </Card>

                <Divider />

                {/* Form Navigation Actions Group */}
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
                        startIcon={<IconDeviceFloppy size={18} />}
                        onClick={handleSubmit}
                        disabled={loading}
                        sx={{ bgcolor: '#355872', '&:hover': { bgcolor: '#233872' }, textTransform: 'none', fontWeight: 600, px: 4, borderRadius: 2 }}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Stack>
        </Container>
    );
}