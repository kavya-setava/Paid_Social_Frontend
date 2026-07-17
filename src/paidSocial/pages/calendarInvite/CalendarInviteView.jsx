import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarApi, qmApi, qcApi, errMessage } from '../../api/paidSocialApi';
import { getUser } from '../../api/session';
import {
  normalizeList, ciStatusClass, ciLabel, fmtDuration, CI_STATUS,
  ciAgentSeconds, ciQcSeconds, ciAgentRunning, ciQcRunning,
} from '../../utils/tickets';
import { toastSuccess, toastError } from '../../utils/toast';
import usePaidSocket from '../../hooks/usePaidSocket';
import { CI_CARDS, CI_TRANSITIONS } from './ciConstants';
import './CalendarInvite.css';

const PAGE_SIZE = 20;

const COLUMNS = [
  { key: 'ticketId', label: 'Ticket ID' },
  { key: 'campaignName', label: 'Campaign Name' },
  { key: 'adSetName', label: 'AdSet Name' },
  { key: 'adName', label: 'Ad Name' },
  { key: 'socialiteLink', label: 'Socialite Link' },
  { key: 'platform', label: 'Platform' },
  { key: 'region', label: 'Region' },
  { key: 'country', label: 'Country' },
  { key: 'publishDate', label: 'Publish Date (PST)' },
  { key: 'ciStatusCell', label: 'CI Status' },
  { key: 'ciAgentName', label: 'Agent' },
  { key: 'ciAgentStartAt', label: 'Agent Start' },
  { key: 'ciAgentEndAt', label: 'Agent End' },
  { key: 'agentUt', label: 'Agent UT' },
  { key: 'ciQcName', label: 'QC' },
  { key: 'ciQcStartAt', label: 'QC Start' },
  { key: 'ciQcEndAt', label: 'QC End' },
  { key: 'qcUt', label: 'QC UT' },
];

