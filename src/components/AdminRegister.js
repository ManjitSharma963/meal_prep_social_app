import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { registerUser } from '../utils/api';
import { Eye, EyeOff, User, Lock, Mail, Building, ArrowLeft, Phone, MapPin, Globe } from 'lucide-react';
import '../styles/login.css';

const AdminRegister = ({ onBack }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    businessName: '',
    businessDescription: '',
    businessType: 'Restaurant',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    userType: 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const sanitizeInput = (value, type) => {
    switch (type) {
      case 'username':
        return value.replace(/[^a-zA-Z0-9_]/g, '');
      case 'name':
        return value.replace(/[^a-zA-Z\s'-]/g, '');
      case 'phone':
        return value.replace(/[^0-9\s\-\(\)\+]/g, '');
      case 'email':
        return value.trim();
      case 'url':
        return value.trim();
      case 'password':
        return value.replace(/[^A-Za-z\d@$!%*?&]/g, '');
      default:
        return value;
    }
  };

  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          errorMessage = 'Username is required';
        } else if (value.length < 3) {
          errorMessage = 'Username must be at least 3 characters long';
        } else if (value.length > 30) {
          errorMessage = 'Username must be less than 30 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errorMessage = 'Username can only contain letters, numbers, and underscores';
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          errorMessage = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = 'Please enter a valid email address';
        } else if (value.length > 100) {
          errorMessage = 'Email must be less than 100 characters';
        }
        break;
        
      case 'firstName':
        if (!value.trim()) {
          errorMessage = 'First name is required';
        } else if (value.length < 2) {
          errorMessage = 'First name must be at least 2 characters long';
        } else if (value.length > 30) {
          errorMessage = 'First name must be less than 30 characters';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          errorMessage = 'First name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;
        
      case 'lastName':
        if (!value.trim()) {
          errorMessage = 'Last name is required';
        } else if (value.length < 2) {
          errorMessage = 'Last name must be at least 2 characters long';
        } else if (value.length > 30) {
          errorMessage = 'Last name must be less than 30 characters';
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          errorMessage = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        }
        break;
        
      case 'phoneNumber':
      case 'businessPhone':
        if (!value.trim()) {
          errorMessage = 'Phone number is required';
        } else if (!/^[\+]?[0-9\s\-\(\)]{10,15}$/.test(value)) {
          errorMessage = 'Please enter a valid phone number (10-15 digits)';
        }
        break;
        
      case 'businessName':
        if (!value.trim()) {
          errorMessage = 'Business name is required';
        } else if (value.length < 2) {
          errorMessage = 'Business name must be at least 2 characters long';
        } else if (value.length > 100) {
          errorMessage = 'Business name must be less than 100 characters';
        }
        break;
        
      case 'businessDescription':
        if (!value.trim()) {
          errorMessage = 'Business description is required';
        } else if (value.length < 10) {
          errorMessage = 'Business description must be at least 10 characters long';
        } else if (value.length > 500) {
          errorMessage = 'Business description must be less than 500 characters';
        }
        break;
        
      case 'businessAddress':
        if (!value.trim()) {
          errorMessage = 'Business address is required';
        } else if (value.length < 10) {
          errorMessage = 'Business address must be at least 10 characters long';
        } else if (value.length > 200) {
          errorMessage = 'Business address must be less than 200 characters';
        }
        break;
        
      case 'businessEmail':
        if (!value.trim()) {
          errorMessage = 'Business email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = 'Please enter a valid business email address';
        } else if (value.length > 100) {
          errorMessage = 'Business email must be less than 100 characters';
        }
        break;
        
      case 'businessWebsite':
        if (value.trim() && !/^https?:\/\/.+/.test(value)) {
          errorMessage = 'Business website must start with http:// or https://';
        } else if (value.length > 200) {
          errorMessage = 'Business website must be less than 200 characters';
        }
        break;
        
      case 'password':
        if (value.length < 8) {
          errorMessage = 'Password must be at least 8 characters long';
        } else if (value.length > 128) {
          errorMessage = 'Password must be less than 128 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(value)) {
          errorMessage = 'Password must contain only letters, numbers, and special characters (@$!%*?&)';
        }
        break;
        
      case 'confirmPassword':
        if (value !== formData.password) {
          errorMessage = 'Passwords do not match';
        }
        break;
    }
    
    return errorMessage;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let sanitizedValue = value;
    
    // Apply sanitization based on field type
    if (name === 'username') {
      sanitizedValue = sanitizeInput(value, 'username');
    } else if (name === 'firstName' || name === 'lastName') {
      sanitizedValue = sanitizeInput(value, 'name');
    } else if (name === 'phoneNumber' || name === 'businessPhone') {
      sanitizedValue = sanitizeInput(value, 'phone');
    } else if (name === 'email' || name === 'businessEmail') {
      sanitizedValue = sanitizeInput(value, 'email');
    } else if (name === 'businessWebsite') {
      sanitizedValue = sanitizeInput(value, 'url');
    } else if (name === 'password' || name === 'confirmPassword') {
      sanitizedValue = sanitizeInput(value, 'password');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
    
    // Clear general error and validate individual field
    setError('');
    const fieldError = validateField(name, sanitizedValue);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateForm = () => {
    // Validate all fields and collect errors
    const newFieldErrors = {};
    let hasErrors = false;
    
    const fieldsToValidate = [
      'username', 'email', 'firstName', 'lastName', 'phoneNumber',
      'businessName', 'businessDescription', 'businessAddress', 
      'businessPhone', 'businessEmail', 'businessWebsite', 'password', 'confirmPassword'
    ];
    
    fieldsToValidate.forEach(fieldName => {
      const fieldError = validateField(fieldName, formData[fieldName]);
      if (fieldError) {
        newFieldErrors[fieldName] = fieldError;
        hasErrors = true;
      }
    });
    
    // Check user type
    if (!formData.userType) {
      setError('Please select a user type');
      return false;
    }
    
    // Update field errors state
    setFieldErrors(newFieldErrors);
    
    if (hasErrors) {
      setError('Please fix the errors below before submitting');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare user data for API
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        businessName: formData.businessName,
        businessDescription: formData.businessDescription,
        businessType: formData.businessType,
        businessAddress: formData.businessAddress,
        businessPhone: formData.businessPhone,
        businessEmail: formData.businessEmail,
        businessWebsite: formData.businessWebsite,
        userType: formData.userType,
        roles: ['admin'] // Set roles as expected by backend
      };
      
      console.log('Sending registration data:', userData);
      
      // API call to register user
      const response = await registerUser(userData);
      
      // Show success message and redirect to login
      setError(''); // Clear any previous errors
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
      `;
      successMessage.textContent = 'Registration successful! Please login with your credentials.';
      document.body.appendChild(successMessage);
      
      // Remove success message after 3 seconds and redirect
      setTimeout(() => {
        document.body.removeChild(successMessage);
        onBack(); // Go back to login page
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.message) {
        setError(`Registration failed: ${err.message}`);
      } else {
      setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper component for field error display
  const FieldError = ({ error }) => {
    if (!error) return null;
    return (
      <div className="glassmorphism-field-error">
        {error}
      </div>
    );
  };

  return (
    <div className="glassmorphism-container">
      <div className="glassmorphism-card">
        <div className="glassmorphism-header">
          <button onClick={onBack} className="glassmorphism-back-button">
            <ArrowLeft size={20} />
            Back to Login
          </button>
          <h1>REGISTER</h1>
        </div>

        <form onSubmit={handleSubmit} className="glassmorphism-form">
          <div className="glassmorphism-input-group">
            <label htmlFor="username">Username</label>
            <div className={`glassmorphism-input-container ${fieldErrors.username ? 'error' : ''}`}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                className={`glassmorphism-input ${fieldErrors.username ? 'error' : ''}`}
                maxLength="30"
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers, and underscores"
              />
              <User size={20} className="glassmorphism-input-icon" />
            </div>
            <FieldError error={fieldErrors.username} />
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="email">Email Address</label>
            <div className={`glassmorphism-input-container ${fieldErrors.email ? 'error' : ''}`}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={`glassmorphism-input ${fieldErrors.email ? 'error' : ''}`}
                maxLength="100"
              />
              <Mail size={20} className="glassmorphism-input-icon" />
            </div>
            <FieldError error={fieldErrors.email} />
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="firstName">First Name</label>
            <div className={`glassmorphism-input-container ${fieldErrors.firstName ? 'error' : ''}`}>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className={`glassmorphism-input ${fieldErrors.firstName ? 'error' : ''}`}
                maxLength="30"
                pattern="[a-zA-Z\s'-]+"
                title="First name can only contain letters, spaces, hyphens, and apostrophes"
              />
              <User size={20} className="glassmorphism-input-icon" />
            </div>
            <FieldError error={fieldErrors.firstName} />
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="lastName">Last Name</label>
            <div className={`glassmorphism-input-container ${fieldErrors.lastName ? 'error' : ''}`}>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                className={`glassmorphism-input ${fieldErrors.lastName ? 'error' : ''}`}
                maxLength="30"
                pattern="[a-zA-Z\s'-]+"
                title="Last name can only contain letters, spaces, hyphens, and apostrophes"
              />
              <User size={20} className="glassmorphism-input-icon" />
            </div>
            <FieldError error={fieldErrors.lastName} />
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <div className={`glassmorphism-input-container ${fieldErrors.phoneNumber ? 'error' : ''}`}>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className={`glassmorphism-input ${fieldErrors.phoneNumber ? 'error' : ''}`}
                maxLength="15"
                pattern="[\+]?[0-9\s\-\(\)]{10,15}"
                title="Phone number must be 10-15 digits"
              />
              <User size={20} className="glassmorphism-input-icon" />
            </div>
            <FieldError error={fieldErrors.phoneNumber} />
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="userType">User Type</label>
            <div className="glassmorphism-input-container">
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                className="glassmorphism-input"
              >
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
              <User size={20} className="glassmorphism-input-icon" />
            </div>
          </div>

          {/* Business Information Section */}
          <div className="glassmorphism-section-divider">
            <h3>Business Information</h3>
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="businessName">Business Name</label>
            <div className={`glassmorphism-input-container ${fieldErrors.businessName ? 'error' : ''}`}>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter business name"
                className={`glassmorphism-input ${fieldErrors.businessName ? 'error' : ''}`}
                maxLength="100"
              />
              <Building size={20} className="glassmorphism-input-icon" />
            </div>
            <FieldError error={fieldErrors.businessName} />
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="businessDescription">Business Description</label>
            <div className={`glassmorphism-input-container ${fieldErrors.businessDescription ? 'error' : ''}`}>
              <textarea
                id="businessDescription"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                placeholder="Describe your business"
                className={`glassmorphism-input glassmorphism-textarea ${fieldErrors.businessDescription ? 'error' : ''}`}
                rows="3"
                maxLength="500"
              />
              <Building size={20} className="glassmorphism-input-icon" />
            </div>
            <div className={`glassmorphism-char-counter ${
              formData.businessDescription.length > 450 ? 'error' : 
              formData.businessDescription.length > 400 ? 'warning' : ''
            }`}>
              {formData.businessDescription.length}/500 characters
            </div>
            <FieldError error={fieldErrors.businessDescription} />
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="businessType">Business Type</label>
            <div className="glassmorphism-input-container">
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="glassmorphism-input"
              >
                <option value="Restaurant">Restaurant</option>
                <option value="Catering">Catering</option>
                <option value="Food Truck">Food Truck</option>
                <option value="Meal Prep Service">Meal Prep Service</option>
                <option value="Other">Other</option>
              </select>
              <Building size={20} className="glassmorphism-input-icon" />
            </div>
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="businessAddress">Business Address</label>
            <div className={`glassmorphism-input-container ${fieldErrors.businessAddress ? 'error' : ''}`}>
              <input
                type="text"
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleInputChange}
                placeholder="Enter business address"
                className={`glassmorphism-input ${fieldErrors.businessAddress ? 'error' : ''}`}
                maxLength="200"
              />
              <MapPin size={20} className="glassmorphism-input-icon" />
            </div>
            <FieldError error={fieldErrors.businessAddress} />
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="businessPhone">Business Phone</label>
            <div className={`glassmorphism-input-container ${fieldErrors.businessPhone ? 'error' : ''}`}>
              <input
                type="tel"
                id="businessPhone"
                name="businessPhone"
                value={formData.businessPhone}
                onChange={handleInputChange}
                placeholder="Enter business phone number"
                className={`glassmorphism-input ${fieldErrors.businessPhone ? 'error' : ''}`}
                maxLength="15"
                pattern="[\+]?[0-9\s\-\(\)]{10,15}"
                title="Business phone number must be 10-15 digits"
              />
              <Phone size={20} className="glassmorphism-input-icon" />
            </div>
            <FieldError error={fieldErrors.businessPhone} />
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="businessEmail">Business Email</label>
            <div className={`glassmorphism-input-container ${fieldErrors.businessEmail ? 'error' : ''}`}>
              <input
                type="email"
                id="businessEmail"
                name="businessEmail"
                value={formData.businessEmail}
                onChange={handleInputChange}
                placeholder="Enter business email"
                className={`glassmorphism-input ${fieldErrors.businessEmail ? 'error' : ''}`}
                maxLength="100"
              />
              <Mail size={20} className="glassmorphism-input-icon" />
            </div>
            <FieldError error={fieldErrors.businessEmail} />
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="businessWebsite">Business Website</label>
            <div className={`glassmorphism-input-container ${fieldErrors.businessWebsite ? 'error' : ''}`}>
              <input
                type="url"
                id="businessWebsite"
                name="businessWebsite"
                value={formData.businessWebsite}
                onChange={handleInputChange}
                placeholder="https://your-website.com"
                className={`glassmorphism-input ${fieldErrors.businessWebsite ? 'error' : ''}`}
                maxLength="200"
                pattern="https?://.+"
                title="Website must start with http:// or https://"
              />
              <Globe size={20} className="glassmorphism-input-icon" />
            </div>
            <FieldError error={fieldErrors.businessWebsite} />
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="password">Password</label>
            <div className={`glassmorphism-input-container ${fieldErrors.password ? 'error' : ''}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                className={`glassmorphism-input ${fieldErrors.password ? 'error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="glassmorphism-password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <FieldError error={fieldErrors.password} />
            <div className="glassmorphism-password-hint">
              Password must contain: uppercase, lowercase, number, and special character (@$!%*?&)
            </div>
          </div>

          <div className="glassmorphism-input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className={`glassmorphism-input-container ${fieldErrors.confirmPassword ? 'error' : ''}`}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className={`glassmorphism-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="glassmorphism-password-toggle"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <FieldError error={fieldErrors.confirmPassword} />
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
            {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="glassmorphism-footer">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
