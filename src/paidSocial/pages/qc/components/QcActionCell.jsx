import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { STATUS } from '../../../utils/tickets';

// Mandatory rejection-type options (QC must pick one when rejecting).
export const REJECTION_TYPES = [
  'Incorrect ODP ID', 'Video (External)', 'Video (Internal)', 'Wrong Link',
  'Creative Name', 'Ad Headline', 'Ad Copy', 'CTA', 'Companion Banner',
  'Ad Name', 'Page Handle', 'Ad Tracking', 'Display URL', 'Comms',
];

// QC work actions, gated by live status + ownership.
const QcActionCell = ({ ticket, myId, busy = false, onPick, onStart, onApprove, onReject, onHold, onResume }) => {
  const status = ticket._raw?.status || ticket.status;
  const id = ticket.id;
  const mine = myId && ticket.qcId && String(ticket.qcId) === String(myId);

  const [panel, setPanel] = useState(null); // 'reject' | 'hold' | null
  const [text, setText] = useState('');
  const [rejType, setRejType] = useState('');
  const openPanel = (p) => { setPanel(p); setText(''); setRejType(''); };
  const closePanel = () => { setPanel(null); setText(''); setRejType(''); };

  const confirmReject = () => {
    if (!text.trim() || !rejType) return; // both mandatory
    onReject(id, text.trim(), rejType);
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
    if (panel === 'reject') {
      return (
        <div className="action-group qc-reject-group">
          <select className="rejection-input" value={rejType} onChange={(e) => setRejType(e.target.value)}>
            <option value="">Select rejection type…</option>
            {REJECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <textarea
            className="rejection-input"
            placeholder="Rejection comment (required)…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="action-group">
            <button
              type="button"
              className="action-btn action-btn-primary"
              disabled={busy || !text.trim() || !rejType}
              onClick={confirmReject}
            >
              Confirm reject
            </button>
            <button type="button" className="action-btn action-btn-secondary" onClick={closePanel}>Cancel</button>
          </div>
        </div>
      );
    }
    if (panel === 'hold') {
      return (
        <div className="action-group qc-reject-group">
          <textarea
            className="rejection-input"
            placeholder="Reason for hold (required)…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="action-group">
            <button type="button" className="action-btn action-btn-primary" disabled={busy || !text.trim()} onClick={confirmHold}>
              Confirm hold
            </button>
            <button type="button" className="action-btn action-btn-secondary" onClick={closePanel}>Cancel</button>
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
