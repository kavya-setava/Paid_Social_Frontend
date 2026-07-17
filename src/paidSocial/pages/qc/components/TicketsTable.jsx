import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import QcActionCell from './QcActionCell';
import { statusClass, liveSeconds, fmtDuration, isTimerRunning } from '../../../utils/tickets';
import './TicketsTable.css';

const COLUMNS = [
    { key: 'ticketId', label: 'Ticket ID' },
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
    { key: 'adFlightStart', label: 'AD Flight Start' },
    { key: 'adFlightEnd', label: 'AD Flight End' },
    { key: 'operator', label: 'Operator' },
    { key: 'taskAssignedTime', label: 'Task Assigned Time' },
    { key: 'publishDate', label: 'Publish Date (PST)' },
    { key: 'launchingPrioritization', label: 'Launching Prioritization' },
    { key: 'taskStatus', label: 'Task Status' },
    { key: 'qcTime', label: 'QC Time' },
    { key: 'socialiteNotes', label: 'Socialite Notes' },
    { key: 'traffickerComments', label: 'Trafficker Comments' },
    { key: 'qcThread', label: 'QC Thread' },
    { key: 'qcer', label: "QC'er" },
    { key: 'qcComments', label: 'QC Comments' },
];

// QC tickets table used by both the ALL overview and My Dashboard.
const TicketsTable = ({
    tickets = [],
    loading = false,
    showActions = false,
    busyId = null,
    myId = null,
    actions = {},
}) => {
    const [, setNow] = useState(() => Date.now());
    useEffect(() => {
        const anyRunning = tickets.some((t) => isTimerRunning(t._ticket, 'qc'));
        if (!anyRunning) return undefined;
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, [tickets]);

    if (loading) {
        return <div className="table-loading">Loading tickets…</div>;
    }

    const colCount = COLUMNS.length + (showActions ? 1 : 0);

    const renderCell = (ticket, key) => {
        if (key === 'taskStatus') {
            return (
                <span className={`status-tag ${statusClass(ticket._raw?.status)}`}>
                    {ticket.taskStatus}
                </span>
            );
        }
        if (key === 'qcTime') {
            const raw = ticket._ticket;
            return (
                <span className={`ps-timer ${isTimerRunning(raw, 'qc') ? 'running' : ''}`}>
                    {fmtDuration(liveSeconds(raw, 'qc'))}
                </span>
            );
        }
        return ticket[key] || '—';
    };

    return (
        <div className="table-wrapper">
            <table className="qc-table">
                <thead>
                    <tr>
                        {COLUMNS.map((c) => <th key={c.key}>{c.label}</th>)}
                        {showActions && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {tickets.length === 0 ? (
                        <tr>
                            <td colSpan={colCount} className="no-data">No tickets found matching this criteria.</td>
                        </tr>
                    ) : (
                        tickets.map((ticket) => (
                            <tr key={ticket.id}>
                                {COLUMNS.map((c) => (
                                    <td key={c.key} className={c.key === 'campaignName' ? 'bold-text' : ''}>
                                        {renderCell(ticket, c.key)}
                                    </td>
                                ))}
                                {showActions && (
                                    <td>
                                        <QcActionCell
                                            ticket={ticket}
                                            myId={myId}
                                            busy={busyId === ticket.id}
                                            onPick={actions.onPick}
                                            onStart={actions.onStart}
                                            onApprove={actions.onApprove}
                                            onReject={actions.onReject}
                                            onHold={actions.onHold}
                                            onResume={actions.onResume}
                                        />
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
    tickets: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool,
    showActions: PropTypes.bool,
    busyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    myId: PropTypes.string,
    actions: PropTypes.object,
};

export default TicketsTable;
