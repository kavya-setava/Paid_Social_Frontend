import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { STATUS, OPERATORS } from './mockTickets';

// Renders the quick-action control for a ticket's current status.
//   IN_PROGRESS -> "Pause" (-> ON_HOLD)
//   ON_HOLD     -> "Resume" (-> IN_PROGRESS)
//   REJECTED    -> "Continue working" (stays with the same operator), or
//                  "Reassign" to hand the ticket to another operator —
//                  reassigning sends the ticket back to RTT under the new
//                  operator's queue.
//   everything else (RTT, READY_TO_QC, IN_QC, TRAFFICKED) -> no action
const StatusActionCell = ({ ticket, onStatusChange, onOperatorChange }) => {
  const [reassignMode, setReassignMode] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState('');

  if (ticket.status === STATUS.IN_PROGRESS) {
    return (
      <button
        type="button"
        className="action-btn action-btn-secondary"
        onClick={() => onStatusChange(ticket.id, STATUS.ON_HOLD)}
      >
        Pause
      </button>
    );
  }

  if (ticket.status === STATUS.ON_HOLD) {
    return (
      <button
        type="button"
        className="action-btn action-btn-primary"
        onClick={() => onStatusChange(ticket.id, STATUS.IN_PROGRESS)}
      >
        Resume
      </button>
    );
  }

  if (ticket.status === STATUS.REJECTED) {
    if (!reassignMode) {
      return (
        <div className="action-group">
          <button
            type="button"
            className="action-btn action-btn-primary"
            onClick={() => onStatusChange(ticket.id, STATUS.IN_PROGRESS)}
          >
            Continue working
          </button>
          <button
            type="button"
            className="action-btn action-btn-secondary"
            onClick={() => setReassignMode(true)}
          >
            Reassign
          </button>
        </div>
      );
    }

    const otherOperators = OPERATORS.filter((name) => name !== ticket.operator);

    return (
      <div className="action-group">
        <select
          className="status-select"
          value={selectedOperator}
          onChange={(e) => setSelectedOperator(e.target.value)}
        >
          <option value="">Choose operator…</option>
          {otherOperators.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button
          type="button"
          className="action-btn action-btn-primary"
          disabled={!selectedOperator}
          onClick={() => {
            onOperatorChange(ticket.id, selectedOperator);
            onStatusChange(ticket.id, STATUS.RTT);
            setReassignMode(false);
            setSelectedOperator('');
          }}
        >
          Confirm
        </button>
        <button
          type="button"
          className="action-btn action-btn-secondary"
          onClick={() => setReassignMode(false)}
        >
          Cancel
        </button>
      </div>
    );
  }

  return <span className="action-note">—</span>;
};

StatusActionCell.propTypes = {
  ticket: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    status: PropTypes.string.isRequired,
    operator: PropTypes.string,
  }).isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onOperatorChange: PropTypes.func.isRequired,
};

export default StatusActionCell;