import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Info, Pencil } from 'lucide-react';
import StatusActionCell from './StatusActionCell';
import WorkHistoryModal from '../../../components/WorkHistoryModal';
import { STATUS, statusClass, liveSeconds, fmtDuration, isTimerRunning, isUnavailable, operatorLabel } from '../../../utils/tickets';
import './TicketsTable.css';

// Columns shared across every tab, rendered between Operator and Task Status.
const BASE_COLUMNS = [
  { key: 'taskReceivedTime', label: 'Task Received Time' },
  { key: 'marketingCampaign', label: 'Marketing Campaign' },
  { key: 'campaignName', label: 'Campaign Name' },
  { key: 'adSetName', label: 'AdSet Name' },
  { key: 'adName', label: 'Ad Name' },
  { key: 'socialiteLink', label: 'Socialite Link' },
  { key: 'highVisibilityTitles', label: 'High-Visibility Titles' },
  { key: 'adTech', label: 'Ad-Tech' },
  { key: 'taskType', label: 'Task Type' },
  { key: 'page', label: 'Page' },
  { key: 'platform', label: 'Platform' },
  { key: 'region', label: 'Region' },
  { key: 'country', label: 'Country' },
  { key: 'flightStart', label: 'AD Flight Start Date and time' },
  { key: 'flightEnd', label: 'AD Flight End Date and time' },
];

const MID_COLUMNS = [
  { key: 'taskAssignedTime', label: 'Task Assigned Time' },
  { key: 'publishDate', label: 'Publish Date (PST)' },
  { key: 'launchingPrioritization', label: 'Launching Prioritization' },
];

const TAIL_COLUMN_DEFS = {
  socialiteNotes: { key: 'socialiteNotes', label: 'Socialite Notes' },
  traffickerComments: { key: 'traffickerComments', label: 'Trafficker Comments' },
  qcThread: { key: 'qcThread', label: 'QC Thread' },
  tacticalLink: { key: 'tacticalLink', label: 'Tactical Link' },
  qcer: { key: 'qcer', label: "QC'er" },
  qcStatus: { key: 'qcStatus', label: 'QC Status' },
  qcComment: { key: 'qcComments', label: 'QC Comments' },
  rejectionType: { key: 'rejectionType', label: 'Rejected Type' },
};

const EDITABLE_TABS = ['all', 'trafficked'];

const FULL_TAIL = ['socialiteNotes', 'traffickerComments', 'qcThread', 'qcer', 'qcStatus', 'qcComment'];

// Which trailing columns each tab shows.
const TAB_TAIL = {
  all: FULL_TAIL,
  rttAssigned: ['socialiteNotes', 'qcThread'],
  inProgress: ['socialiteNotes', 'qcThread'],
  onHold: ['socialiteNotes', 'traffickerComments', 'qcThread'],
  qcOnHold: ['socialiteNotes', 'traffickerComments', 'qcThread', 'qcer', 'qcComment'],
  readyToQc: ['socialiteNotes', 'traffickerComments', 'qcThread', 'qcer'],
  inQc: ['socialiteNotes', 'traffickerComments', 'qcThread', 'qcer'],
  rejected: FULL_TAIL,
  rework: FULL_TAIL,
  trafficked: FULL_TAIL,
  completed: FULL_TAIL,
};

// Tabs where the agent has actionable work.
const ACTION_TABS = ['all', 'rttAssigned', 'inProgress', 'onHold', 'rejected', 'rework'];

