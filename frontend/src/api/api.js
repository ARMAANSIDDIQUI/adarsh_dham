import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL || '';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle expired tokens
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || '';

            // Auto-logout on token expiry or invalid token
            if (status === 401 ||
                (status === 403 && message.toLowerCase().includes('token'))) {

                // Clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');


                // Also trigger a custom event that Redux/App can listen to if needed
                window.dispatchEvent(new Event('auth-expired'));

                // Redirect to login only if not already on it
                if (!window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login?expired=true';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;