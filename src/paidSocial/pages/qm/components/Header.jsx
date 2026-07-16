import React, { useState } from 'react'; // Added useState
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom'; // 1. Added navigation hook import
import { Bell, LogOut, User, ChevronDown } from 'lucide-react'; // Added ChevronDown icon
import './Header.css';

const Header = ({ title = 'Ticket Management System', user = {}, onLogout, notificationCount = 0 }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown open state

  // Get current active role from localStorage to sync the dropdown display value
  const currentRole = localStorage.getItem('userRole') || 'Queue Manager';

  // 2. Added handler to instantly switch roles and update localStorage sessions
  const handleRoleChange = (newRole) => {
    localStorage.setItem('userRole', newRole);
    
    switch (newRole) {
      case 'Queue Manager':
        navigate('/paid/qm');
        break;
      case 'Agent':
        navigate('/paid/agent'); // Adjust if your routing path differs
        break;
      case 'Quality Checker':
        navigate('/paid/qc');    // Adjust if your routing path differs
        break;
      default:
        navigate('/');
    }
  };

  return (
    <header className="qm-header">
      <div className="header-left">
        <div className="qm-logo">
          PAIDSOCIAL
        </div>
        <div className="header-divider" />
        <h1 className="dashboard-title">{title}</h1>
      </div>

      <div className="header-right">
        <button
          className="icon-button notification-btn"
          aria-label="View notifications"
        >
          <Bell size={18} />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </button>

        {/* 1. Profile Dropdown Wrapper */}
        <div 
          className="user-profile-container"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="user-profile">
            <User size={16} className="profile-avatar" />
            <span className="profile-name">{user.name || 'User'}</span>
            <ChevronDown size={14} className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} />
          </div>

          {isDropdownOpen && (
            <div className="profile-dropdown-menu">
              <div 
                className={`dropdown-item ${currentRole === 'Queue Manager' ? 'active' : ''}`}
                onClick={() => handleRoleChange('Queue Manager')}
              >
                QM Dashboard
              </div>
              <div 
                className={`dropdown-item ${currentRole === 'Agent' ? 'active' : ''}`}
                onClick={() => handleRoleChange('Agent')}
              >
                Agent Dashboard
              </div>
              <div 
                className={`dropdown-item ${currentRole === 'Quality Checker' ? 'active' : ''}`}
                onClick={() => handleRoleChange('Quality Checker')}
              >
                QC Dashboard
              </div>
            </div>
          )}
        </div>

        <button 
          className="icon-button logout-btn" 
          onClick={() => {
            // 1. Wipe out local storage sessions so you don't get auto-redirected back
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
            
            // 2. Fire the original parent component logout trigger if it exists
            if (onLogout) onLogout();
            
            // 3. Jump clean out back to the login root screen
            navigate('/paid/login');
          }} 
          aria-label="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  user: PropTypes.shape({
    name: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
  notificationCount: PropTypes.number,
};

export default Header;