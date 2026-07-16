import React from 'react';
import PropTypes from 'prop-types';
import { Bell, LogOut, User } from 'lucide-react';
import './Header.css';

const Header = ({ title = 'Ticket Management System', user = {}, onLogout, notificationCount = 0 }) => {
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

        <div className="user-profile">
          <User size={16} className="profile-avatar" />
          <span className="profile-name">{user.name || 'User'}</span>
        </div>

        <button 
          className="icon-button logout-btn" 
          onClick={onLogout} 
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