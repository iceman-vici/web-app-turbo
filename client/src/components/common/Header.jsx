import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="hamburger"></span>
          </button>
          <Link to="/" className="logo">
            <span className="logo-text">Web App Turbo</span>
          </Link>
        </div>

        <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/dashboard/analytics" className="nav-link">Analytics</Link>
          <Link to="/dashboard/reports" className="nav-link">Reports</Link>
          <Link to="/dashboard/users" className="nav-link">Users</Link>
        </nav>

        <div className="header-right">
          <button className="icon-btn">
            <span className="notification-badge">3</span>
            🔔
          </button>
          
          <div className="user-menu">
            <button 
              className="user-menu-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="user-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/dashboard/profile" className="dropdown-item">
                  Profile
                </Link>
                <Link to="/dashboard/settings" className="dropdown-item">
                  Settings
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={logout} className="dropdown-item">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;