import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { createPost, uploadImage } from '../api/blog';
import GalleryUpload from '../components/GalleryUpload';
import VideoUpload from '../components/VideoUpload';
import '../styles/MetallicChic.css';

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
        <div className="mc-form-container">
            <h2 className="mc-title">Create New Post</h2>

            <label className="mc-label">Title</label>
            <input className="mc-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Post title..." />

            <div className="mc-header-row" style={{ marginTop: '24px' }}>
                <div style={{ flex: 1 }}>
                    <label className="mc-label" style={{ marginTop: '0' }}>Author</label>
                    <input className="mc-input" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                </div>
                <div style={{ flex: 1 }}>
                    <label className="mc-label" style={{ marginTop: '0' }}>Category</label>
                    <input className="mc-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="General" />
                </div>
            </div>

            <label className="mc-label">Tags (comma separated)</label>
            <input className="mc-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="react, javascript..." />

            <label className="mc-label">Cover Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="mc-input" style={{ padding: '8px' }} />
            {preview && (
                <div className="mc-img-wrap" style={{ display: 'inline-block', marginTop: '12px' }}>
                    <img src={preview} alt="preview" className="mc-cover" />
                </div>
            )}

            <label className="mc-label">Content</label>
            <ReactQuill value={content} onChange={setContent} style={{ height: '300px', marginBottom: '50px' }} />

            <div className="mc-card" style={{ marginTop: '40px' }}>
                <label className="mc-title" style={{ fontSize: '18px' }}>Gallery Images</label>
                <GalleryUpload gallery={gallery} setGallery={setGallery} />
            </div>

            <div className="mc-card">
                <label className="mc-title" style={{ fontSize: '18px' }}>Videos</label>
                <VideoUpload videos={videos} setVideos={setVideos} />
            </div>

            <button onClick={handleSubmit} disabled={loading} className="mc-btn-primary">
                {loading ? 'Publishing...' : '🚀 Publish Post'}
            </button>
        </div>
    );
}