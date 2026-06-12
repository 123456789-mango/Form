// src/components/Unauthorized.jsx
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
    const navigate = useNavigate();

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.iconCircle}>
                    <span style={styles.icon}>🔒</span>
                </div>
                <h2 style={styles.title}>Access Denied</h2>
                <p style={styles.message}>
                    You don't have permission to view this page. Please contact your
                    administrator if you think this is a mistake.
                </p>
                <div style={styles.actions}>
                    <button style={styles.btnOutline} onClick={() => navigate(-1)}>
                        ← Go Back
                    </button>
                    <button style={styles.btnOutline} onClick={() => navigate('/')}>
                        🏠 Home
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    wrapper: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', padding: '2rem',
    },
    container: {
        textAlign: 'center', maxWidth: '400px',
    },
    iconCircle: {
        width: '80px', height: '80px', borderRadius: '50%',
        background: '#fef2f2', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 1.5rem',
    },
    icon: { fontSize: '36px' },
    title: { fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem' },
    message: { fontSize: '15px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 2rem' },
    actions: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
    btnOutline: {
        padding: '9px 18px', fontSize: '14px', borderRadius: '8px',
        border: '1px solid #d1d5db', background: 'white',
        cursor: 'pointer', color: '#374151',
    },
};