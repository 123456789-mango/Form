const BASE_URL = import.meta.env.VITE_API_URL;

const getToken = () => {
    return localStorage.getItem('token') || null;
};

const getApiKey = () => {
    return localStorage.getItem('api_key') || import.meta.env.VITE_API_KEY || null;
};

const authHeaders = (isJson = true) => {
    const token = getToken();
    const apiKey = getApiKey();
    const headers = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    else if (apiKey) headers['x-api-key'] = apiKey;
    return headers;
};

export const getAllPosts = async () => (await fetch(`${BASE_URL}/api/posts`)).json();
export const getPost = async (id) => (await fetch(`${BASE_URL}/api/posts/${id}`)).json();

export const createPost = async (postData) => {
    const res = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST', headers: authHeaders(true), body: JSON.stringify(postData),
    });
    return res.json();
};

export const updatePost = async (id, postData) => {
    const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        method: 'PUT', headers: authHeaders(true), body: JSON.stringify(postData),
    });
    return res.json();
};


export const deletePost = async (id) => {
    const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        method: 'DELETE', headers: authHeaders(false),
    });
    return res.json();
};

// Single image (cover)
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST', headers: { ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : { 'x-api-key': getApiKey() }) }, body: formData,
    });
    return res.json();
};

// Multiple images (gallery)
export const uploadGallery = async (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    const res = await fetch(`${BASE_URL}/api/upload/gallery`, {
        method: 'POST',
        headers: { ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : { 'x-api-key': getApiKey() }) },
        body: formData,
    });
    return res.json();
};

// Video file upload
export const uploadVideo = async (file) => {
    const formData = new FormData();
    formData.append('video', file);
    const res = await fetch(`${BASE_URL}/api/upload/video`, {
        method: 'POST', headers: { ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : { 'x-api-key': getApiKey() }) }, body: formData,
    });
    return res.json();
};