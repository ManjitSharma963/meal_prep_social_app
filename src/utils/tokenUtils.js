// Token utility functions for JWT handling

/**
 * Decode JWT token without verification (client-side only)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    
    const decoded = decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    
    // Add 1 minute buffer to prevent edge cases (reduced from 5 minutes)
    const bufferTime = 1 * 60; // 1 minute in seconds
    
    const isExpired = currentTime >= (expirationTime - bufferTime);
    
    // Debug logging
    console.log('Token expiration check:', {
      currentTime: new Date(currentTime * 1000).toLocaleString(),
      expirationTime: new Date(expirationTime * 1000).toLocaleString(),
      timeUntilExpiration: Math.floor((expirationTime - currentTime) / 60),
      isExpired
    });
    
    return isExpired;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get token expiration time in milliseconds
 * @param {string} token - JWT token
 * @returns {number|null} - Expiration time in milliseconds or null if invalid
 */
export const getTokenExpirationTime = (token) => {
  try {
    if (!token) return null;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiration time:', error);
    return null;
  }
};

/**
 * Get time until token expires in milliseconds
 * @param {string} token - JWT token
 * @returns {number} - Time until expiration in milliseconds (0 if expired)
 */
export const getTimeUntilExpiration = (token) => {
  try {
    if (!token) return 0;
    
    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) return 0;
    
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    
    return Math.max(0, timeUntilExpiration);
  } catch (error) {
    console.error('Error getting time until expiration:', error);
    return 0;
  }
};

/**
 * Validate token by making a test API call
 * @param {string} token - JWT token
 * @returns {Promise<boolean>} - True if token is valid
 */
export const validateTokenWithAPI = async (token) => {
  try {
    if (!token) return false;
    
    const response = await fetch('http://localhost:3002/recipes/health', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error validating token with API:', error);
    return false;
  }
};

/**
 * Check if token needs refresh (expires within next 5 minutes)
 * @param {string} token - JWT token
 * @returns {boolean} - True if token needs refresh
 */
export const shouldRefreshToken = (token) => {
  try {
    if (!token) return false;
    
    const timeUntilExpiration = getTimeUntilExpiration(token);
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return timeUntilExpiration > 0 && timeUntilExpiration <= fiveMinutes;
  } catch (error) {
    console.error('Error checking if token should refresh:', error);
    return false;
  }
};
