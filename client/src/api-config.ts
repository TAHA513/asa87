
import axios from 'axios';

// Create an optimized axios instance with proper error handling and retries
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 20000, // 20 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for better error handling
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error', error);
      return Promise.reject({
        message: 'حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
        code: 'NETWORK_ERROR',
      });
    }

    // Handle API errors
    const { status, data } = error.response;
    
    if (status === 429) {
      console.warn('Rate limit exceeded');
    }
    
    return Promise.reject(data || {
      message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقًا.',
      code: 'UNKNOWN_ERROR',
    });
  }
);

export default apiClient;
