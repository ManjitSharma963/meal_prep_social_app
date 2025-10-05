import { useEffect, useRef, useCallback } from 'react';
import { isTokenExpired, validateTokenWithAPI } from '../utils/tokenUtils';

/**
 * Custom hook to handle token expiration checking
 * @param {string} token - Current JWT token
 * @param {function} onTokenExpired - Callback function when token expires
 * @param {number} checkInterval - Check interval in milliseconds (default: 5 minutes)
 */
export const useTokenExpiration = (token, onTokenExpired, checkInterval = 5 * 60 * 1000) => {
  const intervalRef = useRef(null);
  const isCheckingRef = useRef(false);

  const checkTokenExpiration = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) return;
    
    isCheckingRef.current = true;
    
    try {
      console.log('Checking token expiration...', { token: token ? 'present' : 'missing' });
      
      // First check if token is expired locally
      if (isTokenExpired(token)) {
        console.log('Token is expired locally, logging out...');
        onTokenExpired();
        return;
      }
      
      // If token seems valid locally, validate with API
      console.log('Token appears valid locally, validating with API...');
      const isValid = await validateTokenWithAPI(token);
      if (!isValid) {
        console.log('Token validation failed with API, logging out...');
        onTokenExpired();
        return;
      }
      
      console.log('Token is valid');
    } catch (error) {
      console.error('Error checking token expiration:', error);
      // On error, assume token is invalid and logout
      onTokenExpired();
    } finally {
      isCheckingRef.current = false;
    }
  }, [token, onTokenExpired]);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only start checking if we have a token
    if (token) {
      console.log('Starting token expiration check every', checkInterval / 1000, 'seconds');
      
      // Check immediately
      checkTokenExpiration();
      
      // Set up interval for periodic checking
      intervalRef.current = setInterval(checkTokenExpiration, checkInterval);
    }

    // Cleanup on unmount or token change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [token, checkTokenExpiration, checkInterval]);

  // Return function to manually check token
  return { checkTokenExpiration };
};
