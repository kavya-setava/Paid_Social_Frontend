import React from 'react';
import PropTypes from 'prop-types';
import { STATUS } from '../../../utils/tickets';

// Renders the agent's work actions for a ticket, gated by its live status
// (see PaidSocial-API-Docs.md §4):
//   RTT / REJECTED (mine)   -> Start
//   REJECTED (bucket)       -> Pick   (mode="bucket")
//   IN_PROGRESS             -> Hold, Submit to QC
//   ON_HOLD (mine)          -> Resume
const StatusActionCell = ({ ticket, mode = 'mine', busy = false, onStart, onHold, onResume, onSubmit, onPick }) => {
  const status = ticket._raw?.status || ticket.status;
  const id = ticket.id;

  if (mode === 'bucket' && status === STATUS.REJECTED) {
    return (
      <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => onPick(id)}>
        Pick
      </button>
    );
  }

  if (status === STATUS.RTT || status === STATUS.REJECTED) {
    return (
      <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => onStart(id)}>
        Start
      </button>
    );
  }

  if (status === STATUS.IN_PROGRESS) {
    return (
      <div className="action-group">
        <button type="button" className="action-btn action-btn-secondary" disabled={busy} onClick={() => onHold(id)}>
          Hold
        </button>
        <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => onSubmit(id)}>
          Submit to QC
        </button>
      </div>
    );
  }

  if (status === STATUS.ON_HOLD) {
    return (
      <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => onResume(id)}>
        Resume
      </button>
    );
  }

  return <span className="action-note">—</span>;
};

StatusActionCell.propTypes = {
  ticket: PropTypes.object.isRequired,
  mode: PropTypes.oneOf(['mine', 'bucket']),
  busy: PropTypes.bool,
  onStart: PropTypes.func,
  onHold: PropTypes.func,
  onResume: PropTypes.func,
  onSubmit: PropTypes.func,
  onPick: PropTypes.func,
};

export default StatusActionCell;
