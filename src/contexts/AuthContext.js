import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTokenExpiration } from '../hooks/useTokenExpiration';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      console.log('Loading saved session:', { 
        user: JSON.parse(savedUser), 
        token: savedToken.substring(0, 20) + '...' 
      });
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const register = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    console.log('Logging out user...');
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Navigation will be handled by the component that uses this context
  };

  // Handle token expiration
  const handleTokenExpiration = () => {
    console.log('Token has expired, logging out...');
    logout();
    // Dispatch custom event for navigation handling
    window.dispatchEvent(new CustomEvent('tokenExpired'));
  };

  // Use token expiration hook
  useTokenExpiration(token, handleTokenExpiration);

  const isAdmin = () => {
    if (!user) return false;
    
    console.log('isAdmin check - user:', user);
    console.log('isAdmin check - user.roles:', user.roles);
    console.log('isAdmin check - user.role:', user.role);
    
    // Handle roles array from backend
    if (user.roles && user.roles.length > 0) {
      const hasAdminRole = user.roles.includes('ROLE_ADMIN');
      console.log('isAdmin check - hasAdminRole:', hasAdminRole);
      return hasAdminRole;
    }
    
    // Handle single role string
    const isAdminRole = user.role === 'admin';
    console.log('isAdmin check - isAdminRole:', isAdminRole);
    return isAdminRole;
  };

  const isEmployee = () => {
    if (!user) return false;
    
    // Handle roles array from backend
    if (user.roles && user.roles.length > 0) {
      return user.roles.includes('ROLE_EMPLOYEE');
    }
    
    // Handle single role string
    return user.role === 'employee';
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAdmin,
    isEmployee,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
