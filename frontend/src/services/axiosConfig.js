import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if it's a 401/403 AND the request was not to an auth endpoint
    const isAuthRoute = error.config && error.config.url && (error.config.url.includes('/login') || error.config.url.includes('/auth'));
    
    if (error.response && (error.response.status === 401 || error.response.status === 403) && !isAuthRoute) {
      // Token is invalid/expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
