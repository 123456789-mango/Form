import React from 'react';
import { Routes, Route, useLocation, Navigate, BrowserRouter } from 'react-router-dom';
import Login from './components/User/Login';
import Layout from './components/Routes/Layout';

function AuthLayout() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login';
    const token = localStorage.getItem('token');

    if (isAuthPage) {
        if (token) {
            return <Navigate to="/" replace />;
        }
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
            </Routes>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Layout />;
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthLayout />
        </BrowserRouter>
    );
}