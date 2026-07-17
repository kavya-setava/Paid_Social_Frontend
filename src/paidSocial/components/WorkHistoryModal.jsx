import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { X, Clock } from 'lucide-react';
import { ticketApi, errMessage } from '../api/paidSocialApi';
import { fmtDuration } from '../utils/tickets';
import './WorkHistoryModal.css';

// Popup that lists everyone who worked a ticket in a given role (AGENT | QC)
// with each person's individual hands-on time. Opened from the "i" icon on the
// QM board's Operator / QC'er columns. Data comes from GET /tickets/:id, whose
// workLog is populated with user names.
const WorkHistoryModal = ({ ticketId, role, title, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await ticketApi.getById(ticketId);
        if (!alive) return;
        const t = res?.data || {};
        const curId = role === 'AGENT' ? t.current?.agent?._id : t.current?.qc?._id;
        setCurrentId(curId ? String(curId) : null);

        const log = (t.workLog || [])
          .filter((w) => w.role === role)
          .map((w) => {
            const live = w.lastStartedAt
              ? Math.floor((Date.now() - new Date(w.lastStartedAt).getTime()) / 1000)
              : 0;
            return {
              id: String(w.user?._id || w.user || ''),
              name: w.user?.name || 'Unknown',
              email: w.user?.email || '',
              seconds: (w.seconds || 0) + Math.max(0, live),
              stints: w.stints || 0,
              running: !!w.lastStartedAt,
            };
          });
        // Current person first, then by most time.
        log.sort((a, b) => (a.id === curId ? -1 : b.id === curId ? 1 : b.seconds - a.seconds));
        setRows(log);
      } catch (err) {
        if (alive) setError(errMessage(err, 'Could not load history'));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [ticketId, role]);

  const totalSeconds = rows.reduce((s, r) => s + r.seconds, 0);

  return (
    <div className="wh-overlay" onClick={onClose}>
      <div className="wh-modal" onClick={(e) => e.stopPropagation()}>
        <div className="wh-header">
          <h3>{title}</h3>
          <button className="wh-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="wh-body">
          {loading ? (
            <div className="wh-empty">Loading…</div>
          ) : error ? (
            <div className="wh-empty wh-error">{error}</div>
          ) : rows.length === 0 ? (
            <div className="wh-empty">No one has worked this ticket in this role yet.</div>
          ) : (
            <ul className="wh-list">
              {rows.map((r) => (
                <li key={r.id} className={`wh-item ${r.id === currentId ? 'current' : ''}`}>
                  <div className="wh-person">
                    <span className="wh-avatar">{r.name.charAt(0).toUpperCase()}</span>
                    <div className="wh-person-meta">
                      <span className="wh-name">
                        {r.name}
                        {r.id === currentId && <span className="wh-badge">Current</span>}
                      </span>
                      {r.email && <span className="wh-email">{r.email}</span>}
                    </div>
                  </div>
                  <div className="wh-time">
                    <span className={`wh-duration ${r.running ? 'running' : ''}`}>
                      <Clock size={13} /> {fmtDuration(r.seconds)}
                    </span>
                    <span className="wh-stints">{r.stints} stint{r.stints === 1 ? '' : 's'}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!loading && !error && rows.length > 0 && (
          <div className="wh-footer">
            <span>Total {role === 'AGENT' ? 'agent' : 'QC'} time</span>
            <strong>{fmtDuration(totalSeconds)}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

WorkHistoryModal.propTypes = {
  ticketId: PropTypes.string.isRequired,
  role: PropTypes.oneOf(['AGENT', 'QC']).isRequired,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default WorkHistoryModal;
