import React, { useState } from 'react';
import PaidHeader from '../../../components/PaidHeader';
import Sidebar from '../components/Sidebar';
import Tickets from './Tickets';
import CalendarInvite from './CalendarInvite';
import ReWork from './ReWork';
import usePaidGuard from '../../../hooks/usePaidGuard';
import './Dashboard.css';

const AgentDashboard = () => {
  const [currentTab, setCurrentTab] = useState('tickets');
  usePaidGuard('AGENT');

  return (
    <div className="qm-dashboard-layout">
      <PaidHeader title="Agent Workspace" />

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
