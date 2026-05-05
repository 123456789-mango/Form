import { useState } from 'react';
import { uploadVideo } from '../api/blog';

export default function VideoUpload({ videos, setVideos }) {
    const [videoUrl, setVideoUrl] = useState('');
    const [uploading, setUploading] = useState(false);

    // Add YouTube/Vimeo URL
    const addVideoUrl = () => {
        if (!videoUrl.trim()) return;
        setVideos(prev => [...prev, { type: 'url', url: videoUrl, title: '' }]);
        setVideoUrl('');
    };

    // Upload video file
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

    // Convert YouTube URL to embed URL
    const getEmbedUrl = (url) => {
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        return url;
    };

    return (
        <div>
            {/* Upload video file */}
            <p style={styles.subLabel}>Upload Video File (mp4, mov)</p>
            <input
                type="file"
                accept="video/*"
                onChange={handleVideoFile}
                disabled={uploading}
            />
            {uploading && <p style={{ color: '#4f46e5' }}>Uploading video...</p>}

            {/* Paste YouTube/Vimeo URL */}
            <p style={styles.subLabel}>Or Paste YouTube / Vimeo URL</p>
            <div style={styles.urlRow}>
                <input
                    style={styles.input}
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                />
                <button onClick={addVideoUrl} style={styles.addBtn}>+ Add</button>
            </div>

            {/* Video Previews */}
            <div style={{ marginTop: '16px' }}>
                {videos.map((video, i) => (
                    <div key={i} style={styles.videoCard}>
                        {video.type === 'url' ? (
                            <iframe
                                src={getEmbedUrl(video.url)}
                                style={styles.iframe}
                                allowFullScreen
                                title={`video-${i}`}
                            />
                        ) : (
                            <video src={video.url} controls style={styles.iframe} />
                        )}
                        <button onClick={() => removeVideo(i)} style={styles.remove}>✕ Remove</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    subLabel: { fontWeight: 'bold', margin: '12px 0 6px', color: '#555' },
    urlRow: { display: 'flex', gap: '8px' },
    input: { flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' },
    addBtn: { background: '#4f46e5', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' },
    videoCard: { background: '#f9fafb', borderRadius: '8px', padding: '12px', marginBottom: '12px' },
    iframe: { width: '100%', height: '200px', borderRadius: '6px', border: 'none' },
    remove: { marginTop: '8px', background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' },
};