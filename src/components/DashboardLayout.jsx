import React from 'react';

const DashboardLayout = ({ children }) => {
  return (
    <div
      style={{
        height:     '100vh',
        background: '#0a0a0a',
        overflow:   'hidden',
      }}
    >
      {/* ✅ NO Sidebar here - each dashboard has its own header/sidebar */}
      <div
        className="main-content-scroll"
        style={{
          height:     '100vh',
          overflowY:  'auto',
          overflowX:  'auto',
          backgroundColor: '#0a0a0a',
        }}
      >
        {children}
      </div>

      <style>{`
        .main-content-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .main-content-scroll::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }
        .main-content-scroll::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }
        .main-content-scroll::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
        .main-content-scroll {
          scrollbar-width: thin;
          scrollbar-color: #444 #1a1a1a;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;