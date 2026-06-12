import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bg from '../assets/images/login.jpg';
import '../styles/MetallicChic.css';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) return alert('Enter username and password');
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            localStorage.setItem('token', data.token);
            navigate('/');
        } catch (err) {
            alert(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mc-login-page" style={{ backgroundImage: `url(${bg})` }}>
            <div className="mc-login-card">
                <h2 className="mc-title">Admin Access</h2>
                <form onSubmit={handleSubmit} className="mc-login-form">

                    <div>
                        <label className="mc-label" style={{ marginTop: '0' }}>Username</label>
                        <input
                            className="mc-input"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mc-label" style={{ marginTop: '0' }}>Password</label>
                        <input
                            className="mc-input"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <button className="mc-btn-primary" type="submit" disabled={loading} style={{ marginTop: '16px' }}>
                        {loading ? 'Authenticating...' : 'Log in'}
                    </button>
                </form>
            </div>
        </div>
    );
}