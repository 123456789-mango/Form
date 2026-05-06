import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { createPost, uploadImage } from '../api/blog';
import GalleryUpload from '../components/GalleryUpload';
import VideoUpload from '../components/VideoUpload';

export default function CreatePost() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', tags: '', author: 'Admin', category: 'General' });
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [gallery, setGallery] = useState([]);   // ← new
    const [videos, setVideos] = useState([]);   // ← new
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
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
                gallery,   // ← new
                videos,    // ← new
            });
            navigate('/');
        } catch {
            alert('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Create New Post</h2>

            <label style={styles.label}>Title</label>
            <input style={styles.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Post title..." />

            <label style={styles.label}>Author</label>
            <input style={styles.input} value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />

            <label style={styles.label}>Category</label>
            <input style={styles.input} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="General" />

            <label style={styles.label}>Tags (comma separated)</label>
            <input style={styles.input} value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="react, javascript..." />

            <label style={styles.label}>Cover Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && <img src={preview} alt="preview" style={styles.preview} />}

            <label style={styles.label}>Content</label>
            <ReactQuill value={content} onChange={setContent} style={{ height: '300px', marginBottom: '50px' }} />

            {/* Gallery */}
            <label style={styles.label}>Gallery Images</label>
            <GalleryUpload gallery={gallery} setGallery={setGallery} />

            {/* Videos */}
            <label style={styles.label}>Videos</label>
            <VideoUpload videos={videos} setVideos={setVideos} />

            <button onClick={handleSubmit} disabled={loading} style={styles.btn}>
                {loading ? 'Publishing...' : '🚀 Publish Post'}
            </button>
        </div>
    );
}

const styles = {
    container: { padding: '24px', maxWidth: '800px', margin: '0 auto' },
    label: { display: 'block', fontWeight: 'bold', marginBottom: '6px', marginTop: '24px' },
    input: { width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
    preview: { width: '200px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' },
    btn: { marginTop: '24px', background: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', width: '100%' },
};