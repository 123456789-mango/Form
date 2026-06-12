import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deletePost, getAllPosts } from '../../api/blog';
import '../../styles/MetallicChic.css';

console.log('API KEY:', import.meta.env.VITE_API_KEY);

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

    if (loading) return <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading posts...</p>;

    return (
        <div className="mc-page-container">
            <h2 className="mc-title" style={{ marginBottom: '24px' }}>All Posts ({posts.length})</h2>
            <button onClick={() => navigate('/create')} className="mc-btn" style={{ marginBottom: '20px' }}>➕ Create New Post</button>
            {posts.length === 0 && <p>No posts yet.</p>}

            {posts.map(post => (
                <div key={post._id} className="mc-card">
                    <div className="mc-header-row">
                        {post.coverImage && (
                            <div className="mc-img-wrap">
                                <img src={post.coverImage} alt={post.title} className="mc-cover" />
                            </div>
                        )}
                        <div className="mc-info-col">
                            <h3 className="mc-title">{post.title}</h3>
                            <p className="mc-meta">
                                {post.author} · {new Date(post.createdAt).toLocaleDateString()} · {post.category || 'General'}
                            </p>
                            <div className="mc-tags">
                                {post.tags?.map(tag => (
                                    <span key={tag} className="mc-tag">#{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="mc-action-col">
                            <button onClick={() => navigate(`/edit/${post._id}`)} className="mc-btn">✏️ Edit</button>
                            <button onClick={() => handleDelete(post._id)} className="mc-btn-danger">🗑️ Delete</button>
                        </div>
                    </div>

                    <div
                        style={{ color: '#4b5563', fontSize: '14px', marginTop: '16px', lineHeight: '1.6' }}
                        dangerouslySetInnerHTML={{ __html: post.content?.substring(0, 200) + '...' }}
                    />

                    {post.gallery?.length > 0 && (
                        <div style={{ marginTop: '20px', borderTop: '1px solid #d1d5db', paddingTop: '16px' }}>
                            <p className="mc-sub-label">📷 Gallery ({post.gallery.length} images)</p>
                            <div className="mc-grid">
                                {post.gallery.map((url, i) => (
                                    <img key={i} src={url} alt={`gallery-${i}`} className="mc-gallery-img" style={{ borderRadius: '6px' }} />
                                ))}
                            </div>
                        </div>
                    )}

                    {post.videos?.length > 0 && (
                        <div style={{ marginTop: '20px', borderTop: '1px solid #d1d5db', paddingTop: '16px' }}>
                            <p className="mc-sub-label">🎥 Videos ({post.videos.length})</p>
                            <div className="mc-grid">
                                {post.videos.map((video, i) => (
                                    video.type === 'url' ? (
                                        <iframe
                                            key={i}
                                            src={getEmbedUrl(video.url)}
                                            className="mc-video-thumb"
                                            allowFullScreen
                                            title={`video-${i}`}
                                        />
                                    ) : (
                                        <video key={i} src={video.url} controls className="mc-video-thumb" />
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