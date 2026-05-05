const BASE_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

// Public header (no key needed)
const publicHeaders = { 'Content-Type': 'application/json' };

// Admin header (key required)
const adminHeaders = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
};

// ✅ PUBLIC
export const getAllPosts = async () => {
    const res = await fetch(`${BASE_URL}/api/posts`);
    return res.json();
};

export const getPost = async (id) => {
    const res = await fetch(`${BASE_URL}/api/posts/${id}`);
    return res.json();
};

// 🔒 PROTECTED
export const createPost = async (postData) => {
    const res = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify(postData),
    });
    return res.json();
};

export const updatePost = async (id, postData) => {
    const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify(postData),
    });
    return res.json();
};

export const deletePost = async (id) => {
    const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        method: 'DELETE',
        headers: adminHeaders,
    });
    return res.json();
};

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: { 'x-api-key': API_KEY }, // no Content-Type for FormData
        body: formData,
    });
    return res.json();
};