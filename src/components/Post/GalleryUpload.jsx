import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Card, CircularProgress, IconButton } from '@mui/material';
import { IconPhotoPlus, IconX } from '@tabler/icons-react';
import { uploadGallery } from '../../api/blog';

export default function GalleryUpload({ gallery, setGallery }) {
    const [uploading, setUploading] = useState(false);

    const handleFiles = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);
        try {
            const result = await uploadGallery(files);
            if (!result.urls || !Array.isArray(result.urls)) {
                alert(result.error || 'Gallery upload failed');
                return;
            }
            setGallery(prev => [...prev, ...result.urls]);
        } catch {
            alert('Gallery upload failed');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const removeImage = (index) => {
        setGallery(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
                variant="outlined"
                component="label"
                startIcon={<IconPhotoPlus />}
                disabled={uploading}
                sx={{ width: 'fit-content', textTransform: 'none', borderColor: '#7AAACE', color: '#355872' }}
            >
                Upload Images
                <input type="file" accept="image/*" multiple hidden onChange={handleFiles} />
            </Button>

            {uploading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="textSecondary">Uploading gallery batch...</Typography>
                </Box>
            )}

            <Grid container spacing={1.5}>
                {gallery.map((url, i) => (
                    <Grid item xs={4} sm={3} md={2} key={i}>
                        <Card variant="outlined" sx={{ position: 'relative', width: '100%', paddingTop: '100%', borderRadius: 2 }}>
                            <Box
                                component="img"
                                src={url}
                                alt={`gallery-${i}`}
                                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => removeImage(i)}
                                sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                                    width: 22,
                                    height: 22
                                }}
                            >
                                <IconX size={14} />
                            </IconButton>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}