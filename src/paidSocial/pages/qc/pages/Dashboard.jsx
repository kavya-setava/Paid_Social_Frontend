import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import All from './All';
import MyDashboard from './MyDashboard';
import CI from './CI';
import './Dashboard.css';

const Dashboard = () => {
    const [currentTab, setCurrentTab] = useState('all');
    const [user] = useState({ name: 'Alexander Pierce' });

    const handleLogout = () => {
        console.log('Clearing session auth tokens safely...');
        // window.location.href = '/login';
    };

    return (
        <div className="qc-dashboard-layout">
            <Header
                title="QC Dashboard"
                user={user}
                notificationCount={3}
                onLogout={handleLogout}
            />

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