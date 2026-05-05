import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deletePost, getAllPosts } from '../api/blog';

export default function PostList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getAllPosts()
            .then(setPosts)
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this post?')) return;
        await deletePost(id);
        setPosts(posts.filter(p => p._id !== id));
    };

    if (loading) return <p style={styles.center}>Loading posts...</p>;

    return (
        <div style={styles.container}>
            <h2>All Posts ({posts.length})</h2>
            {posts.length === 0 && <p>No posts yet. <Link to="/create">Create one!</Link></p>}
            {posts.map(post => (
                <div key={post._id} style={styles.card}>
                    {/* Cover Image */}
                    {post.coverImage && (
                        <img src={post.coverImage} alt={post.title} style={styles.img} />
                    )}
                    <div style={styles.info}>
                        <h3 style={styles.title}>{post.title}</h3>
                        <p style={styles.meta}>
                            {post.author} · {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        {/* Tags */}
                        <div style={styles.tags}>
                            {post.tags?.map(tag => (
                                <span key={tag} style={styles.tag}>#{tag}</span>
                            ))}
                        </div>
                    </div>
                    {/* Actions */}
                    <div style={styles.actions}>
                        <button
                            onClick={() => navigate(`/edit/${post._id}`)}
                            style={styles.editBtn}
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={() => handleDelete(post._id)}
                            style={styles.deleteBtn}
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

const styles = {
    container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
    center: { textAlign: 'center', marginTop: '40px' },
    card: { display: 'flex', gap: '16px', alignItems: 'center', background: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
    img: { width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' },
    info: { flex: 1 },
    title: { margin: '0 0 4px', fontSize: '18px' },
    meta: { margin: '0 0 6px', color: 'gray', fontSize: '13px' },
    tags: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    tag: { background: '#ede9fe', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' },
    actions: { display: 'flex', flexDirection: 'column', gap: '8px' },
    editBtn: { background: '#4f46e5', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' },
    deleteBtn: { background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' },
};