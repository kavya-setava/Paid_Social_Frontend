import React from 'react';
import PropTypes from 'prop-types';
import './StatusCards.css';

// Different status configurations for different tabs
const STATUS_TYPES_ALL = [
    { key: 'all', label: 'All', color: '#64748b' },
    { key: 'readyToQc', label: 'Ready to QC', color: '#8b5cf6' },
    { key: 'inQc', label: 'In QC', color: '#ec4899' },
    { key: 'onHold', label: 'On Hold', color: '#6b7280' },
    { key: 'rejected', label: 'Rejected', color: '#dc2626' },
    { key: 'trafficked', label: 'Trafficked', color: '#10b981' },
];

const STATUS_TYPES_MY_DASHBOARD = [
    { key: 'readyToQc', label: 'Ready to QC', color: '#8b5cf6' },
    { key: 'inQc', label: 'In QC', color: '#ec4899' },
    { key: 'onHold', label: 'On Hold', color: '#6b7280' },
    { key: 'rejected', label: 'Rejected', color: '#dc2626' },
    { key: 'trafficked', label: 'Trafficked', color: '#10b981' },
];

const StatusCards = ({
    counts = {},
    activeStatus = 'all',
    onStatusSelect,
    tabType = 'all' // 'all' or 'myDashboard'
}) => {
    const statusTypes = tabType === 'all' ? STATUS_TYPES_ALL : STATUS_TYPES_MY_DASHBOARD;

    return (
        <div className="status-cards-container">
            {statusTypes.map((status) => {
                const count = counts[status.key] ?? 0;
                const isActive = activeStatus === status.key;

                return (
                    <div
                        key={status.key}
                        className={`status-card ${isActive ? 'active' : ''}`}
                        onClick={() => onStatusSelect(status.key)}
                        style={{ '--accent-color': status.color }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') onStatusSelect(status.key); }}
                    >
                        <div className="status-info">
                            <span className="status-label">{status.label}</span>
                            <span className="status-count">{count}</span>
                        </div>
                        <div className="status-indicator-bar" />
                    </div>
                );
            })}
        </div>
    );
};

StatusCards.propTypes = {
    counts: PropTypes.objectOf(PropTypes.number),
    activeStatus: PropTypes.string,
    onStatusSelect: PropTypes.func.isRequired,
    tabType: PropTypes.oneOf(['all', 'myDashboard']),
};

export default StatusCards;