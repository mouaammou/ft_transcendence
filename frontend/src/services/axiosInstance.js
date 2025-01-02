'use client';
import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_URL;

const axiosInstance = axios.create({
  baseURL: `${baseUrl}/backend`,
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor with enhanced logging and OAuth handling
axiosInstance.interceptors.request.use(
  config => {
    // Remove any double slashes in the URL except after http(s):
    config.url = config.url.replace(/([^:]\/)\/+/g, "$1");
    
    // If the request data is FormData, remove the Content-Type header
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Add cache control headers for OAuth endpoints
    if (config.url.includes('auth/callback')) {
      config.headers = {
        ...config.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };

      // Log OAuth request for debugging
      console.log('OAuth Request:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      });
    }
    
    return config;
  },
  error => {
    console.log('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
axiosInstance.interceptors.response.use(
  response => {
    // Log successful OAuth responses
    if (response.config.url.includes('auth/callback')) {
      console.log('OAuth Response:', {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  error => {
    // Log error details
    console.log('Response Error:', {
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
      config: error?.config
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Don't redirect if already on login page
      if (window.location.pathname !== '/login') {
        // Use window.location.replace to prevent adding to history
        window.location.replace('/login');
      }
    }

    // Handle OAuth specific errors
    if (error.config?.url?.includes('auth/callback')) {
      console.log('OAuth Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }

    return Promise.reject({
      ...error,
      message: error.response?.data?.Error || error.message
    });
  }
);

// Add retry logic for failed requests
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Only retry GET requests and not for OAuth endpoints
    if (
      !originalRequest._retry && 
      originalRequest.method === 'get' && 
      !originalRequest.url.includes('auth/callback') &&
      error.response?.status >= 500
    ) {
      originalRequest._retry = true;
      try {
        return await axiosInstance(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;