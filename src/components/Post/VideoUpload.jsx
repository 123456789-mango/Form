import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Card, CardContent, CircularProgress, IconButton } from '@mui/material';
import { IconVideo, IconLink, IconTrash, IconMovie } from '@tabler/icons-react';
import { uploadVideo } from '../../api/blog';

export default function VideoUpload({ videos, setVideos }) {
    const [videoUrl, setVideoUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    const addVideoUrl = () => {
        if (!videoUrl.trim()) return;
        setVideos(prev => [...prev, { type: 'url', url: videoUrl, title: '' }]);
        setVideoUrl('');
    };

    const handleVideoFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const { url } = await uploadVideo(file);
            setVideos(prev => [...prev, { type: 'upload', url, title: file.name }]);
        } catch {
            alert('Video upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeVideo = (index) => {
        setVideos(prev => prev.filter((_, i) => i !== index));
    };

    const getEmbedUrl = (url) => {
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        return url;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#355872' }}>
                    Upload Video File (mp4, mov)
                </Typography>
                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<IconMovie />}
                    disabled={uploading}
                    sx={{ textTransform: 'none', borderColor: '#7AAACE', color: '#355872' }}
                >
                    Choose Video File
                    <input type="file" accept="video/*" hidden onChange={handleVideoFile} />
                </Button>
                {uploading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <CircularProgress size={16} />
                        <Typography variant="caption" color="textSecondary">Processing video rendering...</Typography>
                    </Box>
                )}
            </Box>

            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#355872' }}>
                    Or Paste YouTube / Vimeo URL
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="https://youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={e => setVideoUrl(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        onClick={addVideoUrl}
                        startIcon={<IconLink size={16} />}
                        sx={{ bgcolor: '#355872', '&:hover': { bgcolor: '#233872' }, textTransform: 'none' }}
                    >
                        Add
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2} sx={{ mt: 1 }}>
                {videos.map((video, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                        <Card variant="outlined" sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
                            <Box sx={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                                {video.type === 'url' ? (
                                    <iframe
                                        src={getEmbedUrl(video.url)}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                                        allowFullScreen
                                        title={`video-${i}`}
                                    />
                                ) : (
                                    <video
                                        src={video.url}
                                        controls
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bg: '#f9fafb' }}>
                                <Typography variant="caption" noWrap sx={{ maxWidth: '70%', fontWeight: 500 }}>
                                    {video.type === 'url' ? 'External Stream Link' : video.title}
                                </Typography>
                                <IconButton size="small" color="error" onClick={() => removeVideo(i)}>
                                    <IconTrash size={16} />
                                </IconButton>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}