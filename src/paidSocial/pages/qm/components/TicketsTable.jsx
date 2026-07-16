import React from 'react';
import PropTypes from 'prop-types';
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
        { label: 'Operator Status', key: 'operatorStatus' },
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
        { label: 'Trafficker Comments', key: 'traffickerComments' },
        { label: 'QC Thread', key: 'qcThread' }
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
        { label: 'QC\'er', key: 'qcer' }
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
        { label: 'Operator', key: 'operator' }, // Main active assignment tracking column
        { label: 'Task Assigned Time', key: 'taskAssignedTime' },
        { label: 'Publish Date (Pst)', key: 'publishDate' },
        { label: 'Launching Prioritization', key: 'launchingPrioritization' },
        { label: 'Task Status', key: 'taskStatus' },
        { label: 'Socialite Notes', key: 'socialiteNotes' },
        { label: 'Trafficker Comments', key: 'traffickerComments' },
        { label: 'QC Thread', key: 'qcThread' },
        { label: 'QC\'er', key: 'qcer' },
        { label: 'QC Comments', key: 'qcComments' }
    ]
};

const TicketsTable = ({
    tickets = [],
    loading = false,
    activeStatus = 'all',
    operatorsList = ['Jane Doe', 'John Smith', 'Sarah Jenkins', 'Alex Smith'], // Placeholder names; pass via props from parent later
    onOperatorChange = () => { },
    onAutoAssign = () => { } // New prop callback for handling batch assignments
}) => {
    // Keep track of pending operator selections before submitting
    const [draftAssignments, setDraftAssignments] = React.useState({});

    // Reset draft assignments when changing tabs to prevent stale states
    React.useEffect(() => {
        setDraftAssignments({});
    }, [activeStatus]);

    if (loading) {
        return <div className="table-loading">Loading data from backend...</div>;
    }

    // Fallback cleanly to 'all' headers if the dynamic key isn't registered
    const currentColumns = COLUMN_MAP[activeStatus] || COLUMN_MAP.all;

    // Handles the selection of an operator locally
    const handleDraftOperatorChange = (ticketId, operatorValue) => {
        setDraftAssignments(prev => ({
            ...prev,
            [ticketId]: operatorValue === '-' ? undefined : operatorValue
        }));
        
        // Keeps original single-change prop firing if needed elsewhere
        onOperatorChange(ticketId, operatorValue);
    };

    // Filters and sends only valid draft assignments to the parent component
    const handleAutoAssignClick = () => {
        const assignmentsToSubmit = {};
        Object.entries(draftAssignments).forEach(([id, operator]) => {
            if (operator && operator !== '-') {
                assignmentsToSubmit[id] = operator;
            }
        });

        if (Object.keys(assignmentsToSubmit).length > 0) {
            onAutoAssign(assignmentsToSubmit);
            setDraftAssignments({}); // Clear drafts after submitting
        }
    };

    const hasDrafts = Object.values(draftAssignments).some(val => val && val !== '-');

    return (
        <div className="table-wrapper">
            {activeStatus === 'rttUnassigned' && (
                <div className="table-actions-sticky-container">
                    <div className="table-actions">
                        <button 
                            className="auto-assign-btn"
                            onClick={handleAutoAssignClick}
                            disabled={!hasDrafts}
                        >
                            Auto Assign
                        </button>
                    </div>
                </div>
            )}
            <table className="qm-table">
                <thead>
                    <tr>
                        {currentColumns.map((col, index) => (
                            <th key={index}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tickets.length === 0 ? (
                        <tr>
                            <td colSpan={currentColumns.length} className="no-data">
                                No tickets found matching this criteria.
                            </td>
                        </tr>
                    ) : (
                        tickets.map((ticket, tIdx) => (
                            <tr key={ticket.id || tIdx}>
                                {currentColumns.map((col, cIdx) => {
                                    const cellValue = ticket[col.key];


                                    // Style adjustments for Status text columns
                                    if (col.key === 'taskStatus' || col.key === 'qcStatus') {
                                        // Normalize the text value into a reliable CSS class suffix
                                        const statusKey = cellValue ? String(cellValue).toLowerCase().replace(/[^a-z0-9]/g, '') : '';

                                        return (
                                            <td key={cIdx}>
                                                <span className={`status-tag ${statusKey || 'default'}`}>
                                                    {cellValue || 'N/A'}
                                                </span>
                                            </td>
                                        );
                                    }

                                    // Render Operator Dropdown specifically for RTT Unassigned view
                                    if (col.key === 'operator' && activeStatus === 'rttUnassigned') {
                                        const draftValue = draftAssignments[ticket.id] !== undefined 
                                            ? draftAssignments[ticket.id] 
                                            : (cellValue || '-');

                                        return (
                                            <td key={cIdx}>
                                                <select
                                                    className="operator-dropdown"
                                                    value={draftValue}
                                                    onChange={(e) => handleDraftOperatorChange(ticket.id, e.target.value)}
                                                >
                                                    <option value="-">Select Operator</option>
                                                    {operatorsList.map((name, uIdx) => (
                                                        <option key={uIdx} value={name}>{name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        );
                                    }

                                    // Custom interactive layout for Operator column with audit history tooltip
                                    if (col.key === 'operator') {
                                        const historyData = ticket.history || [];
                                        return (
                                            <td key={cIdx} className="operator-cell-interactive">
                                                <div className="operator-history-tooltip-wrapper">
                                                    <span className="current-operator-text">
                                                        {cellValue !== undefined && cellValue !== null ? String(cellValue) : '-'}
                                                    </span>
                                                    <div className="history-tooltip-box">
                                                        <div className="tooltip-header">Assignment History</div>
                                                        {historyData.length === 0 ? (
                                                            <div className="tooltip-empty-state">No previous assignment history.</div>
                                                        ) : (
                                                            <ul className="tooltip-history-list">
                                                                {historyData.map((item, hIdx) => (
                                                                    <li key={hIdx} className="tooltip-history-item">
                                                                        <strong>{item.operator || 'Unknown'}</strong> 
                                                                        <span className="history-action"> ({item.action || 'Assigned'})</span>
                                                                        {item.timestamp && <span className="history-time"> - {item.timestamp}</span>}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={cIdx} className={col.key === 'campaignName' ? 'bold-text' : ''}>
                                            {cellValue !== undefined && cellValue !== null ? String(cellValue) : '-'}
                                        </td>
                                    );
                                })}
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
    activeStatus: PropTypes.string,
    operatorsList: PropTypes.arrayOf(PropTypes.string),
    onOperatorChange: PropTypes.func,
    onAutoAssign: PropTypes.func,
};

export default TicketsTable;