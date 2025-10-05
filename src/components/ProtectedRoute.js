import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, employeeOnly = false }) => {
  const { user, isAdmin, isEmployee, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  if (adminOnly && !isAdmin()) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>This page is only accessible to administrators.</p>
      </div>
    );
  }

  if (employeeOnly && !isEmployee()) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>This page is only accessible to employees.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
