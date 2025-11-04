import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserCircleIcon, 
  CogIcon, 
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            NOURISH
          </Link>

          <nav className="nav-desktop">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/foods" className="nav-link">My Foods</Link>
            <Link to="/meals" className="nav-link">Saved Meals</Link>
            <Link to="/progress" className="nav-link">Progress</Link>
          </nav>

          <div className="header-actions">
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <UserCircleIcon className="icon" />
                <span className="user-name">{user?.name}</span>
              </button>

              {profileMenuOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    <UserCircleIcon className="icon-sm" />
                    Profile
                  </Link>
                  <Link to="/settings" className="dropdown-item">
                    <CogIcon className="icon-sm" />
                    Settings
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    <ArrowRightOnRectangleIcon className="icon-sm" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? 
                <XMarkIcon className="icon" /> : 
                <Bars3Icon className="icon" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="nav-mobile">
            <Link to="/" className="nav-link-mobile">Dashboard</Link>
            <Link to="/foods" className="nav-link-mobile">My Foods</Link>
            <Link to="/meals" className="nav-link-mobile">Saved Meals</Link>
            <Link to="/progress" className="nav-link-mobile">Progress</Link>
            <Link to="/profile" className="nav-link-mobile">Profile</Link>
            <Link to="/settings" className="nav-link-mobile">Settings</Link>
            <button onClick={handleLogout} className="nav-link-mobile">
              Sign Out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;