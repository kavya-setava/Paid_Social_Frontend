import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { agentApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList, mapCounts } from '../../../utils/tickets';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import './Tickets.css';

const AGENT_TAB_QUERY = {
  all: {},
  rttAssigned: { status: 'RTT' },
  inProgress: { status: 'IN_PROGRESS' },
  onHold: { status: 'ON_HOLD' },
  readyToQc: { status: 'READY_TO_QC' },
  inQc: { status: 'IN_QC' },
  rejected: { status: 'REJECTED' },
  rework: { status: 'REJECTED' },
  trafficked: { status: 'TRAFFICKED' },
};

const Tickets = () => {
  const [activeStatus, setActiveStatus] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({});
  const [busyId, setBusyId] = useState(null);

  const statusRef = useRef(activeStatus);
  statusRef.current = activeStatus;

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentApi.getTickets(AGENT_TAB_QUERY[statusRef.current] || {});
      setTickets(normalizeList(res?.data || []));
      setCounts(mapCounts(res?.counts || {}));
    } catch (err) {
      toastError(errMessage(err, 'Failed to load your tickets'));
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [activeStatus, fetchTickets]);
  usePaidSocket(() => fetchTickets());

  // Wrap a lifecycle action with busy state, toast + refresh.
  const run = (fn, successMsg) => async (id) => {
    setBusyId(id);
    try {
      await fn(id);
      toastSuccess(successMsg);
      fetchTickets();
    } catch (err) {
      toastError(errMessage(err, 'Action failed'));
    } finally {
      setBusyId(null);
    }
  };

  const actions = {
    onStart: run((id) => agentApi.start(id), 'Work started — timer running'),
    onHold: run((id) => agentApi.hold(id, 'HOLD'), 'Ticket put on hold'),
    onResume: run((id) => agentApi.resume(id), 'Work resumed — timer running'),
    onSubmit: run((id) => agentApi.submit(id), 'Submitted to QC'),
  };

  return (
    <div className="tickets-page">
      <StatusCards counts={counts} activeStatus={activeStatus} onStatusSelect={setActiveStatus} />
      <TicketsTable
        tickets={tickets}
        loading={loading}
        activeStatus={activeStatus}
        mode="mine"
        busyId={busyId}
        actions={actions}
      />
    </div>
  );
};

export default Tickets;
