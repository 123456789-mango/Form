import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/User/Login';
import Layout from './components/Routes/Layout';

function AuthLayout() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login';

    if (isAuthPage) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
            </Routes>
        );
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