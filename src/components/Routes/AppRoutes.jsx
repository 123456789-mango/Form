import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Unauthorized from '../unauthorized/Unauthorized';
import Dashboard from '../Dashboard/Dashboard';
import UserDashboard from '../Dashboard/UserDashboard';
import PostList from '../Post/PostList';
import CreatePost from '../Post/CreatePost';
import EditPost from '../Post/EditPost';
import UserManagement from '../User/UserManagement';
import RoleManagement from '../Role/RoleManagement';
import ClientList from '../MeroshareClient/ClientList';
import UserProfile from '../User/UserProfile';
import AutomationManager from '../MeroshareClient/AutomationManager';

function Private({ children }) {
    const token = localStorage.getItem('token');
    const location = useLocation();
    if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
    return children;
}

export default function AppRoutes({ isAdmin }) {
    return (
        <Routes>
            <Route path="/" element={<Private>{isAdmin ? <Dashboard /> : <UserDashboard />}</Private>} />

            {isAdmin && (
                <>
                    <Route path="/posts" element={<Private><PostList /></Private>} />
                    <Route path="/create" element={<Private><CreatePost /></Private>} />
                    <Route path="/edit/:id" element={<Private><EditPost /></Private>} />
                    <Route path="/users" element={<Private><UserManagement /></Private>} />
                    <Route path="/roles" element={<Private><RoleManagement /></Private>} />
                    <Route path="/automation" element={<Private><AutomationManager /></Private>} />
                </>
            )}

            <Route path="/clients" element={<Private><ClientList /></Private>} />
            <Route path="/profile" element={<Private><UserProfile /></Private>} />

            {!isAdmin && (
                <>
                    <Route path="/posts" element={<Private><Unauthorized /></Private>} />
                    <Route path="/create" element={<Private><Unauthorized /></Private>} />
                    <Route path="/edit/:id" element={<Private><Unauthorized /></Private>} />
                    <Route path="/users" element={<Private><Unauthorized /></Private>} />
                    <Route path="/roles" element={<Private><Unauthorized /></Private>} />
                    {/* Kept original logic allowing non-admins to access automation */}
                    <Route path="/automation" element={<Private><AutomationManager /></Private>} /> 
                </>
            )}
        </Routes>
    );
}