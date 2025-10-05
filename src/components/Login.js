import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../utils/api';
import { Eye, EyeOff, Mail, Lock, Shield, Users } from 'lucide-react';
import '../styles/login.css';

const Login = ({ onRegister }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    role: 'employee',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.usernameOrEmail || !formData.password) {
      setError('Please enter both username/email and password.');
      setLoading(false);
      return;
    }

    try {
      // API call to authenticate user
      const userData = await loginUser({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password
      });
      
              // Login user in context with token
              // Handle roles array from backend (e.g., ["ROLE_ADMIN"] -> "admin")
              console.log('Login response userData:', userData);
              console.log('Roles array:', userData.roles);
              
              let userRole = 'employee'; // default
              if (userData.roles && userData.roles.length > 0) {
                const role = userData.roles[0];
                console.log('First role:', role);
                if (role === 'ROLE_ADMIN') {
                  userRole = 'admin';
                } else if (role === 'ROLE_EMPLOYEE') {
                  userRole = 'employee';
                }
              } else if (userData.role) {
                userRole = userData.role;
              }
              
              console.log('Final userRole:', userRole);
              
              login({
                id: userData.id || userData.userId,
                username: userData.username,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                role: userRole
              }, userData.token || userData.accessToken);
      
      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/'); // Admin goes to Dish Library (dashboard)
      } else {
        navigate('/pos'); // Employee goes to POS
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glassmorphism-container">
      <div className="glassmorphism-card">
        <div className="glassmorphism-header">
          <h1>LOGIN</h1>
        </div>

        <form onSubmit={handleSubmit} className="glassmorphism-form">
          <div className="glassmorphism-input-group">
            <label htmlFor="usernameOrEmail">Username or Email</label>
            <div className="glassmorphism-input-container">
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleInputChange}
                placeholder="Enter username or email"
                required
                className="glassmorphism-input"
              />
              <Mail size={20} className="glassmorphism-input-icon" />
            </div>
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="password">Password</label>
            <div className="glassmorphism-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                className="glassmorphism-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="glassmorphism-password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="glassmorphism-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="glassmorphism-checkbox"
              />
              <label htmlFor="rememberMe">Remember Me</label>
            </div>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>

          

          {error && (
            <div className="glassmorphism-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="glassmorphism-button"
          >
            {loading ? 'Signing In...' : 'LOGIN'}
          </button>
        </form>

        <div className="glassmorphism-footer">
          <p>Don't have an Account? <span onClick={onRegister} className="register-link">Register</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
