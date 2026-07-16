import React, { useState } from 'react';
import PaidHeader from '../../../components/PaidHeader';
import Sidebar from '../components/Sidebar';
import Tickets from './Tickets';
import CalendarInvite from './CalendarInvite';
import Rework from './Rework';
import usePaidGuard from '../../../hooks/usePaidGuard';
import './Dashboard.css';

const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState('tickets');
  usePaidGuard('QM');

  return (
    <div className="qm-dashboard-layout">
      <PaidHeader title="QM Dashboard" />

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
