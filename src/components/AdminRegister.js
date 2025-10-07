import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { registerUser } from '../utils/api';
import { Eye, EyeOff, User, Lock, Mail, Building, ArrowLeft, Phone, MapPin, Globe } from 'lucide-react';
import { 
  validateUsername, 
  validateEmail, 
  validatePassword, 
  validateName, 
  validatePhone,
  validateBusinessName,
  validateBusinessDescription,
  validateBusinessType,
  validateBusinessAddress,
  validateBusinessPhone,
  validateBusinessEmail,
  validateBusinessWebsite,
  validateForm as validateFormUtil
} from '../utils/validation';
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
    switch (name) {
      case 'username':
        return validateUsername(value);
      case 'email':
        return validateEmail(value);
      case 'firstName':
        return validateName(value, 'First name');
      case 'lastName':
        return validateName(value, 'Last name');
      case 'phoneNumber':
      case 'businessPhone':
        return validatePhone(value);
      case 'businessName':
        return validateBusinessName(value);
      case 'businessDescription':
        return validateBusinessDescription(value);
      case 'businessType':
        return validateBusinessType(value);
      case 'businessAddress':
        return validateBusinessAddress(value);
      case 'businessEmail':
        return validateBusinessEmail(value);
      case 'businessWebsite':
        return validateBusinessWebsite(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        if (value !== formData.password) {
          return ['Passwords do not match'];
        }
        return [];
      default:
        return [];
    }
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
    const fieldErrors = validateField(name, sanitizedValue);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldErrors.length > 0 ? fieldErrors[0] : ''
    }));
  };

  const validateForm = () => {
    // Define validation rules for all fields
    const validationRules = {
      username: validateUsername,
      email: validateEmail,
      firstName: (value) => validateName(value, 'First name'),
      lastName: (value) => validateName(value, 'Last name'),
      phoneNumber: validatePhone,
      businessName: validateBusinessName,
      businessDescription: validateBusinessDescription,
      businessAddress: validateBusinessAddress,
      businessPhone: validateBusinessPhone,
      businessEmail: validateBusinessEmail,
      businessWebsite: validateBusinessWebsite,
      password: validatePassword,
      confirmPassword: (value) => value !== formData.password ? ['Passwords do not match'] : []
    };
    
    // Validate all fields
    const { errors, hasErrors } = validateFormUtil(formData, validationRules);
    
    // Check user type
    if (!formData.userType) {
      setError('Please select a user type');
      return false;
    }
    
    // Update field errors state
    setFieldErrors(errors);
    
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
