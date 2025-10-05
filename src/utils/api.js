// API utility functions for authenticated requests

export const createAuthHeaders = (token) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const makeAuthenticatedRequest = async (url, options = {}, token) => {
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
  
  const response = await fetch(url, config);
  
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);
  
  if (!response.ok) {
    let errorData = {};
    try {
      // Try to parse JSON error response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      }
    } catch (e) {
      // If JSON parsing fails, use status text
      errorData = { message: response.statusText };
    }
    console.error('API Error:', errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response;
};

// Specific API functions
export const fetchRecipes = async (token) => {
  const response = await makeAuthenticatedRequest(
    'http://localhost:3002/recipes',
    { method: 'GET' },
    token
  );
  return response.json();
};

export const fetchOrders = async (token) => {
  const response = await makeAuthenticatedRequest(
    'http://localhost:3002/pos/orders',
    { method: 'GET' },
    token
  );
  return response.json();
};

export const createOrder = async (orderData, token) => {
  const response = await makeAuthenticatedRequest(
    'http://localhost:3002/pos/orders',
    {
      method: 'POST',
      body: JSON.stringify(orderData),
    },
    token
  );
  return response.json();
};

export const createRecipe = async (recipeData, token) => {
  const response = await makeAuthenticatedRequest(
    'http://localhost:3002/recipes',
    {
      method: 'POST',
      body: JSON.stringify(recipeData),
    },
    token
  );
  return response.json();
};

export const updateRecipe = async (recipeId, recipeData, token) => {
  const response = await makeAuthenticatedRequest(
    `http://localhost:3002/recipes/${recipeId}`,
    {
      method: 'PUT',
      body: JSON.stringify(recipeData),
    },
    token
  );
  return response.json();
};

export const deleteRecipe = async (recipeId, token) => {
  const response = await makeAuthenticatedRequest(
    `http://localhost:3002/recipes/${recipeId}`,
    {
      method: 'DELETE',
    },
    token
  );
  
  // Handle 204 No Content response for successful deletion
  if (response.status === 204) {
    return { success: true, message: 'Recipe deleted successfully' };
  }
  
  // For other responses, try to parse JSON
  return response.json();
};

export const loginUser = async (credentials) => {
  const response = await fetch('http://localhost:3002/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  
  return response.json();
};

export const registerUser = async (userData) => {
  const response = await fetch('http://localhost:3002/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    let errorMessage = 'Registration failed';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};
