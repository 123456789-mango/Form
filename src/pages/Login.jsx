import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export default function Login() {
    const [username, setUsername] = useState('sysadmin');
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
            localStorage.setItem('api_key', data.apiKey);
            navigate('/');
        } catch (err) {
            alert(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Admin Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>Username</label>
                <input style={styles.input} value={username} onChange={e => setUsername(e.target.value)} />

                <label style={styles.label}>Password</label>
                <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} />

                <button style={styles.btn} type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
            </form>
            <p style={{ marginTop: 16 }}>Credentials default to <strong>sysadmin</strong> / <strong>Neema@123</strong> unless overridden by environment variables.</p>
        </div>
    );
}

const styles = {
    container: { padding: '24px', maxWidth: '480px', margin: '40px auto', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 12 },
    label: { textAlign: 'left', fontWeight: 'bold' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd' },
    btn: { padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
};
