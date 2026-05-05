import { useState } from 'react';
import { uploadGallery } from '../api/blog';

export default function GalleryUpload({ gallery, setGallery }) {
    const [uploading, setUploading] = useState(false);

    const handleFiles = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setUploading(true);
        try {
            const result = await uploadGallery(files);

            // ← Guard: check urls exists and is array before spreading
            if (!result.urls || !Array.isArray(result.urls)) {
                alert(result.error || 'Gallery upload failed');
                return;
            }

            setGallery(prev => [...prev, ...result.urls]);
        } catch {
            alert('Gallery upload failed');
        } finally {
            setUploading(false);
            e.target.value = ''; // reset file input
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
            />
            {uploading && <p style={{ color: '#4f46e5' }}>⏳ Uploading images...</p>}

            <div style={styles.grid}>
                {gallery.map((url, i) => (
                    <div key={i} style={styles.imgWrap}>
                        <img src={url} alt={`gallery-${i}`} style={styles.img} />
                        <button onClick={() => removeImage(i)} style={styles.remove}>✕</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    grid: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' },
    imgWrap: { position: 'relative' },
    img: { width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px' },
    remove: { position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px' },
};