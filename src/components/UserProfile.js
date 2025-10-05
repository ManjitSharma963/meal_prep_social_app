import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { registerUser } from '../utils/api';
import { Edit, Settings, Heart, BookOpen, Users, Award, Camera, Plus, X, UserPlus, Star, ArrowLeft, User, Mail, Lock } from 'lucide-react';
import '../styles/user-profile.css';

const UserProfile = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('recipes');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : 'John Doe',
    bio: 'Passionate home chef who loves experimenting with Indian and Continental cuisines. Always looking for new recipes to try!',
    location: 'Mumbai, India',
    joinDate: 'January 2024',
    avatar: user ? user.firstName?.charAt(0) + user.lastName?.charAt(0) : 'JD'
  });

  const [editProfile, setEditProfile] = useState(profile);
  
  // User management state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: 'sandeep',
    email: 'sandeep@gmail.com',
    firstName: 'Sandeep',
    lastName: 'Sharma',
    phoneNumber: '999441199',
    password: '',
    confirmPassword: '',
    userType: 'employee'
  });
  const [userError, setUserError] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  const tabs = [
      ...(isAdmin() ? [{ id: 'users', label: 'User Management', icon: UserPlus, count: 0 }] : [])
  ];

  const handleSaveProfile = () => {
    setProfile(editProfile);
    setIsEditing(false);
  };

  // User management functions
  const handleAddUser = () => {
    console.log('Add User button clicked, opening modal...');
    setShowAddUserModal(true);
    setUserError('');
    setNewUser({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      userType: 'employee'
    });
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
    setUserError('');
  };

  const validateUserForm = () => {
    if (!newUser.username.trim()) {
      setUserError('Username is required');
      return false;
    }
    if (!newUser.email.trim()) {
      setUserError('Email is required');
      return false;
    }
    if (!newUser.email.includes('@')) {
      setUserError('Please enter a valid email address');
      return false;
    }
    if (!newUser.firstName.trim()) {
      setUserError('First name is required');
      return false;
    }
    if (!newUser.lastName.trim()) {
      setUserError('Last name is required');
      return false;
    }
    if (!newUser.phoneNumber.trim()) {
      setUserError('Phone number is required');
      return false;
    }
    if (newUser.password.length < 6) {
      setUserError('Password must be at least 6 characters long');
      return false;
    }
    if (newUser.password !== newUser.confirmPassword) {
      setUserError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    
    if (!validateUserForm()) {
      return;
    }

    setUserLoading(true);
    setUserError('');

    try {
      // Use the correct API endpoint and data structure from the cURL command
      const response = await fetch('http://localhost:3002/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phoneNumber: newUser.phoneNumber,
          userType: newUser.userType === 'admin' ? 'Admin' : 'Employee' // Convert to proper case
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      
      // Show enhanced success message
      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        font-weight: 600;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        animation: slideInRight 0.4s ease-out;
        border: 1px solid rgba(255, 255, 255, 0.2);
      `;
      successMessage.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        User created successfully!
      `;
      document.body.appendChild(successMessage);
      
      // Add CSS animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `;
      document.head.appendChild(style);
      
      // Reset form
      setNewUser({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        userType: 'employee'
      });
      
      // Remove success message after 4 seconds and close modal
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
        setShowAddUserModal(false);
      }, 4000);
      
    } catch (err) {
      setUserError(err.message || 'Failed to create user. Please try again.');
    } finally {
      setUserLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">User Management</h3>
              <button
                onClick={handleAddUser}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add User
              </button>
          </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center text-gray-500 py-8">
                <UserPlus size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No users added yet</p>
                <p className="text-sm">Click "Add User" to create new user accounts</p>
                </div>
              </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="modern-profile">
      {/* Profile Header with Gradient Background */}
      <div className="profile-hero">
        <div className="profile-hero-bg"></div>
        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-container">
          <div className="profile-avatar">{profile.avatar}</div>
              <button className="avatar-edit-btn">
            <Camera size={16} />
          </button>
        </div>
            <div className="profile-info">
              <h1 className="profile-name">{profile.name}</h1>
              <p className="profile-role">Administrator</p>
              <p className="profile-bio">{profile.bio}</p>
              <div className="profile-meta">
                <span className="location">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {profile.location}
                </span>
                <span className="join-date">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                  Joined {profile.joinDate}
                </span>
          </div>
          </div>
        </div>
        </div>
      </div>

      {/* Stats Cards */}
      

      {/* Main Content Area */}
      <div className="profile-main">
        <div className="content-card">
          {/* Modern Tab Navigation */}
          <div className="modern-tabs">
            <div className="tab-list">
            {tabs.map(tab => (
              <button
                key={tab.id}
                  className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                  <div className="tab-icon">
                <tab.icon size={20} />
                  </div>
                  <span className="tab-label">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="tab-badge">{tab.count}</span>
                  )}
              </button>
            ))}
          </div>
        </div>
        
          {/* Tab Content */}
          <div className="tab-content">
          {renderContent()}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editProfile.name}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={editProfile.bio}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={editProfile.location}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                className="btn btn-secondary flex-1"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={handleSaveProfile}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Glassmorphism Popup Modal */}
      {showAddUserModal && (
  <div
    className="create-user-modal-overlay"
    onClick={(e) =>
      e.target === e.currentTarget && setShowAddUserModal(false)
    }
  >
    <div className="create-user-modal-card">
      {/* Header */}
      <div className="create-user-modal-header">
        <h1>Create New User</h1>
        <button
          onClick={() => setShowAddUserModal(false)}
          className="create-user-modal-close"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmitUser} className="create-user-modal-form">
        <div className="create-user-input-group">
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={newUser.firstName}
            onChange={handleUserInputChange}
            placeholder="Enter first name"
            required
          />
        </div>

        <div className="create-user-input-group">
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={newUser.lastName}
            onChange={handleUserInputChange}
            placeholder="Enter last name"
            required
          />
        </div>

        <div className="create-user-input-group">
          <input
            type="text"
            id="username"
            name="username"
            value={newUser.username}
            onChange={handleUserInputChange}
            placeholder="Enter username"
            required
          />
        </div>

        <div className="create-user-input-group">
          <input
            type="email"
            id="email"
            name="email"
            value={newUser.email}
            onChange={handleUserInputChange}
            placeholder="Enter email"
            required
          />
        </div>

        <div className="create-user-input-group">
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={newUser.phoneNumber}
            onChange={handleUserInputChange}
            placeholder="Enter phone number"
            required
          />
        </div>

        <div className="create-user-input-group">
          <select
            id="userType"
            name="userType"
            value={newUser.userType}
            onChange={handleUserInputChange}
            required
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="create-user-input-group">
          <input
            type="password"
            id="password"
            name="password"
            value={newUser.password}
            onChange={handleUserInputChange}
            placeholder="Enter password"
            required
          />
        </div>

        <div className="create-user-input-group">
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={newUser.confirmPassword}
            onChange={handleUserInputChange}
            placeholder="Confirm password"
            required
          />
        </div>

        {userError && <div className="create-user-error">{userError}</div>}

        <button
          type="submit"
          disabled={userLoading}
          className="create-user-submit"
        >
          {userLoading ? "Creating User..." : "Create User"}
        </button>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default UserProfile;
