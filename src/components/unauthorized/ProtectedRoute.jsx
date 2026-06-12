// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import Unauthorized from './Unauthorized';

export default function ProtectedRoute({ children, allowedRoles }) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Unauthorized />;
    }

    return children;
}