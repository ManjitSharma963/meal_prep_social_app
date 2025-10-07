/**
 * Comprehensive API error handling with retry logic and user-friendly messages
 */

import React from 'react';

// Error types and their corresponding user messages
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection and try again.',
  [ERROR_TYPES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ERROR_TYPES.SERVER_ERROR]: 'Server error occurred. Please try again later.',
  [ERROR_TYPES.CLIENT_ERROR]: 'Invalid request. Please check your input and try again.',
  [ERROR_TYPES.AUTHENTICATION_ERROR]: 'Authentication failed. Please log in again.',
  [ERROR_TYPES.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action.',
  [ERROR_TYPES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_TYPES.NOT_FOUND_ERROR]: 'The requested resource was not found.',
  [ERROR_TYPES.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment and try again.',
  [ERROR_TYPES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
};

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableErrors: [
    ERROR_TYPES.NETWORK_ERROR,
    ERROR_TYPES.TIMEOUT_ERROR,
    ERROR_TYPES.SERVER_ERROR,
    ERROR_TYPES.RATE_LIMIT_ERROR
  ]
};

/**
 * Classify error type based on response status and error details
 */
export const classifyError = (error, response = null) => {
  // Network errors (no response)
  if (!response) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return ERROR_TYPES.NETWORK_ERROR;
    }
    if (error.name === 'AbortError') {
      return ERROR_TYPES.TIMEOUT_ERROR;
    }
    return ERROR_TYPES.NETWORK_ERROR;
  }

  const status = response.status;

  // 4xx Client errors
  if (status >= 400 && status < 500) {
    switch (status) {
      case 401:
        return ERROR_TYPES.AUTHENTICATION_ERROR;
      case 403:
        return ERROR_TYPES.AUTHORIZATION_ERROR;
      case 404:
        return ERROR_TYPES.NOT_FOUND_ERROR;
      case 422:
        return ERROR_TYPES.VALIDATION_ERROR;
      case 429:
        return ERROR_TYPES.RATE_LIMIT_ERROR;
      default:
        return ERROR_TYPES.CLIENT_ERROR;
    }
  }

  // 5xx Server errors
  if (status >= 500) {
    return ERROR_TYPES.SERVER_ERROR;
  }

  return ERROR_TYPES.UNKNOWN_ERROR;
};

/**
 * Extract error message from response or error object
 */
export const extractErrorMessage = (error, response = null) => {
  // Try to get message from response body
  if (response && response.body) {
    try {
      const errorData = JSON.parse(response.body);
      return errorData.message || errorData.error || errorData.detail;
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // Try to get message from error object
  if (error.message) {
    return error.message;
  }

  // Fallback to status text
  if (response && response.statusText) {
    return response.statusText;
  }

  return 'An unknown error occurred';
};

/**
 * Calculate retry delay with exponential backoff
 */
export const calculateRetryDelay = (attempt) => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.maxDelay);
};

/**
 * Check if an error is retryable
 */
export const isRetryableError = (errorType) => {
  return RETRY_CONFIG.retryableErrors.includes(errorType);
};

/**
 * Enhanced error object with additional context
 */
export class APIError extends Error {
  constructor(message, errorType, status, response, originalError) {
    super(message);
    this.name = 'APIError';
    this.errorType = errorType;
    this.status = status;
    this.response = response;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    this.retryable = isRetryableError(errorType);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errorType: this.errorType,
      status: this.status,
      timestamp: this.timestamp,
      retryable: this.retryable
    };
  }
}

/**
 * Create a standardized API error
 */
export const createAPIError = (error, response = null) => {
  const errorType = classifyError(error, response);
  const message = extractErrorMessage(error, response);
  const userMessage = ERROR_MESSAGES[errorType];
  const status = response ? response.status : null;

  return new APIError(
    userMessage,
    errorType,
    status,
    response,
    error
  );
};

/**
 * Retry function with exponential backoff
 */
export const withRetry = async (apiCall, options = {}) => {
  const {
    maxRetries = RETRY_CONFIG.maxRetries,
    baseDelay = RETRY_CONFIG.baseDelay,
    maxDelay = RETRY_CONFIG.maxDelay
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      lastError = error;

      // Don't retry on the last attempt
      if (attempt > maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(error.errorType)) {
        break;
      }

      // Calculate delay and wait
      const delay = calculateRetryDelay(attempt);
      console.log(`Retrying API call in ${delay}ms (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Enhanced fetch with timeout and error handling
 */
export const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    
    throw error;
  }
};

/**
 * Enhanced API request with comprehensive error handling
 */
export const makeAPIRequest = async (url, options = {}, retryOptions = {}) => {
  const enhancedOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const apiCall = async () => {
    try {
      const response = await fetchWithTimeout(url, enhancedOptions);
      return response;
    } catch (error) {
      const apiError = createAPIError(error, error.response);
      throw apiError;
    }
  };

  if (retryOptions.retry !== false) {
    return withRetry(apiCall, retryOptions);
  } else {
    return apiCall();
  }
};

/**
 * Handle API errors with user notifications
 */
export const handleAPIError = (error, showNotification = true) => {
  console.error('API Error:', error);

  if (showNotification) {
    // You can integrate with your notification system here
    // For now, we'll use a simple alert
    alert(error.message);
  }

  return error;
};

/**
 * Global error handler for unhandled API errors
 */
export const setupGlobalErrorHandler = () => {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof APIError) {
      console.error('Unhandled API Error:', event.reason);
      handleAPIError(event.reason);
    }
  });
};

/**
 * Error boundary component for React
 */
export const withErrorBoundary = (Component, fallbackComponent = null) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error Boundary caught an error:', error, errorInfo);
      
      if (error instanceof APIError) {
        handleAPIError(error);
      }
    }

    render() {
      if (this.state.hasError) {
        if (fallbackComponent) {
          return fallbackComponent(this.state.error);
        }
        
        return (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <p>An error occurred while loading this component.</p>
            <button onClick={() => this.setState({ hasError: false, error: null })}>
              Try again
            </button>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
};

/**
 * Utility to check if an error is an API error
 */
export const isAPIError = (error) => {
  return error instanceof APIError;
};

/**
 * Utility to get user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (isAPIError(error)) {
    return error.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR];
};

export default {
  ERROR_TYPES,
  ERROR_MESSAGES,
  RETRY_CONFIG,
  classifyError,
  extractErrorMessage,
  calculateRetryDelay,
  isRetryableError,
  APIError,
  createAPIError,
  withRetry,
  fetchWithTimeout,
  makeAPIRequest,
  handleAPIError,
  setupGlobalErrorHandler,
  withErrorBoundary,
  isAPIError,
  getErrorMessage
};
