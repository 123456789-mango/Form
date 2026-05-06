import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import PostList from './pages/PostList';
import Login from './pages/Login';

function Private({ children }) {
    const token = localStorage.getItem('token');
    const apiKey = localStorage.getItem('api_key') || import.meta.env.VITE_API_KEY;
    const location = useLocation();
    if (!token && !apiKey) return <Navigate to="/login" replace state={{ from: location }} />;
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Private><PostList /></Private>} />
                <Route path="/create" element={<Private><CreatePost /></Private>} />
                <Route path="/edit/:id" element={<Private><EditPost /></Private>} />
            </Routes>
        </BrowserRouter>
    );
}