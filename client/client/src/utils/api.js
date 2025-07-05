import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - server may be down');
    }
    
    return Promise.reject(error);
  }
);

export default api;
