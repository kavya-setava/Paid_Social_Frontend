import React from 'react';
import PropTypes from 'prop-types';
import StatusActionCell from './StatusActionCell';
import { STATUS, STATUS_META, OPERATORS } from './mockTickets';
import './TicketsTable.css';

// Columns identical across every tab, rendered between Operator and Task Status.
const BASE_COLUMNS = [
  { key: 'taskReceivedTime', label: 'Task Received Time' },
  { key: 'marketingCampaign', label: 'Marketing Campaign' },
  { key: 'campaignName', label: 'Campaign Name' },
  { key: 'adSetName', label: 'AdSet Name' },
  { key: 'adName', label: 'Ad Name' },
  { key: 'highVisibilityTitles', label: 'High-Visibility Titles' },
  { key: 'adTech', label: 'Ad-Tech' },
  { key: 'taskType', label: 'Task Type' },
  { key: 'page', label: 'Page' },
  { key: 'platform', label: 'Platform' },
  { key: 'region', label: 'Region' },
  { key: 'flightStart', label: 'AD Flight Start Date and time' },
  { key: 'flightEnd', label: 'AD Flight End Date and time' },
];

const MID_COLUMNS = [
  { key: 'taskAssignedTime', label: 'Task Assigned Time' },
  { key: 'publishDate', label: 'Publish Date (PST)' },
  { key: 'launchingPrioritization', label: 'Launching Prioritization' },
];

// Superset of the trailing, workflow-stage-dependent columns. Each tab picks
// its own ordered subset via TAB_CONFIG.tail below.
const TAIL_COLUMN_DEFS = {
  socialiteNotes: { key: 'socialiteNotes', label: 'Socialite Notes' },
  traffickerComments: { key: 'traffickerComments', label: 'Trafficker Comments' },
  qcThread: { key: 'qcThread', label: 'QC Thread' },
  qcer: { key: 'qcer', label: "QC'er" },
  qcStatus: { key: 'qcStatus', label: 'QC Status' },
  qcComment: { key: 'qcComment', label: 'QC Comments' },
};

const FULL_TAIL = ['socialiteNotes', 'traffickerComments', 'qcThread', 'qcer', 'qcStatus', 'qcComment'];

// Per-tab behavior: which trailing columns show, whether Task Status is a
// pill or an editable dropdown, whether the Actions column appears (and
// where), and whether Trafficker Comments is an editable input.
const TAB_CONFIG = {
  all: { tail: FULL_TAIL, statusMode: 'pill', actions: 'none' },
  rttAssigned: { tail: ['socialiteNotes', 'qcThread'], statusMode: 'dropdown-rtt', actions: 'none' },
  inProgress: {
    tail: ['socialiteNotes', 'traffickerComments', 'qcThread'],
    statusMode: 'dropdown-in-progress',
    actions: 'pause-resume',
    actionsPosition: 'afterStatus',
    traffickerCommentsEditable: true,
  },
  onHold: { tail: ['socialiteNotes', 'traffickerComments', 'qcThread'], statusMode: 'pill', actions: 'none' },
  readyToQc: { tail: ['socialiteNotes', 'traffickerComments', 'qcThread', 'qcer', 'qcStatus'], statusMode: 'pill', actions: 'none' },
  inQc: { tail: ['socialiteNotes', 'traffickerComments', 'qcThread', 'qcer', 'qcStatus'], statusMode: 'pill', actions: 'none' },
  rejected: { tail: FULL_TAIL, statusMode: 'pill', actions: 'none' },
  trafficked: { tail: FULL_TAIL, statusMode: 'pill', actions: 'none' },
  rework: { tail: FULL_TAIL, statusMode: 'pill', actions: 'rework', actionsPosition: 'end' },
};

// Operator cell is an editable picker only on these tabs; plain text elsewhere.
const OPERATOR_EDITABLE_TABS = ['all', 'rttAssigned'];

