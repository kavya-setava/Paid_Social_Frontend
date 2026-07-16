import React, { useState } from 'react';
import PaidHeader from '../../../components/PaidHeader';
import Sidebar from '../components/Sidebar';
import All from './All';
import MyDashboard from './MyDashboard';
import CI from './CI';
import usePaidGuard from '../../../hooks/usePaidGuard';
import './Dashboard.css';

const Dashboard = () => {
    const [currentTab, setCurrentTab] = useState('all');
    usePaidGuard('QC');

    return (
        <div className="qc-dashboard-layout">
            <PaidHeader title="QC Dashboard" />

            <div className="dashboard-body">
                <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

                <main className="dashboard-content-area">
                    {currentTab === 'all' && <All />}
                    {currentTab === 'myDashboard' && <MyDashboard />}
                    {currentTab === 'ci' && <CI />}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
