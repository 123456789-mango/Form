import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

export default function AppRoutes({ isAdmin }) {
    return (
        <Routes>
            <Route path="/" element={isAdmin ? <Dashboard /> : <UserDashboard />} />

            {isAdmin && (
                <>
                    <Route path="/posts" element={<PostList />} />
                    <Route path="/create" element={<CreatePost />} />
                    <Route path="/edit/:id" element={<EditPost />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route path="/roles" element={<RoleManagement />} />
                    <Route path="/automation" element={<AutomationManager />} />
                </>
            )}

            <Route path="/clients" element={<ClientList />} />
            <Route path="/profile" element={<UserProfile />} />

            {!isAdmin && (
                <>
                    <Route path="/posts" element={<Unauthorized />} />
                    <Route path="/create" element={<Unauthorized />} />
                    <Route path="/edit/:id" element={<Unauthorized />} />
                    <Route path="/users" element={<Unauthorized />} />
                    <Route path="/roles" element={<Unauthorized />} />
                    <Route path="/automation" element={<Unauthorized />} />
                </>
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}