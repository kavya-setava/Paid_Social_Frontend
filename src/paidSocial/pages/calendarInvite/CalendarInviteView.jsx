import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Info } from 'lucide-react';
import { calendarApi, qmApi, qcApi, errMessage } from '../../api/paidSocialApi';
import { getUser } from '../../api/session';
import {
  normalizeList, ciStatusClass, ciLabel, CI_STATUS, fmtDuration,
  ciAgentSeconds, ciQcSeconds, ciAgentRunning, ciQcRunning,
  isUnavailable, operatorLabel,
} from '../../utils/tickets';
import { toastSuccess, toastError } from '../../utils/toast';
import usePaidSocket from '../../hooks/usePaidSocket';
import useClientTable from '../../hooks/useClientTable';
import useOperators from '../../hooks/useOperators';
import { PaidSearch, PaidPagination } from '../../components/PaidTableControls';
import WorkHistoryModal from '../../components/WorkHistoryModal';
import { CI_CARDS } from './ciConstants';
import './CalendarInvite.css';

// Columns common to every tab.
const BASE = [
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
];

// Column pieces for the CI tail.
const COL = {
  agent: { key: 'ciAgentCell', label: 'Agent' },
  agentUt: { key: 'agentUt', label: 'Agent UT' },
  qc: { key: 'ciQcCell', label: 'QC' },
  qcUt: { key: 'qcUt', label: 'QC UT' },
  traffickerComments: { key: 'traffickerComments', label: 'Trafficker Comments' },
  qcComments: { key: 'qcComments', label: 'QC Comments' },
  prevAgent: { key: 'agentName', label: 'Previous Trafficker Name' },
  prevQc: { key: 'qcName', label: 'Previous QC Name' },
};
const CTX = [COL.traffickerComments, COL.qcComments, COL.prevAgent, COL.prevQc];

// Per-role, per-tab tail columns (see the requested layout).
const ciTail = (role, tab) => {
  // Calendar Invite tab (all roles): normal-flow context only (no CI timing yet).
  if (tab === CI_STATUS.CALENDAR_INVITE) return [...CTX];
  if (role === 'AGENT') {
    if (tab === CI_STATUS.IN_PROGRESS || tab === CI_STATUS.READY_TO_QC) return [COL.agent, COL.agentUt, ...CTX];
    if (tab === CI_STATUS.COMPLETED) return [COL.agent, COL.agentUt, COL.qc];
    if (tab === 'all') return [COL.agent, COL.agentUt, COL.qc, ...CTX]; // no QC UT
    return [COL.agent, COL.agentUt, COL.qc, COL.qcUt, ...CTX];          // Calendar Invite, In QC
  }
  if (role === 'QC') {
    if (tab === CI_STATUS.COMPLETED) return [COL.agent, COL.qc, COL.qcUt];
    return [COL.agent, COL.qc, COL.qcUt, ...CTX];                        // no Agent UT anywhere
  }
  // QM — full set.
  return [COL.agent, COL.agentUt, COL.qc, COL.qcUt, ...CTX];
};

