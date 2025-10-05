import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './styles/index.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Login from './components/Login';
import AdminRegister from './components/AdminRegister';
import ProtectedRoute from './components/ProtectedRoute';
import DishLibrary from './components/DishLibrary';
import RecipeDetail from './components/RecipeDetail';
import UserProfile from './components/UserProfile';
import StaffManagement from './components/StaffManagement';
import POS from './components/POS';
import SalesReports from './components/SalesReports';
import InventoryManagement from './components/InventoryManagement';

// Token Expiration Handler Component
const TokenExpirationHandler = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Listen for token expiration and handle navigation
  useEffect(() => {
    if (user) {
      // Create a custom event listener for token expiration
      const handleTokenExpiration = () => {
        logout();
        navigate('/login');
      };

      // Listen for custom token expiration event
      window.addEventListener('tokenExpired', handleTokenExpiration);

      return () => {
        window.removeEventListener('tokenExpired', handleTokenExpiration);
      };
    }
  }, [user, logout, navigate]);

  return null; // This component doesn't render anything
};

// Main App Content Component
const AppContent = () => {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <AdminRegister onBack={() => setShowRegister(false)} />
    ) : (
      <Login onRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <div className="app-layout">
      <TokenExpirationHandler />
      <Navigation />
      <div className="app-content">
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute adminOnly={true}>
                <DishLibrary />
              </ProtectedRoute>
            } />
            <Route path="/recipe/:id" element={
              <ProtectedRoute adminOnly={true}>
                <RecipeDetail />
              </ProtectedRoute>
            } />
            <Route path="/pos" element={<POS />} />
            <Route path="/sales-reports" element={
              <ProtectedRoute adminOnly={true}>
                <SalesReports />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute adminOnly={true}>
                <InventoryManagement />
              </ProtectedRoute>
            } />
            <Route path="/staff-management" element={
              <ProtectedRoute adminOnly={true}>
                <StaffManagement />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
