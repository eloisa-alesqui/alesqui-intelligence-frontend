import axios, { AxiosInstance } from 'axios';

/**
 * Creates and configures a single, centralized Axios instance for the entire application.
 *
 * By using a single instance, we can apply global configurations like interceptors
 * to handle JWT authentication and error responses automatically for every API call.
 */
const apiClient: AxiosInstance = axios.create({
    /**
     * The base URL for all API requests.
     *
     * We explicitly set this to the backend server's address. This ensures that
     * all requests made through this client, including regular API calls and
     * file downloads, are sent directly to the correct server (localhost:8080),
     * bypassing the Vite development server's proxy. This is the most reliable
     * method to avoid host/port confusion.
     */
    baseURL: 'http://localhost:8080',
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