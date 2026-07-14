import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Tickets from './Tickets';
import CalendarInvite from './CalendarInvite';
import './Dashboard.css';

const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState('tickets');
  const [user] = useState({ name: 'Alexander Pierce' });

  const handleLogout = () => {
    console.log('Clearing session auth tokens safely...');
    // window.location.href = '/login';
  };

  return (
    <div className="qm-dashboard-layout">
      <Header 
        title="QM Control Center" 
        user={user} 
        notificationCount={3} 
        onLogout={handleLogout} 
      />
      
      <div className="dashboard-body">
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
        
        <main className="dashboard-content-area">
          {currentTab === 'tickets' && <Tickets />}
          {currentTab === 'calendar' && <CalendarInvite />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;