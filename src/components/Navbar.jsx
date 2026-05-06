import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const apiKey = localStorage.getItem('api_key') || import.meta.env.VITE_API_KEY;

    const handleLogout = () => {
        localStorage.removeItem('api_key');
        navigate('/login');
    };

    return (
        <nav style={styles.nav}>
            <h2 style={styles.logo}>📝 Blog Admin</h2>
            <div style={styles.links}>
                <Link to="/" style={styles.link}>All Posts</Link>
                <Link to="/create" style={styles.link}>+ New Post</Link>
                {apiKey ? (
                    <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                ) : (
                    <Link to="/login" style={styles.link}>Login</Link>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#4f46e5', color: 'white' },
    logo: { margin: 0, color: 'white' },
    links: { display: 'flex', gap: '16px', alignItems: 'center' },
    link: { color: 'white', textDecoration: 'none', fontWeight: 'bold' },
    logoutBtn: { background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' },
};