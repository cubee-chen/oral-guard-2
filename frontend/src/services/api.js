// services/api.js - Add request caching

import axios from 'axios';
axios.defaults.withCredentials = true;

// Create a simple in-memory cache
const cache = new Map();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true
});

// Add response caching for GET requests
api.interceptors.request.use(
  (config) => {
    // Only cache GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
      const cachedResponse = cache.get(cacheKey);
      
      if (cachedResponse) {
        // Check if the cache is still valid (5 minutes)
        const now = Date.now();
        if (now - cachedResponse.timestamp < 5 * 60 * 1000) {
          // Return cached response as a promise
          return {
            ...config,
            adapter: () => Promise.resolve(cachedResponse.response),
            fromCache: true
          };
        } else {
          // Delete expired cache
          cache.delete(cacheKey);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Cache successful GET responses
api.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get' && !response.config.fromCache) {
      const cacheKey = `${response.config.url}${JSON.stringify(response.config.params || {})}`;
      
      cache.set(cacheKey, {
        response,
        timestamp: Date.now()
      });
      
      // Only keep the last 100 responses to prevent memory leaks
      if (cache.size > 100) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
      }
    }
    return response;
  },
  (error) => {
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;