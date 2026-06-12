import { Link, useNavigate } from 'react-router-dom';
import '../styles/MetallicChic.css';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="mc-navbar-container">
            <nav className="mc-navbar">
                {/* Brand Logo Section */}
                <Link to="/" className="mc-navbar-brand">
                    <span className="mc-navbar-icon">📝</span>
                    <h2 className="mc-navbar-logo-text">Blog Admin</h2>
                </Link>

                {/* Navigation Links */}
                <div className="mc-navbar-links">
                    <Link to="/" className="mc-navbar-link">All Posts</Link>
                    <Link to="/create" className="mc-navbar-link mc-navbar-btn-accent">
                        + New Post
                    </Link>

                    {/* Authentication Section */}
                    <div className="mc-navbar-auth">
                        {token ? (
                            <button onClick={handleLogout} className="mc-navbar-btn-logout">
                                Logout
                            </button>
                        ) : (
                            <Link to="/login" className="mc-navbar-link">Login</Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}