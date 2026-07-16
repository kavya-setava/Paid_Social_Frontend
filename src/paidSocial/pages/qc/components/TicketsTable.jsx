import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './TicketsTable.css';

const TicketsTable = ({
    tickets = [],
    loading = false,
    activeStatus = 'all',
    timers = {},
    onPauseTimer,
    onResumeTimer,
    onTaskStatusChange,
    onQcCommentsChange,
    isMyDashboard = false
}) => {
    const [editingQcEr, setEditingQcEr] = useState(null);
    const qcNames = ['Trupti', 'Divya', 'Kavya', 'Harika'];

    if (loading) {
        return <div className="table-loading">Loading data from backend...</div>;
    }

    // Function to get status class based on status value
    const getStatusClass = (status) => {
        const statusMap = {
            'All': 'status-all',
            'Unassigned': 'status-unassigned',
            'Ready to QC': 'status-ready-to-qc',
            'In QC': 'status-in-qc',
            'Rejected': 'status-rejected',
            'Trafficked': 'status-trafficked',
        };
        return statusMap[status] || 'status-default';
    };

    // Format time from seconds to HH:MM:SS
    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '00:00:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Define which columns to show based on active status
    const getColumnsForStatus = (status) => {
        const baseColumns = [
            'taskReceivedTime',
            'marketingCampaign',
            'campaignName',
            'adSetName',
            'adName',
            'highVisibilityTitles',
            'adTech',
            'taskType',
            'page',
            'platform',
            'region',
            'adFlightStart',
            'adFlightEnd',
            'operator',
            'taskAssignedTime',
            'publishDate',
            'launchingPrioritization',
            'taskStatus',
            'socialiteNotes',
            'traffickerComments',
            'qcThread',
            'qcEr',
        ];

        // For All tab (non MyDashboard)
        if (!isMyDashboard) {
            const columnsMap = {
                'all': [...baseColumns, 'qcStatus', 'qcComments'],
                'readyToQc': [...baseColumns, 'qcStatus', 'qcComments'],
                'inQc': [...baseColumns],
                'rejected': [...baseColumns, 'qcComments'],
                'trafficked': [...baseColumns, 'qcComments'],
            };
            return columnsMap[status] || columnsMap['all'];
        }

        // For My Dashboard tab
        const myDashboardColumnsMap = {
            'readyToQc': [...baseColumns, 'qcComments'],
            'inQc': [...baseColumns, 'timer', 'action', 'qcComments'],
            'rejected': [...baseColumns, 'qcComments'],
            'trafficked': [...baseColumns, 'qcComments'],
        };

        return myDashboardColumnsMap[status] || myDashboardColumnsMap['readyToQc'];
    };

    const columns = getColumnsForStatus(activeStatus);

    // Column display names mapping
    const columnLabels = {
        taskReceivedTime: 'Task Received Time',
        marketingCampaign: 'Marketing Campaign',
        campaignName: 'Campaign Name',
        adSetName: 'AdSet Name',
        adName: 'Ad Name',
        highVisibilityTitles: 'High-Visibility Titles',
        adTech: 'Ad-Tech',
        taskType: 'Task Type',
        page: 'Page',
        platform: 'Platform',
        region: 'Region',
        adFlightStart: 'AD Flight Start Date and time',
        adFlightEnd: 'AD Flight End Date and time',
        operator: 'Operator',
        taskAssignedTime: 'Task Assigned Time',
        publishDate: 'Publish Date (Pst)',
        launchingPrioritization: 'Launching Prioritization',
        taskStatus: 'Task Status',
        socialiteNotes: 'Socialite Notes',
        traffickerComments: 'Trafficker Comments',
        qcThread: 'QC Thread',
        qcEr: 'QC\'er',
        qcStatus: 'QC Status',
        qcComments: 'QC Comments',
        timer: 'Timer',
        action: 'Action',
    };

    const handleQcErChange = (ticketId, value) => {
        // Update the ticket's QC'er value
        console.log(`Assigning ${value} to ticket ${ticketId}`);
        setEditingQcEr(null);
    };

    // Check if we're in My Dashboard and In QC status
    const isMyDashboardInQc = isMyDashboard && activeStatus === 'inQc';

    return (
        <div className="table-wrapper">
            <table className="qc-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col}>{columnLabels[col] || col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tickets.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="no-data">
                                No tickets found matching this criteria.
                            </td>
                        </tr>
                    ) : (
                        tickets.map((ticket, index) => {
                            const timerData = timers[ticket.id] || { seconds: 0, isRunning: false };
                            const isInQc = ticket.taskStatus === 'In QC';

                            return (
                                <tr key={ticket.id || index}>
                                    {columns.map((col) => {
                                        if (col === 'taskStatus') {
                                            // For My Dashboard Ready to QC - show dropdown with In QC
                                            if (isMyDashboard && activeStatus === 'readyToQc') {
                                                return (
                                                    <td key={col}>
                                                        <select
                                                            className="status-dropdown"
                                                            value={ticket[col] || ''}
                                                            onChange={(e) => {
                                                                const newStatus = e.target.value;
                                                                if (newStatus && onTaskStatusChange) {
                                                                    onTaskStatusChange(ticket.id, newStatus, ticket.taskStatus);
                                                                }
                                                            }}
                                                        >
                                                            <option value="Ready to QC">Ready to QC</option>
                                                            <option value="In QC">In QC</option>
                                                        </select>
                                                    </td>
                                                );
                                            }

                                            // For My Dashboard In QC - show dropdown with Rejected, Trafficked
                                            if (isMyDashboard && activeStatus === 'inQc') {
                                                return (
                                                    <td key={col}>
                                                        <select
                                                            className="status-dropdown"
                                                            value={ticket[col] || ''}
                                                            onChange={(e) => {
                                                                const newStatus = e.target.value;
                                                                if (newStatus && onTaskStatusChange) {
                                                                    onTaskStatusChange(ticket.id, newStatus, ticket.taskStatus);
                                                                }
                                                            }}
                                                        >
                                                            <option value="In QC">In QC</option>
                                                            <option value="Rejected">Rejected</option>
                                                            <option value="Trafficked">Trafficked</option>
                                                        </select>
                                                    </td>
                                                );
                                            }

                                            // For My Dashboard Rejected - show as read-only
                                            if (isMyDashboard && activeStatus === 'rejected') {
                                                return (
                                                    <td key={col}>
                                                        <span className="status-tag status-rejected">
                                                            Rejected
                                                        </span>
                                                    </td>
                                                );
                                            }

                                            // For My Dashboard Trafficked - show as read-only
                                            if (isMyDashboard && activeStatus === 'trafficked') {
                                                return (
                                                    <td key={col}>
                                                        <span className="status-tag status-trafficked">
                                                            Trafficked
                                                        </span>
                                                    </td>
                                                );
                                            }

                                            // Default status display with tag
                                            return (
                                                <td key={col}>
                                                    <span className={`status-tag ${getStatusClass(ticket[col])}`}>
                                                        {ticket[col] || '-'}
                                                    </span>
                                                </td>
                                            );
                                        }

                                        if (col === 'qcStatus') {
                                            return (
                                                <td key={col}>
                                                    <span className={`status-tag ${getStatusClass(ticket[col])}`}>
                                                        {ticket[col] || '-'}
                                                    </span>
                                                </td>
                                            );
                                        }

                                        if (col === 'qcEr') {
                                            // In My Dashboard, show QC'er name without dropdown
                                            if (isMyDashboard) {
                                                return <td key={col}>{ticket[col] || '-'}</td>;
                                            }
                                            // In All tab, show dropdown only for Ready to QC
                                            if (activeStatus === 'readyToQc' && !isMyDashboard) {
                                                return (
                                                    <td key={col}>
                                                        <select
                                                            className="qc-er-dropdown"
                                                            value={ticket[col] || ''}
                                                            onChange={(e) => handleQcErChange(ticket.id, e.target.value)}
                                                            onBlur={() => setEditingQcEr(null)}
                                                        >
                                                            <option value="">Select QC'er</option>
                                                            {qcNames.map((name) => (
                                                                <option key={name} value={name}>
                                                                    {name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                );
                                            }
                                            return <td key={col}>{ticket[col] || '-'}</td>;
                                        }

                                        if (col === 'timer') {
                                            return (
                                                <td key={col} className="timer-cell">
                                                    <span className="timer-display">
                                                        {formatTime(timerData.seconds)}
                                                    </span>
                                                    <span className={`timer-status ${timerData.isRunning ? 'running' : 'paused'}`}>
                                                        {timerData.isRunning ? '▶' : '⏸'}
                                                    </span>
                                                </td>
                                            );
                                        }

                                        if (col === 'action') {
                                            return (
                                                <td key={col} className="action-cell">
                                                    {isInQc && (
                                                        <div className="action-buttons">
                                                            <button
                                                                className={`action-btn ${timerData.isRunning ? 'pause-btn' : 'resume-btn'}`}
                                                                onClick={() => {
                                                                    if (timerData.isRunning) {
                                                                        if (onPauseTimer) onPauseTimer(ticket.id);
                                                                    } else {
                                                                        if (onResumeTimer) onResumeTimer(ticket.id);
                                                                    }
                                                                }}
                                                            >
                                                                {timerData.isRunning ? '⏸ Pause' : '▶ Resume'}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {!isInQc && <span>-</span>}
                                                </td>
                                            );
                                        }

                                        if (col === 'qcComments') {
                                            // For In QC in My Dashboard - show input field
                                            if (isMyDashboard && activeStatus === 'inQc') {
                                                return (
                                                    <td key={col}>
                                                        <input
                                                            type="text"
                                                            className="qc-comments-input"
                                                            value={ticket[col] || ''}
                                                            onChange={(e) => {
                                                                if (onQcCommentsChange) {
                                                                    onQcCommentsChange(ticket.id, e.target.value);
                                                                }
                                                            }}
                                                            placeholder="Enter QC comments..."
                                                        />
                                                    </td>
                                                );
                                            }
                                            // For other statuses - show text
                                            return <td key={col}>{ticket[col] || '-'}</td>;
                                        }

                                        return <td key={col}>{ticket[col] || '-'}</td>;
                                    })}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};

TicketsTable.propTypes = {
    tickets: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            taskReceivedTime: PropTypes.string,
            marketingCampaign: PropTypes.string,
            campaignName: PropTypes.string,
            adSetName: PropTypes.string,
            adName: PropTypes.string,
            highVisibilityTitles: PropTypes.string,
            adTech: PropTypes.string,
            taskType: PropTypes.string,
            page: PropTypes.string,
            platform: PropTypes.string,
            region: PropTypes.string,
            adFlightStart: PropTypes.string,
            adFlightEnd: PropTypes.string,
            operator: PropTypes.string,
            taskAssignedTime: PropTypes.string,
            publishDate: PropTypes.string,
            launchingPrioritization: PropTypes.string,
            taskStatus: PropTypes.string,
            socialiteNotes: PropTypes.string,
            traffickerComments: PropTypes.string,
            qcThread: PropTypes.string,
            qcEr: PropTypes.string,
            qcStatus: PropTypes.string,
            qcComments: PropTypes.string,
        })
    ),
    loading: PropTypes.bool,
    activeStatus: PropTypes.string,
    timers: PropTypes.object,
    onPauseTimer: PropTypes.func,
    onResumeTimer: PropTypes.func,
    onTaskStatusChange: PropTypes.func,
    onQcCommentsChange: PropTypes.func,
    isMyDashboard: PropTypes.bool,
};

export default TicketsTable;