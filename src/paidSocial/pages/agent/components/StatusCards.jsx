import React from 'react';
import PropTypes from 'prop-types';
import './StatusCards.css';

const STATUS_TYPES = [
  { key: 'all', label: 'All', color: '#64748b' },
  { key: 'rttAssigned', label: 'RTT (Assigned)', color: '#f97316' },
  { key: 'inProgress', label: 'In Progress', color: '#3b82f6' },
  { key: 'onHold', label: 'On Hold', color: '#6b7280' },
  { key: 'qcOnHold', label: 'QC On Hold', color: '#a855f7' },
  { key: 'readyToQc', label: 'Ready to QC', color: '#8b5cf6' },
  { key: 'inQc', label: 'In QC', color: '#eab308' },
  // { key: 'rejected', label: 'Rejected', color: '#dc2626' },
  { key: 'rework', label: 'Rework', color: '#ec4899' },
  { key: 'trafficked', label: 'Trafficked', color: '#10b981' },
  { key: 'completed', label: 'Completed', color: '#22c55e' },
];

const StatusCards = ({ counts = {}, activeStatus = 'all', onStatusSelect }) => {
  return (
    <div className="status-cards-container">
      {STATUS_TYPES.map((status) => {
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
};

export default StatusCards;