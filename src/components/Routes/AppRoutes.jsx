import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
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
        <Box sx={{ width: '100%', minHeight: '100%' }}>
            <Routes>
                {/* Dynamic Landing Dashboard based on Privilege */}
                <Route path="/" element={isAdmin ? <Dashboard /> : <UserDashboard />} />

                {/* Secure Administrator Execution Paths */}
                {isAdmin ? (
                    <>
                        <Route path="/posts" element={<PostList />} />
                        <Route path="/create" element={<CreatePost />} />
                        <Route path="/edit/:id" element={<EditPost />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/roles" element={<RoleManagement />} />
                        <Route path="/automation" element={<AutomationManager />} />
                    </>
                ) : (
                    <>
                        <Route path="/posts" element={<Unauthorized />} />
                        <Route path="/create" element={<Unauthorized />} />
                        <Route path="/edit/:id" element={<Unauthorized />} />
                        <Route path="/users" element={<Unauthorized />} />
                        <Route path="/roles" element={<Unauthorized />} />
                        <Route path="/automation" element={<Unauthorized />} />
                    </>
                )}

                {/* Common Authenticated Views */}
                <Route path="/clients" element={<ClientList />} />
                <Route path="/profile" element={<UserProfile />} />

                {/* Fallback Redirection */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Box>
    );
}