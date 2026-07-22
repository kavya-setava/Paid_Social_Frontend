import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { STATUS } from '../../../utils/tickets';

// Agent work actions, gated by live status (PaidSocial-API-Docs.md §4):
//   RTT / REJECTED (mine)   -> Start
//   REJECTED (bucket)       -> Pick   (mode="bucket")
//   IN_PROGRESS             -> Hold (with reason), Submit to QC (with note)
//   ON_HOLD (mine, agent)   -> Resume
const StatusActionCell = ({ ticket, mode = 'mine', busy = false, onStart, onHold, onResume, onSubmit, onPick }) => {
  const status = ticket._raw?.status || ticket.status;
  const holdReturn = ticket._raw?.holdReturnStatus;
  const id = ticket.id;

  const [panel, setPanel] = useState(null); // 'hold' | 'submit' | null
  const [text, setText] = useState('');

  const open = (which) => { setPanel(which); setText(''); };
  const cancel = () => { setPanel(null); setText(''); };

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
    if (panel === 'hold') {
      return (
        <div className="action-group qc-reject-group">
          <textarea
            className="rejection-input"
            placeholder="Reason for putting on hold (required)…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="action-group">
            <button type="button" className="action-btn action-btn-primary" disabled={busy || !text.trim()}
              onClick={() => { onHold(id, text.trim()); cancel(); }}>
              Confirm hold
            </button>
            <button type="button" className="action-btn action-btn-secondary" onClick={cancel}>Cancel</button>
          </div>
        </div>
      );
    }
    if (panel === 'submit') {
      return (
        <div className="action-group qc-reject-group">
          <textarea
            className="rejection-input"
            placeholder="Note for QC (required)…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="action-group">
            <button type="button" className="action-btn action-btn-primary" disabled={busy || !text.trim()}
              onClick={() => { onSubmit(id, text.trim()); cancel(); }}>
              Confirm submit
            </button>
            <button type="button" className="action-btn action-btn-secondary" onClick={cancel}>Cancel</button>
          </div>
        </div>
      );
    }
    return (
      <div className="action-group">
        <button type="button" className="action-btn action-btn-secondary" disabled={busy} onClick={() => open('hold')}>
          Hold
        </button>
        <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => open('submit')}>
          Submit to QC
        </button>
      </div>
    );
  }

  // Only the agent's own hold (returns to IN_PROGRESS) is resumable here.
  if (status === STATUS.ON_HOLD && holdReturn === 'IN_PROGRESS') {
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
