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
  { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
  { label: 'Original Operator', key: 'originalOperator' }, // Read-only
  { label: 'Assign Operator', key: 'operator' }, // Dropdown
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
  { label: 'QC Comments', key: 'qcComments' },
  { label: 'Rework Reason', key: 'reworkReason' }
];

// Mock options for the Assign Operator dropdown
const OPERATOR_OPTIONS = ['Unassigned', 'Alex Smith', 'Jane Doe', 'John Rogers', 'Sarah Jenkins'];

const Rework = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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
          originalOperator: 'Alex Smith',
          operator: 'Jane Doe',
          operatorStatus: 'assigned', // used for status styling demo
          taskAssignedTime: '2026-07-16 11:15',
          publishDate: '2026-07-20',
          launchingPrioritization: 'High',
          taskStatus: 'inprogress', 
          socialiteNotes: 'Needs copy update.',
          traffickerComments: 'Updated text layout.',
          qcThread: 'QC-9843',
          qcer: 'Sarah Jenkins',
          qcStatus: 'rejected',
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

    // 1. Assign Operator dropdown logic
    if (column.key === 'operator') {
      return (
        <select
          className="operator-dropdown"
          value={val || ''}
          onChange={(e) => handleOperatorChange(task.id, e.target.value)}
        >
          {OPERATOR_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    // 2. Status styling applied to fields containing status labels
    if (column.key === 'taskStatus' || column.key === 'qcStatus' || column.key === 'operatorStatus') {
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