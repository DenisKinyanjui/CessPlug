import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 
    // 'https://vinskyshopping-3acfd0c66868.herokuapp.com/api' ||
      'https://vinskyshopping-server.onrender.com/api'
    : 'http://localhost:5000/api';


const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 200000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Create a user-friendly error object
    const enhancedError: any = {
      message: 'An unexpected error occurred',
      type: 'unknown',
      originalError: error,
    };

    // Handle different error scenarios
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      // Timeout error
      enhancedError.type = 'timeout';
      enhancedError.message = 'Please check your internet connection or try again later.';
      
      console.error('Timeout Error:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
      });

    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      // Network error (server unreachable)
      enhancedError.type = 'network';
      
      if (process.env.NODE_ENV === 'production') {
        enhancedError.message = 
          'Unable to connect to the server. ' +
          'Please check your internet connection and try again.';
      } else {
        enhancedError.message = 
          'Cannot connect to the development server. ' +
          'Make sure the backend server is running';
      }
      
      console.error('Network Error:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: error.message,
      });

    } else if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data: any = error.response.data;

      enhancedError.status = status;
      enhancedError.type = 'server';

      switch (status) {
        case 400:
          enhancedError.message = data?.message || 'Bad request. Please check your input.';
          break;

        case 401:
          enhancedError.message = data?.message || 'Unauthorized. Please login again.';
          // Handle token cleanup
          if (error.config?.url?.includes('/admin/')) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
          break;

        case 403:
          enhancedError.message = data?.message || 'Access denied. You don\'t have permission.';
          break;

        case 404:
          enhancedError.message = data?.message || 'Resource not found.';
          break;

        case 409:
          enhancedError.message = data?.message || 'Conflict. Resource already exists.';
          break;

        case 422:
          enhancedError.message = data?.message || 'Validation error. Please check your input.';
          break;

        case 429:
          enhancedError.message = 'Too many requests. Please try again later.';
          break;

        case 500:
          enhancedError.message = 
            data?.message || 
            'Internal server error. Please try again later or contact support.';
          break;

        case 502:
          enhancedError.message = 'Bad gateway. The server is temporarily unavailable.';
          break;

        case 503:
          enhancedError.message = 'Service unavailable. Please try again later.';
          break;

        case 504:
          enhancedError.message = 'Gateway timeout. The server is not responding.';
          break;

        default:
          enhancedError.message = 
            data?.message || 
            `Server error (${status}). Please try again.`;
      }

      console.error(`Server Error (${status}):`, {
        url: error.config?.url,
        method: error.config?.method,
        status,
        message: data?.message,
      });

    } else if (error.request) {
      // Request was made but no response received
      enhancedError.type = 'no_response';
      enhancedError.message = 
        'No response from server. Please check your connection.';
      
      console.error('📡 No Response:', {
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    // Attach enhanced error to the original error object
    error.message = enhancedError.message;
    (error as any).enhancedError = enhancedError;

    return Promise.reject(error);
  }
);

// Optional: Add a retry mechanism for failed requests
export const retryRequest = async (
  requestFn: () => Promise<any>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error: any) {
      const isLastAttempt = i === maxRetries - 1;
      const isRetryable = 
        error.code === 'ECONNABORTED' || 
        error.code === 'ERR_NETWORK' ||
        error.response?.status >= 500;

      if (isLastAttempt || !isRetryable) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      console.log(`🔄 Retrying request (${i + 1}/${maxRetries})...`);
    }
  }
};

// Helper function to check if server is reachable
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    await axiosInstance.get('/health', { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

// Helper to get user-friendly error message
export const getErrorMessage = (error: any): string => {
  if (error?.enhancedError?.message) {
    return error.enhancedError.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default axiosInstance;