const CalendarInviteView = ({ role }) => {
  const cards = CI_CARDS[role] || CI_CARDS.QM;
  const myId = getUser()?.id || null;

  const [activeStatus, setActiveStatus] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [history, setHistory] = useState(null); // { ticketId, role, title }

  // Roster for the assign dropdowns — live-refreshes on presence change.
  const roster = useOperators(() =>
    role === 'QM' ? qmApi.getOperators('AGENT')
      : role === 'QC' ? qcApi.getQcers()
        : Promise.resolve({ data: [] })
  );

  // Client-side search (all columns) + 10-per-page pagination.
  const { query, setQuery, page, setPage, total, totalPages, pageRows } = useClientTable(tickets, 10);

  const statusRef = useRef(activeStatus);
  statusRef.current = activeStatus;
  const reqIdRef = useRef(0); // guards against stale (out-of-order) responses

  const fetchList = useCallback(async (silent = false) => {
    const reqId = ++reqIdRef.current;
    const st = statusRef.current;
    if (!silent) setLoading(true);
    try {
      const res = await calendarApi.getList({
        status: st === 'all' ? undefined : st,
        limit: 200,
      });
      if (reqId !== reqIdRef.current || st !== statusRef.current) return; // stale
      setTickets(normalizeList(res?.data || []));
      setCounts(res?.counts || {});
    } catch (err) {
      if (reqId === reqIdRef.current) {
        toastError(errMessage(err, 'Failed to load calendar invites'));
        setTickets([]);
      }
    } finally {
      if (reqId === reqIdRef.current && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [activeStatus, fetchList]);
  usePaidSocket(() => fetchList(true));

  // Tick every second so the running Agent/QC UT re-renders live.
  const [, setNow] = useState(() => Date.now());
  useEffect(() => {
    const anyRunning = tickets.some((t) => ciAgentRunning(t._raw?.ci) || ciQcRunning(t._raw?.ci));
    if (!anyRunning) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [tickets]);

  const selectCard = (key) => { setActiveStatus(key); setPage(1); };

  const run = (fn, msg) => async (...args) => {
    setBusyId(args[0]);
    try {
      await fn(...args);
      toastSuccess(msg);
      fetchList(true);
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

  const columns = [...BASE, ...ciTail(role, activeStatus)];
  const showAction = activeStatus !== CI_STATUS.COMPLETED; // terminal — no actions

  const openHistory = (ticket, hRole) => setHistory({
    ticketId: ticket.id,
    role: hRole,
    title: `${hRole === 'AGENT' ? 'Agent' : 'QC'} history — ${ticket.ticketId || ''}`,
  });

  const peopleCell = (ticket, name, hRole) => (
    <span className="wh-cell">
      {name || '—'}
      <button type="button" className="wh-info-btn" title="View history" onClick={() => openHistory(ticket, hRole)}>
        <Info size={12} />
      </button>
    </span>
  );

  // Action column — role + status gated buttons.
  const renderAction = (ticket) => {
    const cur = ticket._raw?.ciStatus;
    const busy = busyId === ticket.id;
    const mineQc = String(ticket.ciQcId) === String(myId);

    if (role === 'QM') {
      if (cur !== CI_STATUS.CALENDAR_INVITE) return <span className="action-note">—</span>;
      return (
        <select className="status-select" value={ticket.ciAgentId || ''} disabled={busy}
          onChange={(e) => e.target.value && assignAgent(ticket.id, e.target.value)}>
          <option value="">{busy ? 'Assigning…' : 'Assign agent'}</option>
          {roster.map((a) => (
            <option key={a._id} value={a._id} disabled={isUnavailable(a)}>
              {operatorLabel(a)}
            </option>
          ))}
        </select>
      );
    }

    if (role === 'AGENT') {
      if (cur === CI_STATUS.CALENDAR_INVITE)
        return <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => changeStatus(ticket.id, CI_STATUS.IN_PROGRESS)}>Enable In Progress</button>;
      if (cur === CI_STATUS.IN_PROGRESS)
        return <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => changeStatus(ticket.id, CI_STATUS.READY_TO_QC)}>Enable Ready to QC</button>;
      return <span className="action-note">—</span>;
    }

    // QC
    if (cur === CI_STATUS.READY_TO_QC && !ticket.ciQcId) {
      return (
        <div className="action-group">
          <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => qcPick(ticket.id)}>Pick</button>
          <select className="status-select" value="" disabled={busy}
            onChange={(e) => e.target.value && qcAssign(ticket.id, e.target.value)}>
            <option value="">Assign to QCer</option>
            {roster.map((q) => (
              <option key={q._id} value={q._id} disabled={isUnavailable(q)}>
                {operatorLabel(q)}
              </option>
            ))}
          </select>
        </div>
      );
    }
    if (cur === CI_STATUS.READY_TO_QC && mineQc)
      return <button type="button" className="action-btn action-btn-primary" disabled={busy} onClick={() => changeStatus(ticket.id, CI_STATUS.IN_QC)}>Enable In QC</button>;
    if (cur === CI_STATUS.IN_QC && mineQc)
      return <button type="button" className="action-btn action-btn-approve" disabled={busy} onClick={() => changeStatus(ticket.id, CI_STATUS.COMPLETED)}>Complete</button>;
    return <span className="action-note">—</span>;
  };

  const renderCell = (ticket, key) => {
    if (key === 'ciStatusCell') {
      const cur = ticket._raw?.ciStatus;
      return <span className={`status-tag ${ciStatusClass(cur)}`}>{ciLabel(cur)}</span>;
    }
    if (key === 'socialiteLink') {
      return ticket.socialiteLink
        ? <a className="ps-link" href={ticket.socialiteLink} target="_blank" rel="noreferrer">Link</a>
        : '—';
    }
    // CI agent / QC with ⓘ history.
    if (key === 'ciAgentCell') return peopleCell(ticket, ticket.ciAgentName, 'AGENT');
    if (key === 'ciQcCell') return peopleCell(ticket, ticket.ciQcName, 'QC');
    // Live UT timers (run while the stage is open).
    if (key === 'agentUt') {
      const ci = ticket._raw?.ci || {};
      return <span className={`ps-timer ${ciAgentRunning(ci) ? 'running' : ''}`}>{fmtDuration(ciAgentSeconds(ci))}</span>;
    }
    if (key === 'qcUt') {
      const ci = ticket._raw?.ci || {};
      return <span className={`ps-timer ${ciQcRunning(ci) ? 'running' : ''}`}>{fmtDuration(ciQcSeconds(ci))}</span>;
    }
    // Previous trafficker (normal-flow agent) + previous QC (plain context).
    if (key === 'agentName') return ticket.agentName || '—';
    if (key === 'qcName') return ticket.qcName || '—';
    return ticket[key] || '—';
  };

  const colCount = columns.length + (showAction ? 1 : 0);

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

      <PaidSearch value={query} onChange={setQuery} />

      <div className="table-wrapper">
        <table className="qc-table">
          <thead>
            <tr>
              {columns.map((c) => <th key={c.key}>{c.label}</th>)}
              {showAction && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={colCount} className="table-loading">Loading…</td></tr>
            ) : pageRows.length === 0 ? (
              <tr><td colSpan={colCount} className="no-data">No calendar-invite tickets found.</td></tr>
            ) : (
              pageRows.map((t) => (
                <tr key={t.id}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.key === 'campaignName' ? 'bold-text' : ''}>
                      {renderCell(t, c.key)}
                    </td>
                  ))}
                  {showAction && <td>{renderAction(t)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaidPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />

      {history && (
        <WorkHistoryModal
          ticketId={history.ticketId}
          role={history.role}
          title={history.title}
          onClose={() => setHistory(null)}
        />
      )}
    </div>
  );
};

CalendarInviteView.propTypes = {
  role: PropTypes.oneOf(['AGENT', 'QC', 'QM']).isRequired,
};

export default CalendarInviteView;
