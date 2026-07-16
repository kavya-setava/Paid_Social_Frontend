import React, { useState, useEffect } from 'react';
import './Rework.css';

const REWORK_COLUMNS = [
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
  { label: 'AD Flight End Date and time', key: 'adFlightEnd' },// Read-only
  { label: 'Operator', key: 'operator' }, // Dropdown
  { label: 'Task Assigned Time', key: 'taskAssignedTime' },
  { label: 'Publish Date (Pst)', key: 'publishDate' },
  { label: 'Launching Prioritization', key: 'launchingPrioritization' },
  { label: 'Task Status', key: 'taskStatus' },
  { label: 'Socialite Notes', key: 'socialiteNotes' },
  { label: 'Trafficker Comments', key: 'traffickerComments' },
  { label: 'QC Thread', key: 'qcThread' },
  { label: 'QC\'er', key: 'qcer' },
  { label: 'QC Comments', key: 'qcComments' },
  { label: 'Rework Reason', key: 'reworkReason' }
];

// Mock options for the Assign Operator dropdown
const OPERATOR_OPTIONS = ['Unassigned', 'Alex Smith', 'Jane Doe', 'John Rogers', 'Sarah Jenkins'];

const Rework = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHistoryTaskId, setActiveHistoryTaskId] = useState(null);

  // Simulating API fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      // Sample item containing matches for your keys
      setTasks([
        {
          id: 1,
          taskReceivedTime: '2026-07-16 10:00',
          marketingCampaign: 'Summer Sale 2026',
          campaignName: 'SU26_Brand_Awareness',
          adSetName: 'US_Target_18-35',
          adName: 'Video_Asset_01',
          highVisibilityTitles: 'Yes',
          adTech: 'Meta Ads Manager',
          taskType: 'Creative Refresh',
          page: 'Brand Main Page',
          platform: 'Instagram',
          region: 'NAMER',
          adFlightStart: '2026-07-20 00:00',
          adFlightEnd: '2026-08-20 23:59',
          operator: 'Jane Doe',
          taskAssignedTime: '2026-07-16 11:15',
          publishDate: '2026-07-20',
          launchingPrioritization: 'High',
          taskStatus: 'inprogress',
          socialiteNotes: 'Needs copy update.',
          traffickerComments: 'Updated text layout.',
          qcThread: 'QC-9843',
          qcer: 'Sarah Jenkins',
          qcComments: 'Fix typography alignment.',
          reworkReason: 'Text overlap on mobile view'
        }
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleOperatorChange = (taskId, newOperator) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, operator: newOperator } : task
      )
    );
    // Add logic here to sync update with back-end database if necessary
  };

  // Helper method to format status text and find appropriate CSS class matching requirements
  const getStatusClass = (status) => {
    if (!status) return 'default';
    const cleanStatus = status.toLowerCase().replace(/\s+/g, '');

    // Whitelist matches to your CSS definition
    const validClasses = ['open', 'rttunassigned', 'progress', 'rttassigned', 'inprogress', 'onhold', 'readytoqc', 'inqc', 'rejected', 'done', 'trafficked'];
    return validClasses.includes(cleanStatus) ? cleanStatus : 'default';
  };

  const renderCellContent = (task, column) => {
    const val = task[column.key];

    // 1. Assign Operator dropdown logic with interactive click history popover
    if (column.key === 'operator') {
      const historyData = task.history || [];
      const isHistoryOpen = activeHistoryTaskId === task.id;

      return (
        <div className="operator-cell-container">
          <div className="operator-interactive-row">
            <select
              className="operator-dropdown"
              value={val || ''}
              onChange={(e) => handleOperatorChange(task.id, e.target.value)}
            >
              {OPERATOR_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <button
              type="button"
              className={`history-trigger-btn ${isHistoryOpen ? 'active' : ''}`}
              title="View Assignment History"
              onClick={() => setActiveHistoryTaskId(isHistoryOpen ? null : task.id)}
            >
              <span className="info-icon-graphic">ℹ</span>
            </button>
          </div>

          {isHistoryOpen && (
            <div className="history-popover-card">
              <div className="popover-header">
                <span>Assignment History</span>
                <button
                  className="popover-close-btn"
                  onClick={() => setActiveHistoryTaskId(null)}
                >
                  &times;
                </button>
              </div>
              {historyData.length === 0 ? (
                <div className="popover-empty-state">No previous assignment history.</div>
              ) : (
                <ul className="popover-history-list">
                  {historyData.map((item, hIdx) => (
                    <li key={hIdx} className="popover-history-item">
                      <strong>{item.operator || 'Unknown'}</strong>
                      <span className="popover-action"> ({item.action || 'Assigned'})</span>
                      {item.timestamp && <span className="popover-time"><br />{item.timestamp}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      );
    }

    // 2. Status styling applied to fields containing status labels
    if (column.key === 'taskStatus') {
      return (
        <span className={`status-tag ${getStatusClass(val)}`}>
          {val ? val.toUpperCase() : 'N/A'}
        </span>
      );
    }

    // 3. Highlight critical fields using structural bolding properties
    if (column.key === 'campaignName' || column.key === 'reworkReason') {
      return <span className="bold-text">{val}</span>;
    }

    return val || '—';
  };

  return (
    <div className="rework-container">
      <h2 className="rework-title">Rework Queue</h2>

      <div className="table-wrapper">
        <table className="qm-table">
          <thead>
            <tr>
              {REWORK_COLUMNS.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={REWORK_COLUMNS.length} className="table-loading">
                  Loading tasks...
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={REWORK_COLUMNS.length} className="no-data">
                  No Rework Tasks Found
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  {REWORK_COLUMNS.map((col) => (
                    <td key={col.key}>
                      {renderCellContent(task, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Rework;