// Shared Calendar Invite dashboard for Agent / QC / QM.
//   QM    → assigns Calendar-Invite tickets to agents (read-only on status)
//   AGENT → works tickets assigned to them (Calendar Invite → In Progress → Ready to QC)
//   QC    → picks/assigns from the Ready-to-QC pool, then In QC → Completed
const CalendarInviteView = ({ role }) => {
  const cards = CI_CARDS[role] || CI_CARDS.QM;
  const transitions = CI_TRANSITIONS[role] || {};
  const myId = getUser()?.id || null;
  const showActionCol = role === 'QM' || role === 'QC';

  const [activeStatus, setActiveStatus] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [roster, setRoster] = useState([]); // agents (QM) or QCers (QC)

  const stateRef = useRef({ activeStatus, search, page });
  stateRef.current = { activeStatus, search, page };

  // Roster for the assign dropdowns.
  useEffect(() => {
    if (role === 'QM') qmApi.getOperators('AGENT').then((r) => setRoster(r?.data || [])).catch(() => setRoster([]));
    else if (role === 'QC') qcApi.getQcers().then((r) => setRoster(r?.data || [])).catch(() => setRoster([]));
  }, [role]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const { activeStatus: st, search: q, page: p } = stateRef.current;
      const res = await calendarApi.getList({
        status: st === 'all' ? undefined : st,
        search: q || undefined,
        page: p,
        limit: PAGE_SIZE,
      });
      setTickets(normalizeList(res?.data || []));
      setCounts(res?.counts || {});
      setTotalPages(res?.totalPages || 1);
      setTotal(res?.total || 0);
    } catch (err) {
      toastError(errMessage(err, 'Failed to load calendar invites'));
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [activeStatus, search, page, fetchList]);
  usePaidSocket(() => fetchList());

  // Live TAT ticking while any stage is open.
  const [, setNow] = useState(() => Date.now());
  useEffect(() => {
    const anyRunning = tickets.some((t) => ciAgentRunning(t._raw?.ci) || ciQcRunning(t._raw?.ci));
    if (!anyRunning) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [tickets]);

  const selectCard = (key) => { setActiveStatus(key); setPage(1); };
  const submitSearch = (e) => { e.preventDefault(); setSearch(searchInput.trim()); setPage(1); };

  // Generic action runner: busy + toast + refetch.
  const run = (fn, msg) => async (...args) => {
    setBusyId(args[0]);
    try {
      await fn(...args);
      toastSuccess(msg);
      fetchList();
    } catch (err) {
      toastError(errMessage(err, 'Action failed'));
    } finally {
      setBusyId(null);
    }
  };

  const changeStatus = run((id, target) => calendarApi.setStatus(id, target), 'Status updated');
  const assignAgent = run((id, agentId) => calendarApi.assignAgent(id, agentId), 'Agent assigned');
  const qcPick = run((id) => calendarApi.qcPick(id), 'Picked — start when ready');
  const qcAssign = run((id, qcId) => calendarApi.qcAssign(id, qcId), 'Assigned to QCer');

  // Status column: editable dropdown for the owner at an editable stage.
  const renderStatusCell = (ticket) => {
    const cur = ticket._raw?.ciStatus;
    let options = null;
    if (role === 'AGENT') options = transitions[cur];
    else if (role === 'QC' && String(ticket.ciQcId) === String(myId)) options = transitions[cur];

    if (options) {
      return (
        <select
          className="status-select"
          value={cur}
          disabled={busyId === ticket.id}
          onChange={(e) => e.target.value !== cur && changeStatus(ticket.id, e.target.value)}
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    return <span className={`status-tag ${ciStatusClass(cur)}`}>{ciLabel(cur)}</span>;
  };

  // Assign / Action column (QM + QC only).
  const renderActionCell = (ticket) => {
    const cur = ticket._raw?.ciStatus;
    if (role === 'QM') {
      if (cur !== CI_STATUS.CALENDAR_INVITE) return <span className="action-note">—</span>;
      return (
        <select
          className="status-select"
          value={ticket.ciAgentId || ''}
          disabled={busyId === ticket.id}
          onChange={(e) => e.target.value && assignAgent(ticket.id, e.target.value)}
        >
          <option value="">{busyId === ticket.id ? 'Assigning…' : 'Assign agent'}</option>
          {roster.map((a) => (
            <option key={a._id} value={a._id} disabled={a.isOnBreak}>
              {a.name}{a.isOnBreak ? ' (on break)' : ''}
            </option>
          ))}
        </select>
      );
    }
    // QC pool row (Ready to QC, unclaimed): Pick + assign-to-QC.
    if (cur === CI_STATUS.READY_TO_QC && !ticket.ciQcId) {
      return (
        <div className="action-group">
          <button type="button" className="action-btn action-btn-primary" disabled={busyId === ticket.id} onClick={() => qcPick(ticket.id)}>
            Pick
          </button>
          <select
            className="status-select"
            value=""
            disabled={busyId === ticket.id}
            onChange={(e) => e.target.value && qcAssign(ticket.id, e.target.value)}
          >
            <option value="">Assign to QCer</option>
            {roster.map((q) => (
              <option key={q._id} value={q._id} disabled={q.isOnBreak}>
                {q.name}{q.isOnBreak ? ' (on break)' : ''}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return <span className="action-note">—</span>;
  };

  const renderCell = (ticket, key) => {
    if (key === 'ciStatusCell') return renderStatusCell(ticket);
    if (key === 'socialiteLink') {
      return ticket.socialiteLink
        ? <a className="ps-link" href={ticket.socialiteLink} target="_blank" rel="noreferrer">Link</a>
        : '—';
    }
    if (key === 'agentUt') {
      const ci = ticket._raw?.ci || {};
      return <span className={`ps-timer ${ciAgentRunning(ci) ? 'running' : ''}`}>{fmtDuration(ciAgentSeconds(ci))}</span>;
    }
    if (key === 'qcUt') {
      const ci = ticket._raw?.ci || {};
      return <span className={`ps-timer ${ciQcRunning(ci) ? 'running' : ''}`}>{fmtDuration(ciQcSeconds(ci))}</span>;
    }
    return ticket[key] || '—';
  };

  const colCount = COLUMNS.length + (showActionCol ? 1 : 0);

  return (
    <div className="ci-page">
      <div className="status-cards-container">
        {cards.map((c) => {
          const count = c.key === 'all' ? (counts.ALL ?? 0) : (counts[c.key] ?? 0);
          const isActive = activeStatus === c.key;
          return (
            <div
              key={c.key}
              className={`status-card ${isActive ? 'active' : ''}`}
              style={{ '--accent-color': c.color }}
              role="button"
              tabIndex={0}
              onClick={() => selectCard(c.key)}
              onKeyDown={(e) => { if (e.key === 'Enter') selectCard(c.key); }}
            >
              <div className="status-info">
                <span className="status-label">{c.label}</span>
                <span className="status-count">{count}</span>
              </div>
              <div className="status-indicator-bar" />
            </div>
          );
        })}
      </div>

      <form className="ps-search-bar" onSubmit={submitSearch}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Search campaign, ticket ID, ad name…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {search && (
          <button type="button" className="ps-search-clear" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}>
            Clear
          </button>
        )}
        <button type="submit" className="ps-search-submit">Search</button>
      </form>

      <div className="table-wrapper">
        <table className="qc-table">
          <thead>
            <tr>
              {COLUMNS.map((c) => <th key={c.key}>{c.label}</th>)}
              {showActionCol && <th>{role === 'QM' ? 'Assign To' : 'Action'}</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={colCount} className="table-loading">Loading…</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={colCount} className="no-data">No calendar-invite tickets found.</td></tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id}>
                  {COLUMNS.map((c) => (
                    <td key={c.key} className={c.key === 'campaignName' ? 'bold-text' : ''}>
                      {renderCell(t, c.key)}
                    </td>
                  ))}
                  {showActionCol && <td>{renderActionCell(t)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="ci-pagination">
          <span className="ci-page-info">
            Page {page} of {totalPages} · {total} ticket{total === 1 ? '' : 's'}
          </span>
          <div className="ci-page-controls">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft size={16} /> Prev
            </button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

CalendarInviteView.propTypes = {
  role: PropTypes.oneOf(['AGENT', 'QC', 'QM']).isRequired,
};

export default CalendarInviteView;
