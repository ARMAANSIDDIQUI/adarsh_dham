import axios from 'axios';
// We MUST import store from here to break the cycle.
import { store } from '../redux/store'; 

const api = axios.create({
  // Your backend URL from .env or default
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * THE FIX IS HERE
 * We use an interceptor to add the auth token to every request.
 *
 * By getting the store from the interceptor's scope, we wait
 * until the store has been safely created.
 */
api.interceptors.request.use(
  (config) => {
    // Get the token from the already-loaded store
    const token = store.getState().auth.token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;