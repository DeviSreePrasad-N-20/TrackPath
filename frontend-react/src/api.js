import axios from 'axios';

// Automatic fallback to live Render backend if hosted on Vercel
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://trackpath-ymo7.onrender.com';
  }
  return '';
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
