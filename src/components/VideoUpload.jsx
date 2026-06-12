import { useState } from 'react';
import { uploadVideo } from '../api/blog';
import '../styles/MetallicChic.css';

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
        <div>
            <p className="mc-sub-label">Upload Video File (mp4, mov)</p>
            <input
                type="file"
                accept="video/*"
                onChange={handleVideoFile}
                disabled={uploading}
                className="mc-input"
            />
            {uploading && <p className="mc-status-text">⏳ Processing metallic video rendering...</p>}

            <p className="mc-sub-label">Or Paste YouTube / Vimeo URL</p>
            <div className="mc-input-row">
                <input
                    className="mc-input"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                />
                <button onClick={addVideoUrl} className="mc-btn">Add Link</button>
            </div>

            <div className="mc-grid">
                {videos.map((video, i) => (
                    <div key={i} className="mc-sub-card">
                        {video.type === 'url' ? (
                            <iframe
                                src={getEmbedUrl(video.url)}
                                className="mc-video-thumb"
                                allowFullScreen
                                title={`video-${i}`}
                            />
                        ) : (
                            <video src={video.url} controls className="mc-video-thumb" />
                        )}
                        <div style={{ marginTop: '12px', textAlign: 'right' }}>
                            <button onClick={() => removeVideo(i)} className="mc-btn-danger">✕ Remove</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}