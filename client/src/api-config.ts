
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
// API Configuration with built-in resilience
import axios from 'axios';

// Create an axios instance with optimized settings
export const api = axios.create({
  baseURL: '/api',
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  },
  // Don't throw on HTTP errors - handle in response interceptor
  validateStatus: () => true
});

// Retry configuration for resilience
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000, // 1 second base delay
  RETRY_STATUSES: [408, 429, 500, 502, 503, 504, 0] // 0 for network errors
};

// Request tracking for circuit breaking
let consecutiveErrors = 0;
let circuitOpen = false;
let circuitResetTimeout = null;

// Reset the circuit after some time
const resetCircuit = () => {
  circuitOpen = false;
  consecutiveErrors = 0;
  if (circuitResetTimeout) {
    clearTimeout(circuitResetTimeout);
    circuitResetTimeout = null;
  }
};

// Open the circuit when too many errors occur
const openCircuit = () => {
  circuitOpen = true;
  // Reset circuit after 30 seconds
  circuitResetTimeout = setTimeout(resetCircuit, 30000);
};

// Request interceptor for circuit breaking
api.interceptors.request.use(
  config => {
    // Check if circuit is open and this isn't a health check
    if (circuitOpen && !config.url?.includes('/health')) {
      throw new Error('Circuit is open - too many API errors');
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for retries and circuit breaking
api.interceptors.response.use(
  response => {
    // Reset consecutive errors on success
    if (response.status >= 200 && response.status < 300) {
      consecutiveErrors = 0;
    }
    return response;
  },
  async error => {
    // Get original request config
    const originalRequest = error.config;
    
    // Initialize retry count if it doesn't exist
    if (originalRequest && typeof originalRequest._retry === 'undefined') {
      originalRequest._retry = 0;
    }

    // Get response status (0 means network error)
    const status = error.response ? error.response.status : 0;
    
    // Check if we should retry this request
    if (
      originalRequest &&
      originalRequest._retry < RETRY_CONFIG.MAX_RETRIES &&
      RETRY_CONFIG.RETRY_STATUSES.includes(status)
    ) {
      // Increment retry count
      originalRequest._retry++;
      
      // Calculate delay with exponential backoff
      const delay = RETRY_CONFIG.RETRY_DELAY_BASE * Math.pow(2, originalRequest._retry - 1);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return api(originalRequest);
    }
    
    // Track failed requests for circuit breaking
    consecutiveErrors++;
    
    // If too many consecutive errors, open the circuit
    if (consecutiveErrors >= 5) {
      openCircuit();
    }
    
    // Pass the error along to the caller
    return Promise.reject(error);
  }
);

// Export default API instance
export default api;
