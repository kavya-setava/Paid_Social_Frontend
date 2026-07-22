import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Info, Pencil } from 'lucide-react';
import WorkHistoryModal from '../../../components/WorkHistoryModal';
import { isUnavailable, operatorLabel } from '../../../utils/tickets';
import './TicketsTable.css';

// Column definition map mapping status keys directly to their exact requested column arrays
const COLUMN_MAP = {
    all: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        { label: 'Operator', key: 'operator' },
        // { label: 'Operator Status', key: 'operatorStatus' },
        { label: 'Operator Time Taken', key: 'operatorTimeTaken' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'Trafficker Comments', key: 'traffickerComments' },
        { label: 'QC Thread', key: 'qcThread' },
        { label: 'QC\'er', key: 'qcer' },
        { label: 'QC Status', key: 'qcStatus' },
        { label: 'QC Time Taken', key: 'qcTimeTaken' },
        { label: 'QC Comments', key: 'qcComments' }
    ],
    rttUnassigned: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        { label: 'Operator', key: 'operator' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        // { label: 'Trafficker Comments', key: 'traffickerComments' },
        // { label: 'QC Thread', key: 'qcThread' }
    ],
    rttAssigned: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        { label: 'Operator', key: 'operator' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'QC Thread', key: 'qcThread' }
    ],
    inProgress: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        { label: 'Operator', key: 'operator' },
        // { label: 'Operator Status', key: 'operatorStatus' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date (Pst)', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'QC Thread', key: 'qcThread' }
    ],
    onHold: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        { label: 'Operator', key: 'operator' },
        // { label: 'Operator Status', key: 'operatorStatus' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date (Pst)', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'Operator Comments', key: 'operatorComments' },
        { label: 'QC Thread', key: 'qcThread' }
    ],
    readyToQc: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        { label: 'Operator', key: 'operator' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date (Pst)', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'Trafficker Comments', key: 'traffickerComments' },
        { label: 'QC Thread', key: 'qcThread' },
        { label: 'QC\'er', key: 'qcer' }
    ],
    inQc: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        { label: 'Operator', key: 'operator' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date (Pst)', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'Trafficker Comments', key: 'traffickerComments' },
        { label: 'QC Thread', key: 'qcThread' },
        { label: 'QC\'er', key: 'qcer' }
    ],
    rejected: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        { label: 'Operator', key: 'operator' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date (Pst)', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'Trafficker Comments', key: 'traffickerComments' },
        { label: 'QC Thread', key: 'qcThread' },
        { label: 'QC\'er', key: 'qcer' },
        { label: 'QC Status', key: 'qcStatus' },
        { label: 'QC Comments', key: 'qcComments' }
    ],
    trafficked: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        { label: 'Operator', key: 'operator' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date (Pst)', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'Trafficker Comments', key: 'traffickerComments' },
        { label: 'QC Thread', key: 'qcThread' },
        { label: 'QC\'er', key: 'qcer' },
        { label: 'QC Status', key: 'qcStatus' }
    ],
    rework: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        // { label: 'Operator1', key: 'operator1' }, // Operator dropdown for assignment
        // { label: 'Operator2', key: 'operator2' }, // Operator dropdown for assignment
        // { label: 'Operator Status', key: 'operatorStatus' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date (Pst)', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'Trafficker Comments', key: 'traffickerComments' },
        { label: 'QC Thread', key: 'qcThread' },
        { label: 'QC\'er', key: 'qcer' },
        { label: 'QC Status', key: 'qcStatus' },
        { label: 'QC Comments', key: 'qcComments' }
    ],
    // CI-completed tickets (normal flow) — same columns as Trafficked.
    completed: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        { label: 'Operator', key: 'operator' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date (Pst)', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'Trafficker Comments', key: 'traffickerComments' },
        { label: 'QC Thread', key: 'qcThread' },
        { label: "QC'er", key: 'qcer' },
        { label: 'QC Status', key: 'qcStatus' },
    ],
    // Tickets a QC put on hold (holdReturn = IN_QC).
    qcOnHold: [
        { label: 'Task Received Time', key: 'taskReceivedTime' },
        { label: 'Marketing Campaign', key: 'marketingCampaign' },
        { label: 'Campaign Name', key: 'campaignName' },
        { label: 'AdSet Name', key: 'adSetName' },
        { label: 'Ad Name', key: 'adName' },
        { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
        { label: 'Ad- Tech', key: 'adTech' },
        { label: 'Task Type', key: 'taskType' },
        { label: 'Page', key: 'page' },
        { label: 'Platform', key: 'platform' },
        { label: 'Region', key: 'region' },
        { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
        { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
        { label: 'Operator', key: 'operator' },
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date (Pst)', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'QC Thread', key: 'qcThread' },
        { label: 'QC\'er', key: 'qcer' },
        { label: 'QC Comments', key: 'qcComments' }
    ]
};

// Injects the Country column (right of Region) and Socialite Link column
// (right of Ad Name) into any column list — so every tab gets them without
// editing each array above.
const injectColumns = (cols, activeStatus) => {
    const out = [];
    cols.forEach((c) => {
        out.push(c);
        if (c.key === 'adName') out.push({ label: 'Socialite Link', key: 'socialiteLink' });
        if (c.key === 'region') out.push({ label: 'Country', key: 'country' });
        if (c.key === 'qcThread') out.push({ label: 'Tactical Link', key: 'tacticalLink' });
    });
    // Dedicated "Rejected Type" column on the All + Rework tabs (QM view).
    if (activeStatus === 'all' || activeStatus === 'rework') {
        out.push({ label: 'Rejected Type', key: 'rejectionType' });
    }
    return out;
};

// Rows on these tabs get a per-ticket Edit pencil.
const EDITABLE_TABS = ['all', 'trafficked'];

// Operator cell becomes an assign/reassign dropdown on the RTT tabs.
const ASSIGNABLE_TABS = ['rttUnassigned', 'rttAssigned'];

const TicketsTable = ({
    tickets = [],
    loading = false,
    activeStatus = 'all',
    operators = [],            // [{ _id, name, isOnBreak }]
    assigningId = null,
    onAssign = () => { },
    onEdit = null,             // (ticket) => void — enables the Edit pencil
}) => {
    // "i" history popup — { ticketId, role, title } or null.
    const [history, setHistory] = useState(null);

    if (loading) {
        return <div className="table-loading">Loading tickets…</div>;
    }

    // Fallback cleanly to 'all' headers if the dynamic key isn't registered.
    const currentColumns = injectColumns(COLUMN_MAP[activeStatus] || COLUMN_MAP.all, activeStatus);
    const canAssign = ASSIGNABLE_TABS.includes(activeStatus);
    const showHistoryIcons = activeStatus === 'all';
    const showEdit = !!onEdit && EDITABLE_TABS.includes(activeStatus);

    // A name cell that (on the All tab) carries an "i" icon opening the
    // per-person work-time history for that role.
    const renderPeopleCell = (ticket, cIdx, value, role) => (
        <td key={cIdx}>
            <span className="wh-cell">
                {value || '-'}
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
        </td>
    );

    return (
        <div className="table-wrapper">
            <table className="qm-table">
                <thead>
                    <tr>
                        {showEdit && <th>Edit</th>}
                        {currentColumns.map((col, index) => (
                            <th key={index}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tickets.length === 0 ? (
                        <tr>
                            <td colSpan={currentColumns.length + (showEdit ? 1 : 0)} className="no-data">
                                No tickets found matching this criteria.
                            </td>
                        </tr>
                    ) : (
                        tickets.map((ticket, tIdx) => (
                            <tr key={ticket.id || tIdx}>
                                {showEdit && (
                                    <td>
                                        <button type="button" className="ps-edit-btn" title="Edit ticket" onClick={() => onEdit(ticket)}>
                                            <Pencil size={14} />
                                        </button>
                                    </td>
                                )}
                                {currentColumns.map((col, cIdx) => {
                                    const cellValue = ticket[col.key];

                                    // Status text columns → colored pill.
                                    if (col.key === 'taskStatus' || col.key === 'qcStatus') {
                                        const statusKey = cellValue ? String(cellValue).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                                        return (
                                            <td key={cIdx}>
                                                <span className={`status-tag ${statusKey || 'default'}`}>
                                                    {cellValue || 'N/A'}
                                                </span>
                                            </td>
                                        );
                                    }

                                    // Assign/reassign dropdown on the RTT tabs.
                                    if (col.key === 'operator' && canAssign) {
                                        const isAssigning = assigningId === ticket.id;
                                        return (
                                            <td key={cIdx}>
                                                <select
                                                    className="operator-dropdown"
                                                    value={ticket.agentId || ''}
                                                    disabled={isAssigning}
                                                    onChange={(e) => onAssign(ticket.id, e.target.value)}
                                                >
                                                    <option value="">
                                                        {isAssigning ? 'Assigning…' : 'Select Operator'}
                                                    </option>
                                                    {operators.map((op) => (
                                                        <option key={op._id} value={op._id} disabled={isUnavailable(op)}>
                                                            {operatorLabel(op)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        );
                                    }

                                    // Operator / QC'er cells get the "i" history icon on the All tab.
                                    if (col.key === 'operator') return renderPeopleCell(ticket, cIdx, cellValue, 'AGENT');
                                    if (col.key === 'qcer') return renderPeopleCell(ticket, cIdx, cellValue, 'QC');

                                    // Link-style columns → show "Link" when the value is a URL.
                                    if (col.key === 'socialiteLink' || col.key === 'tacticalLink' || col.key === 'qcThread') {
                                        const isUrl = cellValue && /^https?:\/\//i.test(cellValue);
                                        return (
                                            <td key={cIdx}>
                                                {!cellValue ? '-' : isUrl ? (
                                                    <a className="ps-link" href={cellValue} target="_blank" rel="noreferrer">
                                                        Link
                                                    </a>
                                                ) : String(cellValue)}
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={cIdx} className={col.key === 'campaignName' ? 'bold-text' : ''}>
                                            {cellValue !== undefined && cellValue !== null && cellValue !== '' ? String(cellValue) : '-'}
                                        </td>
                                    );
                                })}
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
    operators: PropTypes.arrayOf(PropTypes.object),
    assigningId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onAssign: PropTypes.func,
    onEdit: PropTypes.func,
};

export default TicketsTable;