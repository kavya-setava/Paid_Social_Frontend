import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Ticket, Calendar } from 'lucide-react';
import socket from '../../../../socket';
import { agentApi } from '../../../api/paidSocialApi';
import './Sidebar.css';

const Sidebar = ({ currentTab, onTabChange }) => {
  // Not-started (assigned but not begun) count → badge on "Tickets".
  const [notStarted, setNotStarted] = useState(0);
  useEffect(() => {
    let t;
    const load = () =>
      agentApi.getCounts().then((r) => setNotStarted(r?.counts?.rttAssigned || 0)).catch(() => {});
    load();
    const onEvt = () => { clearTimeout(t); t = setTimeout(load, 700); };
    socket.on('PAID_TICKET_EVENT', onEvt);
    return () => { clearTimeout(t); socket.off('PAID_TICKET_EVENT', onEvt); };
  }, []);

  const menuItems = [
    { id: 'tickets', label: 'Tickets', icon: <Ticket size={18} />, badge: notStarted },
    { id: 'rework', label: 'ReWork', icon: <Calendar size={18} /> },
    { id: 'calendar', label: 'Calendar Invite', icon: <Ticket size={18} /> },
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
              {item.badge > 0 && <span className="sidebar-badge">{item.badge}</span>}
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
