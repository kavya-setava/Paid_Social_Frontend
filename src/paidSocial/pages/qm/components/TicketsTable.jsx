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
        { label: 'Operator Status', key: 'operatorStatus' },
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
        { label: 'Operator Status', key: 'operatorStatus' },
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
        { label: 'Operator1', key: 'operator1' }, // Operator dropdown for assignment
        { label: 'Operator2', key: 'operator2' }, // Operator dropdown for assignment
        { label: 'Operator Status', key: 'operatorStatus' },
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
    ]
};

const TicketsTable = ({
    tickets = [],
    loading = false,
    activeStatus = 'all',
    operatorsList = ['Jane Doe', 'John Smith', 'Sarah Jenkins', 'Alex Smith'], // Placeholder names; pass via props from parent later
    onOperatorChange = () => { }
}) => {
    if (loading) {
        return <div className="table-loading">Loading data from backend...</div>;
    }

    // Fallback cleanly to 'all' headers if the dynamic key isn't registered
    const currentColumns = COLUMN_MAP[activeStatus] || COLUMN_MAP.all;

    return (
        <div className="table-wrapper">
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
                                        return (
                                            <td key={cIdx}>
                                                <select
                                                    className="operator-dropdown"
                                                    value={cellValue || '-'}
                                                    onChange={(e) => onOperatorChange(ticket.id, e.target.value)}
                                                >
                                                    <option value="-">Select Operator</option>
                                                    {operatorsList.map((name, uIdx) => (
                                                        <option key={uIdx} value={name}>{name}</option>
                                                    ))}
                                                </select>
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
};

export default TicketsTable;