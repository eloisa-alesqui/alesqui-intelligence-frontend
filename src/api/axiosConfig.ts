import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

/**
 * Process all queued requests after token refresh completes
 */
const processQueue = (error: any = null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Refresh the access token using the refresh token
 */
const refreshAccessToken = async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await axios.post(
            `${API_BASE_URL || ''}/api/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        return accessToken;
    } catch (error) {
        // Refresh token expired or invalid → clear storage and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw error;
    }
};

/**
 * Creates and configures a single, centralized Axios instance for the entire application.
 *
 * By using a single instance, we can apply global configurations like interceptors
 * to handle JWT authentication and error responses automatically for every API call.
 */
/**
 * Resolve API base URL from environment.
 * - In production (Vercel), set VITE_API_BASE_URL to your backend origin, e.g. https://api.example.com
 * - In development, leave it undefined to use relative "/api" paths and Vite's proxy.
 */
const ENV_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL as string | undefined;
let API_BASE_URL = ENV_BASE ? ENV_BASE.replace(/\/+$/, '') : '';

// Safety fallback: if running on Vercel and no env provided, default to Render backend
if (!API_BASE_URL && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.endsWith('.vercel.app')) {
        API_BASE_URL = 'https://alesqui-intelligence-backend.onrender.com';
        // Optional: console.info('Using default Render backend for Vercel domain');
    }
}

const apiClient: AxiosInstance = axios.create({
    /**
     * The base URL for all API requests.
     *
     * If not provided, Axios will use relative URLs (e.g., "/api/..."), which
     * allows Vite's dev proxy to handle requests locally. In production, provide
     * VITE_API_BASE_URL to target the deployed backend.
     */
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

/**
 * Request Interceptor
 *
 * This function is executed before any request is sent from the application.
 * Its purpose is to check for an access token in localStorage and, if it exists,
 * automatically attach it to the 'Authorization' header as a Bearer token.
 * This ensures that every authenticated request includes the necessary JWT.
 */
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // Attach the token to the Authorization header.
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Handle request errors.
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 *
 * Handles global error responses, particularly 401 Unauthorized errors.
 * When a 401 is received, automatically attempts to refresh the access token
 * and retry the original request. Includes race condition handling to prevent
 * multiple simultaneous refresh attempts.
 */
apiClient.interceptors.response.use(
    (response) => {
        // Any status code within the range of 2xx causes this function to trigger.
        return response;
    },
    async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Check if this is a 401 error and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Prevent infinite loops on the refresh endpoint itself
            if (originalRequest.url?.includes('/api/auth/refresh')) {
                return Promise.reject(error);
            }

            // If a refresh is already in progress, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // Mark this request as retried to prevent infinite loops
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh the access token
                const newAccessToken = await refreshAccessToken();
                
                // Process all queued requests with the new token
                processQueue(null, newAccessToken);
                
                // Update the original request with the new token
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                
                // Retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed - reject all queued requests
                processQueue(refreshError, null);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // For all other errors, just reject
        return Promise.reject(error);
    }
);

export default apiClient;