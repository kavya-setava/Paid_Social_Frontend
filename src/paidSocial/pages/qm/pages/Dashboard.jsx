import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Tickets from './Tickets';
import CalendarInvite from './CalendarInvite';
import Rework from './Rework'; 
import './Dashboard.css';

const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState('tickets');
  const [user] = useState({ name: 'Divya Kaveti'});

  const handleLogout = () => {
    console.log('Clearing session auth tokens safely...');
    // window.location.href = '/login';
  };

  return (
    <div className="qm-dashboard-layout">
      <Header 
        title="QM Dashboard" 
        user={user} 
        notificationCount={3} 
        onLogout={handleLogout} 
      />
      
      <div className="dashboard-body">
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
        
        <main className="dashboard-content-area">
          {currentTab === 'tickets' && <Tickets />}
          {currentTab === 'rework' && <Rework />}
          {currentTab === 'calendar' && <CalendarInvite />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;