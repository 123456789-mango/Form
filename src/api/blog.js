const BASE_URL = import.meta.env.VITE_API_URL;

export const getAllPosts = async () => {
    const res = await fetch(`${BASE_URL}/api/posts`);
    return res.json();
};

export const getPost = async (id) => {
    const res = await fetch(`${BASE_URL}/api/posts/${id}`);
    return res.json();
};

export const createPost = async (postData) => {
    const res = await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    });
    return res.json();
};

export const updatePost = async (id, postData) => {
    const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    });
    return res.json();
};

export const deletePost = async (id) => {
    const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
        method: 'DELETE',
    });
    return res.json();
};

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
    });
    return res.json();
};