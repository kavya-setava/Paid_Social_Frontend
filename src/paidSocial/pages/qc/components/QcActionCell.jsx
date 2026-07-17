import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { STATUS } from '../../../utils/tickets';

// QC work actions, gated by live status + ownership (PaidSocial-API-Docs §8):
//   READY_TO_QC, unclaimed      -> Pick   (claim; stays READY_TO_QC)
//   READY_TO_QC, claimed by me  -> Start QC (READY_TO_QC → IN_QC, timer starts)
//   READY_TO_QC, claimed by other -> "Picked by <name>"
//   IN_QC (mine)                -> Hold, Approve, Reject (reject needs a comment)
//   ON_HOLD (mine, QC hold)     -> Resume
const QcActionCell = ({ ticket, myId, busy = false, onPick, onStart, onApprove, onReject, onHold, onResume }) => {
  const status = ticket._raw?.status || ticket.status;
  const id = ticket.id;
  const mine = myId && ticket.qcId && String(ticket.qcId) === String(myId);

  const [panel, setPanel] = useState(null); // 'reject' | 'hold' | null
  const [text, setText] = useState('');
  const openPanel = (p) => { setPanel(p); setText(''); };
  const closePanel = () => { setPanel(null); setText(''); };

  const confirmReject = () => {
    if (!text.trim()) return;
    onReject(id, text.trim());
    closePanel();
  };
  const confirmHold = () => {
    if (!text.trim()) return; // QC hold comment is required
    onHold(id, text.trim());
    closePanel();
  };

  if (status === STATUS.READY_TO_QC) {
    if (!ticket.qcId) {
      return (
        <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => onPick(id)}>
          Pick
        </button>
      );
    }
    if (mine) {
      return (
        <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => onStart(id)}>
          Start QC
        </button>
      );
    }
    return <span className="action-note">Picked by {ticket.qcName || 'another QC'}</span>;
  }

  if (status === STATUS.ON_HOLD) {
    // Only the QC who holds it (returns to IN_QC) may resume.
    if (mine && ticket._raw?.holdReturnStatus === 'IN_QC') {
      return (
        <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => onResume(id)}>
          Resume
        </button>
      );
    }
    return <span className="action-note">—</span>;
  }

  if (status === STATUS.IN_QC && mine) {
    if (panel === 'reject' || panel === 'hold') {
      const isReject = panel === 'reject';
      return (
        <div className="action-group qc-reject-group">
          <textarea
            className="rejection-input"
            placeholder={isReject ? 'Rejection comment (required)…' : 'Reason for hold (required)…'}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="action-group">
            <button
              type="button"
              className="action-btn action-btn-primary"
              disabled={busy || !text.trim()}
              onClick={isReject ? confirmReject : confirmHold}
            >
              {isReject ? 'Confirm reject' : 'Confirm hold'}
            </button>
            <button type="button" className="action-btn action-btn-secondary" onClick={closePanel}>
              Cancel
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="action-group">
        <button type="button" className="action-btn action-btn-secondary" disabled={busy} onClick={() => openPanel('hold')}>
          Hold
        </button>
        <button type="button" className="action-btn action-btn-approve" disabled={busy} onClick={() => onApprove(id)}>
          Approve
        </button>
        <button type="button" className="action-btn action-btn-reject" disabled={busy} onClick={() => openPanel('reject')}>
          Reject
        </button>
      </div>
    );
  }

  return <span className="action-note">—</span>;
};

QcActionCell.propTypes = {
  ticket: PropTypes.object.isRequired,
  myId: PropTypes.string,
  busy: PropTypes.bool,
  onPick: PropTypes.func,
  onStart: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onHold: PropTypes.func,
  onResume: PropTypes.func,
};

export default QcActionCell;
