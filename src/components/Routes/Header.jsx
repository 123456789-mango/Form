import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ sidebarExpanded, setSidebarExpanded, userName, isAdmin, profileDropdownOpen, setProfileDropdownOpen, handleLogout, handleProfileClick }) {
    return (
        <header className="mc-header">
            <div className="mc-header-left">
                <button
                    className="mc-sidebar-toggle"
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    title="Toggle System Menu"
                >
                    ☰
                </button>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '22px' }}>📝</span>
                    <h2 className="mc-navbar-logo-text" style={{ margin: 0 }}>Core Engine</h2>
                </Link>
            </div>

            <div className="mc-header-right">
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            transition: 'background-color 0.2s',
                            backgroundColor: profileDropdownOpen ? '#f3f4f6' : 'transparent'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = profileDropdownOpen ? '#f3f4f6' : 'transparent'}
                    >
                        <div className="mc-avatar">{isAdmin ? 'AD' : 'US'}</div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937' }}>{userName}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>▼</span>
                    </button>

                    {profileDropdownOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            minWidth: '200px',
                            zIndex: 1000,
                            overflow: 'hidden'
                        }}>
                            <button
                                onClick={handleProfileClick}
                                style={{
                                    width: '100%', padding: '12px 16px', border: 'none', backgroundColor: 'transparent',
                                    textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#1f2937',
                                    fontWeight: '500', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                👤 My Profile
                            </button>
                            <div style={{ height: '1px', backgroundColor: '#e5e7eb' }} />
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%', padding: '12px 16px', border: 'none', backgroundColor: 'transparent',
                                    textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#dc2626',
                                    fontWeight: '500', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}