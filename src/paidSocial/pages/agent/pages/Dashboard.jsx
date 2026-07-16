import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Tickets from './Tickets';
import CalendarInvite from './CalendarInvite';
import ReWork from './ReWork';
import './Dashboard.css';

const AgentDashboard = () => {
  const [currentTab, setCurrentTab] = useState('tickets');
  const [user] = useState({ name: 'Agent User' });

  const handleLogout = () => {
    console.log('Clearing session auth tokens safely...');
    // window.location.href = '/login';
  };

  return (
    <div className="qm-dashboard-layout">
      <Header
        title="Agent Workspace"
        user={user}
        notificationCount={0}
        onLogout={handleLogout}
      />

      <div className="dashboard-body">
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

        <main className="dashboard-content-area">
          {currentTab === 'tickets' && <Tickets />}
          {currentTab === 'calendar' && <CalendarInvite />}
          {currentTab === 'rework' && <ReWork />}

        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