const TicketsTable = ({
  tickets = [],
  loading = false,
  activeStatus = 'all',
  mode = 'mine',
  busyId = null,
  actions = {},
  agents = [],
  transferringId = null,
  onTransfer = () => { },
  onEdit = null,          // (ticket) => void — Edit pencil on All/Trafficked
  onFieldSave = null,     // (id, key, value) => void — inline QC Thread / Tactical Link
}) => {
  // Tactical Link sits right after QC Thread in every tab.
  const baseTail = (TAB_TAIL[activeStatus] || FULL_TAIL).flatMap((k) =>
    k === 'qcThread' ? ['qcThread', 'tacticalLink'] : [k]
  );
  // Rejection Type shows on the All + Rework tabs.
  const tailKeys = (activeStatus === 'all' || activeStatus === 'rework')
    ? [...baseTail, 'rejectionType']
    : baseTail;
  const tailColumns = tailKeys.map((k) => TAIL_COLUMN_DEFS[k]);
  const showActions = ACTION_TABS.includes(activeStatus) || mode === 'bucket';
  // Per-person history icons on Operator / QC'er — shown in the rework views.
  const showHistoryIcons = mode === 'bucket' || activeStatus === 'rework';
  const showEdit = !!onEdit && EDITABLE_TABS.includes(activeStatus);

  const [history, setHistory] = useState(null); // { ticketId, role, title }

  // Tick every second so live timers re-render.
  const [, setNow] = useState(() => Date.now());
  useEffect(() => {
    const anyRunning = tickets.some((t) => isTimerRunning(t._ticket, 'agent'));
    if (!anyRunning) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [tickets]);

  if (loading) {
    return <div className="table-loading">Loading tickets…</div>;
  }

  const columnCount = 2 + BASE_COLUMNS.length + 1 + MID_COLUMNS.length + 2 + tailColumns.length + (showActions ? 1 : 0) + (showEdit ? 1 : 0);

  // Inline agent-editable cell for QC Thread / Tactical Link.
  const editableInline = (ticket, key) => (
    <input
      key={`${ticket.id}-${key}-${ticket[key] || ''}`}
      className="ps-inline-input"
      defaultValue={ticket[key] || ''}
      placeholder={key === 'tacticalLink' ? 'Paste link…' : 'QC thread…'}
      onBlur={(e) => {
        const v = e.target.value;
        if (v !== (ticket[key] || '') && onFieldSave) onFieldSave(ticket.id, key, v);
      }}
    />
  );

  // Socialite Link → clickable link; everything else plain text.
  const renderValue = (ticket, key) => {
    if (key === 'socialiteLink') {
      return ticket.socialiteLink
        ? <a className="ps-link" href={ticket.socialiteLink} target="_blank" rel="noreferrer">Link</a>
        : '—';
    }
    return ticket[key] || '—';
  };

  // A name cell with an "i" icon opening the per-person work-time history.
  const peopleCell = (ticket, value, role) => (
    <span className="wh-cell">
      {value || '—'}
      {showHistoryIcons && (
        <button
          type="button"
          className="wh-info-btn"
          title={`View ${role === 'AGENT' ? 'agent' : 'QC'} time history`}
          onClick={() => setHistory({
            ticketId: ticket.id,
            role,
            title: `${role === 'AGENT' ? 'Agent' : 'QC'} history — ${ticket.ticketId || ''}`,
          })}
        >
          <Info size={12} />
        </button>
      )}
    </span>
  );

  const renderTimer = (ticket) => {
    const raw = ticket._ticket;
    const secs = liveSeconds(raw, 'agent');
    if (!secs && ticket._raw?.status === STATUS.RTT) return '—';
    return (
      <span className={`ps-timer ${isTimerRunning(raw, 'agent') ? 'running' : ''}`}>
        {fmtDuration(secs)}
      </span>
    );
  };

  return (
    <div className="table-wrapper">
      <table className="qm-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Campaign</th>
            {BASE_COLUMNS.map((col) => <th key={col.key}>{col.label}</th>)}
            <th>Operator</th>
            {MID_COLUMNS.map((col) => <th key={col.key}>{col.label}</th>)}
            <th>Task Status</th>
            <th>Operator Time</th>
            {tailColumns.map((col) => <th key={col.key}>{col.label}</th>)}
            {showActions && <th>Actions</th>}
            {showEdit && <th>Edit</th>}
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="no-data">No tickets found matching this criteria.</td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="bold-text">{ticket.ticketId}</td>
                <td>{ticket.campaignName || '—'}</td>
                {BASE_COLUMNS.map((col) => <td key={col.key}>{renderValue(ticket, col.key)}</td>)}
                <td>
                  {activeStatus === 'rttAssigned' ? (
                    <select
                      className="status-select"
                      value={ticket.agentId || ''}
                      disabled={transferringId === ticket.id}
                      onChange={(e) => onTransfer(ticket.id, e.target.value)}
                    >
                      <option value="">
                        {transferringId === ticket.id ? 'Transferring…' : 'Transfer to…'}
                      </option>
                      {agents.map((a) => (
                        <option key={a._id} value={a._id} disabled={isUnavailable(a)}>
                          {operatorLabel(a)}
                        </option>
                      ))}
                    </select>
                  ) : showHistoryIcons
                    ? peopleCell(ticket, ticket.operator || 'Unassigned', 'AGENT')
                    : (ticket.operator || 'Unassigned')}
                </td>
                {MID_COLUMNS.map((col) => <td key={col.key}>{ticket[col.key] || '—'}</td>)}
                <td>
                  <span className={`status-tag ${statusClass(ticket._raw?.status)}`}>
                    {ticket.taskStatus}
                  </span>
                </td>
                <td>{renderTimer(ticket)}</td>
                {tailColumns.map((col) => (
                  <td key={col.key}>
                    {col.key === 'qcer' && showHistoryIcons
                      ? peopleCell(ticket, ticket.qcer, 'QC')
                      : (col.key === 'qcThread' || col.key === 'tacticalLink')
                        ? editableInline(ticket, col.key)
                        : (ticket[col.key] || '—')}
                  </td>
                ))}
                {showActions && (
                  <td>
                    <StatusActionCell
                      ticket={ticket}
                      mode={mode}
                      busy={busyId === ticket.id}
                      onStart={actions.onStart}
                      onHold={actions.onHold}
                      onResume={actions.onResume}
                      onSubmit={actions.onSubmit}
                      onPick={actions.onPick}
                    />
                  </td>
                )}
                {showEdit && (
                  <td>
                    <button type="button" className="ps-edit-btn" title="Edit ticket" onClick={() => onEdit(ticket)}>
                      <Pencil size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

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

TicketsTable.propTypes = {
  tickets: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  activeStatus: PropTypes.string,
  mode: PropTypes.oneOf(['mine', 'bucket']),
  busyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  actions: PropTypes.object,
  agents: PropTypes.arrayOf(PropTypes.object),
  transferringId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onTransfer: PropTypes.func,
  onEdit: PropTypes.func,
  onFieldSave: PropTypes.func,
};

export default TicketsTable;
