import React from 'react';
import PropTypes from 'prop-types';
import './StatusCards.css';

const STATUS_TYPES = [
  { key: 'all', label: 'All', color: '#64748b' },
  { key: 'rttUnassigned', label: 'RTT (Unassigned)', color: '#ef4444' },
  { key: 'rttAssigned', label: 'RTT (Assigned)', color: '#f97316' },
  { key: 'inProgress', label: 'IN PROGRESS', color: '#3b82f6' },
  { key: 'onHold', label: 'ON HOLD', color: '#6b7280' },
  { key: 'qcOnHold', label: 'QC ON HOLD', color: '#a855f7' },
  { key: 'readyToQc', label: 'READY TO QC', color: '#8b5cf6' },
  { key: 'inQc', label: 'IN QC', color: '#ec4899' },
  // { key: 'rejected', label: 'Rejected', color: '#c22c2c' },
  { key: 'trafficked', label: 'TRAFFICKED', color: '#10b981' },
  { key: 'completed', label: 'COMPLETED', color: '#22c55e' },
  { key: 'rework', label: 'REWORK', color: '#c41a04' },
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