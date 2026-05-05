import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { createPost, uploadImage } from '../api/blog';

export default function CreatePost() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', content: '', tags: '', author: 'Admin' });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!form.title || !form.content) return alert('Title and content required!');
        setLoading(true);
        try {
            let coverImage = '';
            if (image) {
                const uploaded = await uploadImage(image);
                coverImage = uploaded.url;
            }
            await createPost({
                ...form,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                coverImage,
            });
            navigate('/');
        } catch (err) {
            alert('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Create New Post</h2>

            {/* Title */}
            <label style={styles.label}>Title</label>
            <input
                style={styles.input}
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Post title..."
            />

            {/* Author */}
            <label style={styles.label}>Author</label>
            <input
                style={styles.input}
                value={form.author}
                onChange={e => setForm({ ...form, author: e.target.value })}
                placeholder="Author name..."
            />

            {/* Tags */}
            <label style={styles.label}>Tags (comma separated)</label>
            <input
                style={styles.input}
                value={form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
                placeholder="react, javascript, web..."
            />

            {/* Cover Image */}
            <label style={styles.label}>Cover Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && <img src={preview} alt="preview" style={styles.preview} />}

            {/* Content */}
            <label style={styles.label}>Content</label>
            <ReactQuill
                value={form.content}
                onChange={content => setForm({ ...form, content })}
                style={{ height: '300px', marginBottom: '50px' }}
            />

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={loading}
                style={styles.btn}
            >
                {loading ? 'Publishing...' : '🚀 Publish Post'}
            </button>
        </div>
    );
}

const styles = {
    container: { padding: '24px', maxWidth: '800px', margin: '0 auto' },
    label: { display: 'block', fontWeight: 'bold', marginBottom: '6px', marginTop: '16px' },
    input: { width: '100%', padding: '10px', fontSize: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
    preview: { width: '200px', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' },
    btn: { marginTop: '16px', background: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', width: '100%' },
};