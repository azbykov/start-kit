import axios, { AxiosInstance, AxiosError } from "axios";

/**
 * Axios instance configured with base URL and error handling
 *
 * Usage:
 *   import { api } from '@/lib/api';
 *   const response = await api.get('/endpoint');
 *   const data = await api.post('/endpoint', payload);
 */
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Allow browser/axios to set correct Content-Type for FormData (multipart boundary).
    // If Content-Type is forced to application/json, Next.js request.formData() will fail.
    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData &&
      config.headers
    ) {
      // Axios headers can be a plain object or AxiosHeaders.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headers: any = config.headers as any;
      delete headers["Content-Type"];
      delete headers["content-type"];
    }

    if (process.env.NODE_ENV === "development") {
      console.debug("API request:", config.method, config.url);
    }
    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("API request error:", error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (process.env.NODE_ENV === "development") {
      if (error.response) {
        // Server responded with error status
        console.error("API error response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          url: error.config?.url,
        });
      } else if (error.request) {
        // Request made but no response received
        console.error("API request timeout:", error.config?.url);
      } else {
        // Error setting up request
        console.error("API request setup error:", error.message);
      }
    }

    // Return user-friendly error message
    return Promise.reject(
      error.response?.data || {
        message: "An error occurred. Please try again.",
      }
    );
  }
);

export { api };
export default api;
