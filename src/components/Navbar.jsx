import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav style={styles.nav}>
            <h2 style={styles.logo}>📝 Blog Admin</h2>
            <div style={styles.links}>
                <Link to="/" style={styles.link}>All Posts</Link>
                <Link to="/create" style={styles.link}>+ New Post</Link>
            </div>
        </nav>
    );
}

const styles = {
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#4f46e5', color: 'white' },
    logo: { margin: 0, color: 'white' },
    links: { display: 'flex', gap: '16px' },
    link: { color: 'white', textDecoration: 'none', fontWeight: 'bold' },
};