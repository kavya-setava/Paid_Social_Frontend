import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LayoutDashboard, User, Calendar } from 'lucide-react';
import socket from '../../../../socket';
import { qcApi } from '../../../api/paidSocialApi';
import './Sidebar.css';

const Sidebar = ({ currentTab, onTabChange }) => {
    // ALL → unclaimed Ready-to-QC pool; My Dashboard → my not-started (claimed).
    const [poolCount, setPoolCount] = useState(0);
    const [myNotStarted, setMyNotStarted] = useState(0);
    useEffect(() => {
        let t;
        const load = () => {
            qcApi.getPool({ limit: 1 }).then((r) => setPoolCount(r?.total || 0)).catch(() => {});
            qcApi.getMyTickets({ status: 'READY_TO_QC', limit: 1 })
                .then((r) => setMyNotStarted(r?.total || 0)).catch(() => {});
        };
        load();
        const onEvt = () => { clearTimeout(t); t = setTimeout(load, 700); };
        socket.on('PAID_TICKET_EVENT', onEvt);
        return () => { clearTimeout(t); socket.off('PAID_TICKET_EVENT', onEvt); };
    }, []);

    const menuItems = [
        { id: 'all', label: 'ALL', icon: <LayoutDashboard size={18} />, badge: poolCount },
        { id: 'myDashboard', label: 'My Dashboard', icon: <User size={18} />, badge: myNotStarted },
        { id: 'ci', label: 'CI', icon: <Calendar size={18} /> },
    ];

    return (
        <aside className="qc-sidebar">
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
