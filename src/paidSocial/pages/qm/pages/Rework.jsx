import React, { useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import { qmApi, ticketApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList } from '../../../utils/tickets';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import WorkHistoryModal from '../../../components/WorkHistoryModal';
import './Rework.css';

const REWORK_COLUMNS = [
  { label: 'Task Received Time', key: 'taskReceivedTime' },
  { label: 'Marketing Campaign', key: 'marketingCampaign' },
  { label: 'Campaign Name', key: 'campaignName' },
  { label: 'AdSet Name', key: 'adSetName' },
  { label: 'Ad Name', key: 'adName' },
  { label: 'Socialite Link', key: 'socialiteLink' },
  { label: 'High-Visibility Titles', key: 'highVisibilityTitles' },
  { label: 'Ad- Tech', key: 'adTech' },
  { label: 'Task Type', key: 'taskType' },
  { label: 'Page', key: 'page' },
  { label: 'Platform', key: 'platform' },
  { label: 'Region', key: 'region' },
  { label: 'Country', key: 'country' },
  { label: 'AD Flight Start Date and time', key: 'adFlightStart' },
  { label: 'AD Flight End Date and time', key: 'adFlightEnd' },
  { label: 'Original Operator', key: 'originalOperator' }, // + agent history icon
  { label: 'Assign Operator', key: 'operator' }, // Dropdown
  { label: 'Task Assigned Time', key: 'taskAssignedTime' },
  { label: 'Publish Date (Pst)', key: 'publishDate' },
  { label: 'Launching Prioritization', key: 'launchingPrioritization' },
  { label: 'Task Status', key: 'taskStatus' },
  { label: 'Socialite Notes', key: 'socialiteNotes' },
  { label: 'Trafficker Comments', key: 'traffickerComments' },
  { label: 'QC Thread', key: 'qcThread' },
  { label: "QC'er", key: 'qcer' }, // + QC history icon
  { label: 'QC Status', key: 'qcStatus' },
  { label: 'QC Comments', key: 'qcComments' },
];

const Rework = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operators, setOperators] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [history, setHistory] = useState(null); // { ticketId, role, title }

  useEffect(() => {
    qmApi
      .getOperators('AGENT')
      .then((res) => setOperators(res?.data || []))
      .catch(() => setOperators([]));
  }, []);

  const fetchRework = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getRework('all');
      setTasks(normalizeList(res?.data || []));
    } catch (err) {
      toastError(errMessage(err, 'Failed to load rework queue'));
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRework(); }, [fetchRework]);
  usePaidSocket(() => fetchRework());

  const handleAssign = async (ticketId, agentId) => {
    if (!agentId) return;
    setAssigningId(ticketId);
    try {
      await qmApi.assign(ticketId, agentId, 'Rework reassignment');
      toastSuccess('Rework assigned to agent');
      fetchRework();
    } catch (err) {
      toastError(errMessage(err, 'Could not assign rework'));
    } finally {
      setAssigningId(null);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'default';
    return status.toLowerCase().replace(/[^a-z0-9]/g, '') || 'default';
  };

  // A name cell carrying an "i" icon that opens the per-person work history.
  const peopleCell = (task, value, role) => (
    <span className="wh-cell">
      {value || '—'}
      <button
        type="button"
        className="wh-info-btn"
        title={`View ${role === 'AGENT' ? 'agent' : 'QC'} time history`}
        onClick={() => setHistory({
          ticketId: task.id,
          role,
          title: `${role === 'AGENT' ? 'Agent' : 'QC'} history — ${task.ticketId || ''}`,
        })}
      >
        <Info size={12} />
      </button>
    </span>
  );

  const renderCellContent = (task, column) => {
    const val = task[column.key];

    if (column.key === 'operator') {
      const isAssigning = assigningId === task.id;
      return (
        <select
          className="operator-dropdown"
          value={task.agentId || ''}
          disabled={isAssigning}
          onChange={(e) => handleAssign(task.id, e.target.value)}
        >
          <option value="">{isAssigning ? 'Assigning…' : 'Assign operator'}</option>
          {operators.map((op) => (
            <option key={op._id} value={op._id} disabled={op.isOnBreak}>
              {op.name}{op.isOnBreak ? ' (on break)' : ''}
            </option>
          ))}
        </select>
      );
    }

    if (column.key === 'originalOperator') return peopleCell(task, val, 'AGENT');
    if (column.key === 'qcer') return peopleCell(task, val, 'QC');

    if (column.key === 'socialiteLink') {
      return val
        ? <a className="ps-link" href={val} target="_blank" rel="noreferrer">Link</a>
        : '—';
    }

    if (column.key === 'taskStatus' || column.key === 'qcStatus') {
      return (
        <span className={`status-tag ${getStatusClass(val)}`}>
          {val ? String(val).toUpperCase() : 'N/A'}
        </span>
      );
    }

    if (column.key === 'campaignName') {
      return <span className="bold-text">{val || '—'}</span>;
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
                  Loading rework…
                </td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={REWORK_COLUMNS.length} className="no-data">
                  No rework tickets found.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id}>
                  {REWORK_COLUMNS.map((col) => (
                    <td key={col.key}>{renderCellContent(task, col)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

export default Rework;
