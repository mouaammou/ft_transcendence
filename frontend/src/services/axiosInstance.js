'use client';
import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;


const axiosInstance = axios.create({
  baseURL: `${baseUrl}/backend`,  // Use the environment variable
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // Remove any double slashes in the URL except after http(s):
    config.url = config.url.replace(/([^:]\/)\/+/g, "$1");
    return config;
  },
  error => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;