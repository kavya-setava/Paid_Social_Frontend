import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTicketAlt, FaUsers, FaChartLine, FaBars, FaTimes, FaChevronLeft } from 'react-icons/fa';
import { MdOutlineDashboard } from 'react-icons/md';

const globalFont =
  "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";

const Sidebar = ({ onToggle }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load state from localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isHovered, setIsHovered] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  // ✅ role name
  const roleName = currentUser?.role?.name;

  // ✅ Dynamic tickets route
  const getTicketsPath = () => {
    switch (roleName) {
      case 'QM':
        return '/qm';

      case 'AGENT':
        return '/agent';

      case 'QA':
        return '/qa';

      default:
        return '/login';
    }
  };

  // ✅ Default menu
  const menuItems = [
    {
      label: 'Tickets',
      path: getTicketsPath(),
      icon: FaTicketAlt,
    },
  ];

  // ✅ Show Agents tab only if NOT AGENT or QA
  if (!['AGENT', 'QA'].includes(roleName)) {
    menuItems.push({
      label: 'Agents',
      path: '/agents',
      icon: FaUsers,
    });
  }
  
  if (roleName === 'QM') {
    menuItems.push({
      label: 'Analysis',
      path: '/analysis',
      icon: FaChartLine,
    });
  }

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    // Save to localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    
    // Dispatch custom event for DashboardLayout
    const event = new CustomEvent('sidebarToggle', { detail: { isCollapsed: newState } });
    window.dispatchEvent(event);
    
    // Call onToggle callback if provided
    if (onToggle) {
      onToggle(newState);
    }
  };

  // Save state to localStorage and notify when changed
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    
    // Dispatch event for any listeners
    const event = new CustomEvent('sidebarToggle', { detail: { isCollapsed: isCollapsed } });
    window.dispatchEvent(event);
    
    if (onToggle) {
      onToggle(isCollapsed);
    }
  }, [isCollapsed, onToggle]);

  // Calculate actual width (for hover expansion)
  const getSidebarWidth = () => {
    if (!isCollapsed) return '240px';
    if (isHovered) return '240px';
    return '72px';
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          left: isCollapsed && !isHovered ? '82px' : '250px',
          top: '20px',
          zIndex: 1001,
          background: '#E50914',
          border: 'none',
          borderRadius: '10px',
          color: '#fff',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s',
          width: '36px',
          height: '36px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isCollapsed && !isHovered ? <FaBars size={18} /> : <FaChevronLeft size={18} style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />}
      </button>

      {/* Sidebar */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: getSidebarWidth(),
          height: '100vh',
          background: '#141414',
          color: '#fff',
          padding: isCollapsed && !isHovered ? '24px 8px' : '24px 16px',
          position: 'fixed',
          left: 0,
          top: 0,
          overflow: 'hidden',
          boxSizing: 'border-box',
          fontFamily: globalFont,
          borderRight: '1px solid #2a2a2a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease',
          zIndex: 1000,
          boxShadow: '2px 0 12px rgba(0,0,0,0.5)',
        }}
      >
        {/* TOP SECTION */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: (isCollapsed && !isHovered) ? 'center' : 'flex-start',
              gap: (isCollapsed && !isHovered) ? '0' : '8px',
              marginBottom: '32px',
              transition: 'all 0.3s ease',
            }}
          >
            <MdOutlineDashboard size={28} color="#E50914" />
            {(!isCollapsed || isHovered) && (
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  fontFamily: globalFont,
                  letterSpacing: '-0.02em',
                  color: '#E50914',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                Dashboard
              </h2>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  style={{
                    textDecoration: 'none',
                    padding: (isCollapsed && !isHovered) ? '12px 0' : '12px 16px',
                    borderRadius: '10px',
                    background: isActive
                      ? '#E50914'
                      : 'transparent',
                    color: '#fff',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    fontFamily: globalFont,
                    fontSize: '14px',
                    letterSpacing: '0.01em',
                    border: isActive
                      ? '1px solid #E50914'
                      : '1px solid transparent',
                    boxShadow: isActive
                      ? '0 0 15px rgba(229,9,20,0.35)'
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: (isCollapsed && !isHovered) ? 'center' : 'flex-start',
                    gap: (isCollapsed && !isHovered) ? '0' : '12px',
                    whiteSpace: 'nowrap',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#222222';
                    }
                    if (isCollapsed && !isHovered) {
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                    if (isCollapsed && !isHovered) {
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                  title={(isCollapsed && !isHovered) ? item.label : ''}
                >
                  <IconComponent 
                    size={20} 
                    color={isActive ? '#fff' : '#9CA3AF'}
                  />
                  {(!isCollapsed || isHovered) && (
                    <span style={{
                      animation: 'fadeIn 0.2s ease',
                    }}>{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* BOTTOM LOGO */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '10px',
            transition: 'all 0.3s ease',
          }}
        >
          <img
            src="/Netflix_Sidebar_Logo.jpg"
            alt="Sidebar Logo"
            style={{
              width: (isCollapsed && !isHovered) ? '40px' : '100%',
              maxWidth: (isCollapsed && !isHovered) ? '40px' : '200px',
              objectFit: 'contain',
              opacity: 0.9,
              transition: 'all 0.3s ease',
              borderRadius: (isCollapsed && !isHovered) ? '50%' : '8px',
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x80?text=Logo';
            }}
          />
        </div>
      </div>

      {/* Add animation keyframes */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        /* Smooth scrollbar for sidebar if needed */
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1f1f1f;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #E50914;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #ff1a2a;
        }
      `}</style>
    </>
  );
};

export default Sidebar;