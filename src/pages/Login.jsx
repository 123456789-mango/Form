import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import bg from '../assets/images/login.jpg';
import '../styles/MetallicChic.css';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const reason = searchParams.get('reason');
        if (reason === 'inactive') {
            setMessage('Session expired due to inactivity. Please log in again.');
        } else if (reason === 'sessionExpired') {
            setMessage('Your session has expired. Please log in again.');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) return alert('Enter username and password');
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');

            // Store both tokens and user data
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/');
        } catch (err) {
            setMessage(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mc-login-page" style={{ backgroundImage: `url(${bg})` }}>
            <div className="mc-login-card">
                <h2 className="mc-title">Admin Access</h2>
                {message && (
                    <div style={{
                        padding: '12px',
                        marginBottom: '16px',
                        backgroundColor: message.includes('failed') ? '#fee2e2' : '#fef3c7',
                        color: message.includes('failed') ? '#dc2626' : '#92400e',
                        borderRadius: '6px',
                        fontSize: '13px'
                    }}>
                        {message}
                    </div>
                )}
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