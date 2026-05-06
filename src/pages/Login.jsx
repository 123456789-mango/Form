import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [key, setKey] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!key) return alert('Enter API key');
        localStorage.setItem('api_key', key);
        navigate('/');
    };

    return (
        <div style={styles.container}>
            <h2>Admin Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <label style={styles.label}>API Key</label>
                <input style={styles.input} value={key} onChange={e => setKey(e.target.value)} placeholder="Paste your admin API key" />
                <button style={styles.btn} type="submit">Log in</button>
            </form>
            <p style={{ marginTop: 16 }}>This key is stored locally in your browser only.</p>
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
