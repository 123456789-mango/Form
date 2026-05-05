import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deletePost, getAllPosts } from '../api/blog';

// Helper to convert YouTube/Vimeo to embed URL
const getEmbedUrl = (url) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
    return url;
};

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
            {posts.length === 0 && <p>No posts yet.</p>}

            {posts.map(post => (
                <div key={post._id} style={styles.card}>

                    {/* Header row */}
                    <div style={styles.header}>
                        {post.coverImage && (
                            <img src={post.coverImage} alt={post.title} style={styles.cover} />
                        )}
                        <div style={styles.info}>
                            <h3 style={styles.title}>{post.title}</h3>
                            <p style={styles.meta}>
                                {post.author} · {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                            <div style={styles.tags}>
                                {post.tags?.map(tag => (
                                    <span key={tag} style={styles.tag}>#{tag}</span>
                                ))}
                            </div>
                        </div>
                        {/* Actions */}
                        <div style={styles.actions}>
                            <button onClick={() => navigate(`/edit/${post._id}`)} style={styles.editBtn}>✏️ Edit</button>
                            <button onClick={() => handleDelete(post._id)} style={styles.deleteBtn}>🗑️ Delete</button>
                        </div>
                    </div>

                    {/* Content preview */}
                    <div
                        style={styles.contentPreview}
                        dangerouslySetInnerHTML={{ __html: post.content?.substring(0, 200) + '...' }}
                    />

                    {/* Gallery */}
                    {post.gallery?.length > 0 && (
                        <div style={styles.section}>
                            <p style={styles.sectionLabel}>📷 Gallery ({post.gallery.length} images)</p>
                            <div style={styles.galleryGrid}>
                                {post.gallery.map((url, i) => (
                                    <img key={i} src={url} alt={`gallery-${i}`} style={styles.galleryImg} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Videos */}
                    {post.videos?.length > 0 && (
                        <div style={styles.section}>
                            <p style={styles.sectionLabel}>🎥 Videos ({post.videos.length})</p>
                            <div style={styles.videoGrid}>
                                {post.videos.map((video, i) => (
                                    video.type === 'url' ? (
                                        <iframe
                                            key={i}
                                            src={getEmbedUrl(video.url)}
                                            style={styles.videoThumb}
                                            allowFullScreen
                                            title={`video-${i}`}
                                        />
                                    ) : (
                                        <video key={i} src={video.url} controls style={styles.videoThumb} />
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            ))}
        </div>
    );
}

const styles = {
    container: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
    center: { textAlign: 'center', marginTop: '40px' },
    card: { background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.1)' },
    header: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    cover: { width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 },
    info: { flex: 1 },
    title: { margin: '0 0 4px', fontSize: '18px' },
    meta: { margin: '0 0 6px', color: 'gray', fontSize: '13px' },
    tags: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
    tag: { background: '#ede9fe', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' },
    actions: { display: 'flex', flexDirection: 'column', gap: '8px' },
    editBtn: { background: '#4f46e5', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' },
    deleteBtn: { background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' },
    contentPreview: { color: '#555', fontSize: '14px', marginTop: '12px', lineHeight: '1.5' },
    section: { marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' },
    sectionLabel: { fontWeight: 'bold', color: '#555', marginBottom: '8px' },
    galleryGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    galleryImg: { width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' },
    videoGrid: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    videoThumb: { width: '280px', height: '160px', borderRadius: '6px', border: 'none' },
};