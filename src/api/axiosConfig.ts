import axios, { AxiosInstance } from 'axios';

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
const API_BASE_URL = ENV_BASE ? ENV_BASE.replace(/\/+$/, '') : '';

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
 * This function is executed after a response is received from the API.
 * It's the ideal place to implement logic for handling global errors.
 *
 * For example, this is where you would handle a 401 Unauthorized error,
 * which typically means the access token has expired. In a future step,
 * you could add logic here to use the 'refreshToken' to silently request a new
 * 'accessToken' and then retry the original failed request.
 */
apiClient.interceptors.response.use(
    (response) => {
        // Any status code within the range of 2xx causes this function to trigger.
        return response;
    },
    async (error) => {
        // Any status codes that fall outside the range of 2xx cause this function to trigger.
        console.error("API call error:", error);
        
        // FUTURE: Add refresh token logic here.
        // const originalRequest = error.config;
        // if (error.response.status === 401 && !originalRequest._retry) {
        //   originalRequest._retry = true;
        //   // ... call refresh token endpoint ...
        //   return apiClient(originalRequest);
        // }

        return Promise.reject(error);
    }
);

export default apiClient;