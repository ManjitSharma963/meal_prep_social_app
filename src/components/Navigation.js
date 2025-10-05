import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Users, ShoppingCart, BarChart3, Package, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  // Admin navigation items
  const adminNavItems = [
    { path: '/', label: 'Dish Library', icon: Home },
    { path: '/pos', label: 'POS System', icon: ShoppingCart },
    { path: '/sales-reports', label: 'Sales Reports', icon: BarChart3 },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/staff-management', label: 'Staff Management', icon: Users },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  // Employee navigation items (only POS)
  const employeeNavItems = [
    { path: '/pos', label: 'POS System', icon: ShoppingCart },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const navItems = isAdmin() ? adminNavItems : employeeNavItems;

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Meal Prep</h2>
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {(user.firstName || user.name || user.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.name || user.username || 'User'
                }
              </div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        )}
      </div>
      <ul className="sidebar-nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <li key={path} className="sidebar-item">
            <Link
              to={path}
              className={`sidebar-link ${location.pathname === path ? 'active' : ''}`}
            >
              <div className="sidebar-icon">
                <Icon size={24} />
              </div>
              <span className="sidebar-label">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
      {user && (
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-button">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
