import React from 'react';
import PropTypes from 'prop-types';
import { Ticket, Calendar } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ currentTab, onTabChange }) => {
  const menuItems = [
    { id: 'tickets', label: 'Tickets', icon: <Ticket size={18} /> },
    { id: 'calendar', label: 'Calendar Invite', icon: <Calendar size={18} /> },
  ];

  return (
    <aside className="qm-sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

Sidebar.propTypes = {
  currentTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default Sidebar;