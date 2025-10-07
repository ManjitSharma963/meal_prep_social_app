// API utility functions for authenticated requests
import { 
  makeAPIRequest, 
  handleAPIError, 
  createAPIError, 
  ERROR_TYPES,
  fetchWithTimeout 
} from './apiErrorHandler';

export const createAuthHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const makeAuthenticatedRequest = async (url, options = {}, token, retryOptions = {}) => {
  const headers = createAuthHeaders(token);
  
  console.log('Making authenticated request to:', url);
  console.log('Headers being sent:', headers);
  console.log('Token available:', !!token);
  
  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  try {
    const response = await makeAPIRequest(url, config, retryOptions);
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw handleAPIError(error, false); // Don't show notification here, let components handle it
  }
};

// Specific API functions
export const fetchRecipes = async (token, retryOptions = { retry: true, maxRetries: 2 }) => {
  const response = await makeAuthenticatedRequest(
    'http://localhost:3002/recipes',
    { method: 'GET' },
    token,
    retryOptions
  );
  return response.json();
};

export const fetchOrders = async (token, retryOptions = { retry: true, maxRetries: 2 }) => {
  const response = await makeAuthenticatedRequest(
    'http://localhost:3002/pos/orders',
    { method: 'GET' },
    token,
    retryOptions
  );
  return response.json();
};

export const createOrder = async (orderData, token, retryOptions = { retry: true, maxRetries: 3 }) => {
  const response = await makeAuthenticatedRequest(
    'http://localhost:3002/pos/orders',
    {
      method: 'POST',
      body: JSON.stringify(orderData),
    },
    token,
    retryOptions
  );
  return response.json();
};

export const createRecipe = async (recipeData, token, retryOptions = { retry: true, maxRetries: 3 }) => {
  const response = await makeAuthenticatedRequest(
    'http://localhost:3002/recipes',
    {
      method: 'POST',
      body: JSON.stringify(recipeData),
    },
    token,
    retryOptions
  );
  return response.json();
};

export const updateRecipe = async (recipeId, recipeData, token, retryOptions = { retry: true, maxRetries: 3 }) => {
  const response = await makeAuthenticatedRequest(
    `http://localhost:3002/recipes/${recipeId}`,
    {
      method: 'PUT',
      body: JSON.stringify(recipeData),
    },
    token,
    retryOptions
  );
  return response.json();
};

export const deleteRecipe = async (recipeId, token, retryOptions = { retry: true, maxRetries: 2 }) => {
  const response = await makeAuthenticatedRequest(
    `http://localhost:3002/recipes/${recipeId}`,
    {
      method: 'DELETE',
    },
    token,
    retryOptions
  );
  
  // Handle 204 No Content response for successful deletion
  if (response.status === 204) {
    return { success: true, message: 'Recipe deleted successfully' };
  }
  
  // For other responses, try to parse JSON
  return response.json();
};

export const loginUser = async (credentials, retryOptions = { retry: true, maxRetries: 2 }) => {
  try {
    const response = await makeAPIRequest(
      'http://localhost:3002/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      retryOptions
    );
    return response.json();
  } catch (error) {
    throw handleAPIError(error, false);
  }
};

export const registerUser = async (userData, retryOptions = { retry: true, maxRetries: 2 }) => {
  try {
    const response = await makeAPIRequest(
      'http://localhost:3002/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      retryOptions
    );
    return response.json();
  } catch (error) {
    throw handleAPIError(error, false);
  }
};
