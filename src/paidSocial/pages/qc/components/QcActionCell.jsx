import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { STATUS } from '../../../utils/tickets';

const ERROR_TAGS = ['COPY', 'DESIGN', 'LEGAL', 'TARGETING', 'OTHER'];

// QC work actions gated by live status (PaidSocial-API-Docs.md §4/§8):
//   READY_TO_QC  -> Pick
//   IN_QC        -> Hold, Approve, Reject (reject requires feedback)
//   ON_HOLD      -> Resume
const QcActionCell = ({ ticket, busy = false, onPick, onApprove, onReject, onHold, onResume }) => {
  const status = ticket._raw?.status || ticket.status;
  const id = ticket.id;

  const [rejecting, setRejecting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [tags, setTags] = useState([]);

  const toggleTag = (t) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const confirmReject = () => {
    if (!feedback.trim()) return;
    onReject(id, feedback.trim(), tags);
    setRejecting(false);
    setFeedback('');
    setTags([]);
  };

  if (status === STATUS.READY_TO_QC) {
    return (
      <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => onPick(id)}>
        Pick
      </button>
    );
  }

  if (status === STATUS.ON_HOLD) {
    return (
      <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => onResume(id)}>
        Resume
      </button>
    );
  }

  if (status === STATUS.IN_QC) {
    if (rejecting) {
      return (
        <div className="action-group qc-reject-group">
          <textarea
            className="rejection-input"
            placeholder="Rejection feedback (required)…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="qc-tag-row">
            {ERROR_TAGS.map((t) => (
              <label key={t} className={`qc-tag ${tags.includes(t) ? 'on' : ''}`}>
                <input type="checkbox" checked={tags.includes(t)} onChange={() => toggleTag(t)} />
                {t}
              </label>
            ))}
          </div>
          <div className="action-group">
            <button
              type="button"
              className="action-btn action-btn-primary"
              disabled={busy || !feedback.trim()}
              onClick={confirmReject}
            >
              Confirm reject
            </button>
            <button type="button" className="action-btn action-btn-secondary" onClick={() => setRejecting(false)}>
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="action-group">
        <button type="button" className="action-btn action-btn-secondary" disabled={busy} onClick={() => onHold(id)}>
          Hold
        </button>
        <button type="button" className="action-btn action-btn-approve" disabled={busy} onClick={() => onApprove(id)}>
          Approve
        </button>
        <button type="button" className="action-btn action-btn-reject" disabled={busy} onClick={() => setRejecting(true)}>
          Reject
        </button>
      </div>
    );
  }

  return <span className="action-note">—</span>;
};

QcActionCell.propTypes = {
  ticket: PropTypes.object.isRequired,
  busy: PropTypes.bool,
  onPick: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  onHold: PropTypes.func,
  onResume: PropTypes.func,
};

export default QcActionCell;