const TicketsTable = ({
  tickets = [],
  loading = false,
  activeStatus = 'all',
  onStatusChange,
  onOperatorChange,
  onTraffickerCommentChange,
}) => {
  if (loading) {
    return <div className="table-loading">Loading data from backend...</div>;
  }

  const config = TAB_CONFIG[activeStatus] || TAB_CONFIG.all;
  const operatorEditable = OPERATOR_EDITABLE_TABS.includes(activeStatus);
  const showActions = config.actions !== 'none';
  const actionsAfterStatus = showActions && config.actionsPosition === 'afterStatus';
  const actionsAtEnd = showActions && !actionsAfterStatus;
  const tailColumns = config.tail.map((key) => TAIL_COLUMN_DEFS[key]);

  const columnCount =
    2 + BASE_COLUMNS.length + 1 + MID_COLUMNS.length + 1 + (showActions ? 1 : 0) + tailColumns.length;

  const renderTaskStatus = (ticket) => {
    const meta = STATUS_META[ticket.status] || {};

    if (config.statusMode === 'dropdown-rtt') {
      return (
        <select
          className="status-select"
          value={ticket.status}
          onChange={(e) => onStatusChange(ticket.id, e.target.value)}
        >
          <option value={STATUS.RTT}>RTT</option>
          <option value={STATUS.IN_PROGRESS}>In Progress</option>
        </select>
      );
    }

    if (config.statusMode === 'dropdown-in-progress') {
      return (
        <select
          className="status-select"
          value={ticket.status}
          onChange={(e) => onStatusChange(ticket.id, e.target.value)}
        >
          <option value={STATUS.IN_PROGRESS}>In Progress</option>
          <option value={STATUS.ON_HOLD}>On Hold</option>
          <option value={STATUS.READY_TO_QC}>Ready to QC</option>
        </select>
      );
    }

    return (
      <span className={`status-tag ${meta.className || ''}`}>
        {meta.text || ticket.status}
      </span>
    );
  };

  return (
    <div className="table-wrapper">
      <table className="qm-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Subject</th>
            {BASE_COLUMNS.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Operator</th>
            {MID_COLUMNS.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>Task Status</th>
            {actionsAfterStatus && <th>Actions</th>}
            {tailColumns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {actionsAtEnd && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="no-data">No tickets found matches this criteria.</td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="bold-text">#{ticket.id}</td>
                <td>{ticket.subject}</td>
                {BASE_COLUMNS.map((col) => (
                  <td key={col.key}>{ticket[col.key] || '—'}</td>
                ))}
                <td>
                  {operatorEditable ? (
                    <select
                      className="status-select"
                      value={ticket.operator || ''}
                      onChange={(e) => onOperatorChange(ticket.id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {OPERATORS.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    ticket.operator || 'Unassigned'
                  )}
                </td>
                {MID_COLUMNS.map((col) => (
                  <td key={col.key}>{ticket[col.key] || '—'}</td>
                ))}
                <td>{renderTaskStatus(ticket)}</td>
                {actionsAfterStatus && (
                  <td>
                    <StatusActionCell ticket={ticket} onStatusChange={onStatusChange} onOperatorChange={onOperatorChange} />
                  </td>
                )}
                {tailColumns.map((col) => {
                  if (col.key === 'traffickerComments' && config.traffickerCommentsEditable) {
                    return (
                      <td key={col.key}>
                        <textarea
                          className="inline-comment-input"
                          value={ticket.traffickerComments || ''}
                          onChange={(e) => onTraffickerCommentChange(ticket.id, e.target.value)}
                        />
                      </td>
                    );
                  }
                  return <td key={col.key}>{ticket[col.key] || '—'}</td>;
                })}
                {actionsAtEnd && (
                  <td>
                    <StatusActionCell ticket={ticket} onStatusChange={onStatusChange} onOperatorChange={onOperatorChange} />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

TicketsTable.propTypes = {
  tickets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      subject: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ),
  loading: PropTypes.bool,
  activeStatus: PropTypes.string,
  onStatusChange: PropTypes.func.isRequired,
  onOperatorChange: PropTypes.func.isRequired,
  onTraffickerCommentChange: PropTypes.func,
};

export default TicketsTable;
