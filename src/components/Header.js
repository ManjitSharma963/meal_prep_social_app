import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to home page with search query
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🍲</span>
          Meal Prep Social
        </div>
        
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="search-input-container">
            <Search 
              size={20} 
              className="search-icon" 
              onClick={handleSearchIconClick}
              style={{ cursor: 'pointer' }}
            />
            <input
              type="text"
              className="search-input"
              placeholder="Search dishes, ingredients, or recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
        
        <div className="user-actions">
          <button className="btn btn-primary">
            <User size={20} />
            Profile
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
