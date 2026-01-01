import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import {authApi} from './auth';
import {isTokenExpired} from '../utils/tokenUtils';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important if backend sets cookies, though tokens seem to be in body based on analysis
});

// Flag to track if we're currently refreshing the token (prevents race conditions)
let isRefreshing = false;
// Queue to store failed requests while refreshing
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
  async (config) => {
    // Skip adding Authorization header for refresh token endpoint
    // It's a public endpoint that uses refresh token in body, not access token in header
    if (config.url?.includes('/auth/refresh')) {
      return config;
    }
    
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {} as any;
    }
    
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      // Check if token is expired before sending request
      if (isTokenExpired(token)) {
        console.warn('Access token expired, attempting to refresh...');
        
        // Try to refresh the token before making the request
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshTokenId = parseInt(refreshToken, 10);
            const response = await authApi.refreshToken(refreshTokenId);
            
            // Update stored tokens
            if (response.accessToken) {
              localStorage.setItem('accessToken', response.accessToken);
              config.headers['Authorization'] = `Bearer ${response.accessToken}`;
            }
            if (response.refreshToken) {
              localStorage.setItem('refreshToken', response.refreshToken.toString());
            }
            
            // Update user data if provided
            if (response.id && response.firstName && response.lastName) {
              const userData = {
                id: response.id,
                firstName: response.firstName,
                lastName: response.lastName,
                role: response.role,
                hotelId: response.hotelId,
              };
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and let the request fail
            console.error('Token refresh failed:', refreshError);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            // Don't set Authorization header, let the request fail with 401
            // The response interceptor will handle it
          }
        } else {
          // No refresh token, clear access token
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      } else {
        // Token is valid, use it
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors and refresh tokens
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh logic for auth endpoints (login, register, refresh itself)
    if (
      originalRequest?.url?.includes('/auth/sign-in') ||
      originalRequest?.url?.includes('/auth/sign-up') ||
      originalRequest?.url?.includes('/auth/login-stage1') ||
      originalRequest?.url?.includes('/auth/login-2fa') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/forgot-password') ||
      originalRequest?.url?.includes('/auth/verify-code') ||
      originalRequest?.url?.includes('/auth/reset-password') ||
      originalRequest?.url?.includes('/auth/verify-otp')
    ) {
      // For auth endpoints, handle 401 normally (don't try to refresh)
      if (error.response?.status === 401) {
        // Clear auth state and redirect to login if not already on auth pages
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (!window.location.pathname.startsWith('/login') && 
            !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }

    // Handle 401 errors for protected endpoints
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token available, logout user
        isRefreshing = false;
        processQueue(new Error('No refresh token available'), null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (!window.location.pathname.startsWith('/login') && 
            !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const refreshTokenId = parseInt(refreshToken, 10);
        const response = await authApi.refreshToken(refreshTokenId);
        
        // Update stored tokens
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
        }
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken.toString());
        }

        // Update user data if provided
        if (response.id && response.firstName && response.lastName) {
          const userData = {
            id: response.id,
            firstName: response.firstName,
            lastName: response.lastName,
            role: response.role,
          };
          localStorage.setItem('user', JSON.stringify(userData));
        }

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${response.accessToken}`;
        }

        // Process queued requests
        processQueue(null, response.accessToken || null);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        isRefreshing = false;
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        if (!window.location.pathname.startsWith('/login') && 
            !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
