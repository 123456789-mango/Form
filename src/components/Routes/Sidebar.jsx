import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ sidebarExpanded, isAdmin, currentPath }) {
    return (
        <aside className={`mc-sidebar ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
            <nav className="mc-sidebar-menu">
                <Link to="/" className={`mc-sidebar-item ${currentPath === '/' ? 'active' : ''}`}>
                    <span className="mc-sidebar-icon">📊</span>
                    {sidebarExpanded && <span>Dashboard</span>}
                </Link>

                {isAdmin && (
                    <>
                        <Link to="/posts" className={`mc-sidebar-item ${currentPath === '/posts' ? 'active' : ''}`}>
                            <span className="mc-sidebar-icon">📰</span>
                            {sidebarExpanded && <span>All Posts</span>}
                        </Link>
                    </>
                )}

                <Link to="/clients" className={`mc-sidebar-item ${currentPath === '/clients' ? 'active' : ''}`}>
                    <span className="mc-sidebar-icon">👥</span>
                    {sidebarExpanded && <span>Clients</span>}
                </Link>

                {isAdmin && (
                    <>
                        <Link to="/users" className={`mc-sidebar-item ${currentPath === '/users' ? 'active' : ''}`}>
                            <span className="mc-sidebar-icon">👨‍💼</span>
                            {sidebarExpanded && <span>Users</span>}
                        </Link>
                        <Link to="/roles" className={`mc-sidebar-item ${currentPath === '/roles' ? 'active' : ''}`}>
                            <span className="mc-sidebar-icon">🔐</span>
                            {sidebarExpanded && <span>Roles</span>}
                        </Link>
                        {/* Added Automation Link */}
                        <Link to="/automation" className={`mc-sidebar-item ${currentPath === '/automation' ? 'active' : ''}`}>
                            <span className="mc-sidebar-icon">🤖</span>
                            {sidebarExpanded && <span>Automation</span>}
                        </Link>
                    </>
                )}
            </nav>
        </aside>
    );
}