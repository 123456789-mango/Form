import { useState } from 'react';
import { uploadGallery } from '../api/blog';
import '../styles/MetallicChic.css';

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
        <div>
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                disabled={uploading}
                className="mc-input"
            />
            {uploading && <p className="mc-status-text">⏳ Uploading images to gallery...</p>}

            <div className="mc-grid">
                {gallery.map((url, i) => (
                    <div key={i} className="mc-img-wrap">
                        <img src={url} alt={`gallery-${i}`} className="mc-gallery-img" />
                        <button onClick={() => removeImage(i)} className="mc-btn-remove-circle">✕</button>
                    </div>
                ))}
            </div>
        </div>
    );
}