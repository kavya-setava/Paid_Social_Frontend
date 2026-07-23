import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { agentApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList, mapCounts } from '../../../utils/tickets';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import useClientTable from '../../../hooks/useClientTable';
import useOperators from '../../../hooks/useOperators';
import { PaidSearch, PaidPagination } from '../../../components/PaidTableControls';
import EditTicketModal from '../../../components/EditTicketModal';
import './Tickets.css';

const AGENT_TAB_QUERY = {
  all: {},
  rttAssigned: { status: 'RTT' },
  inProgress: { status: 'IN_PROGRESS' },
  onHold: { status: 'ON_HOLD', holdReturn: 'IN_PROGRESS' },
  qcOnHold: { status: 'ON_HOLD', holdReturn: 'IN_QC' },
  readyToQc: { status: 'READY_TO_QC' },
  inQc: { status: 'IN_QC' },
  rejected: { status: 'REJECTED' },
  rework: { status: 'REJECTED' },
  trafficked: { status: 'TRAFFICKED', ciCompleted: 'false' },
  completed: { status: 'TRAFFICKED', ciCompleted: 'true' },
};

const Tickets = () => {
  const [activeStatus, setActiveStatus] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [transferringId, setTransferringId] = useState(null);
  const [editTicket, setEditTicket] = useState(null);

  const statusRef = useRef(activeStatus);
  statusRef.current = activeStatus;
  const reqIdRef = useRef(0); // guards against stale (out-of-order) responses

  const { query, setQuery, page, setPage, total, totalPages, pageRows } = useClientTable(tickets, 10);
  // Region agent roster (transfer dropdown) — live-refreshes on presence change.
  const agents = useOperators(() => agentApi.getAgents());

  const fetchTickets = useCallback(async (silent = false) => {
    const reqId = ++reqIdRef.current;
    const tab = statusRef.current;
    if (!silent) setLoading(true);
    try {
      const [res, countsRes] = await Promise.all([
        agentApi.getTickets({ ...(AGENT_TAB_QUERY[tab] || {}), limit: 200, counts: 'false' }),
        agentApi.getCounts(),
      ]);
      if (reqId !== reqIdRef.current || tab !== statusRef.current) return; // stale
      setTickets(normalizeList(res?.data || []));
      setCounts(countsRes?.counts || mapCounts(res?.counts || {}));
    } catch (err) {
      if (reqId === reqIdRef.current) {
        toastError(errMessage(err, 'Failed to load your tickets'));
        setTickets([]);
      }
    } finally {
      if (reqId === reqIdRef.current && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [activeStatus, fetchTickets]);
  usePaidSocket(() => fetchTickets(true));

  // Wrap a lifecycle action with busy state, toast + refresh.
  const run = (fn, successMsg) => async (...args) => {
    const id = args[0];
    setBusyId(id);
    try {
      await fn(...args);
      toastSuccess(successMsg);
      fetchTickets(true);
    } catch (err) {
      toastError(errMessage(err, 'Action failed'));
    } finally {
      setBusyId(null);
    }
  };

  const actions = {
    onStart: run((id) => agentApi.start(id), 'Work started — timer running'),
    onHold: run((id, note) => agentApi.hold(id, 'HOLD', note), 'Ticket put on hold'),
    onResume: run((id) => agentApi.resume(id), 'Work resumed — timer running'),
    onSubmit: run((id, note, qcThread, tacticalLink) => agentApi.submit(id, note, qcThread, tacticalLink), 'Submitted to QC'),
  };

  const handleTransfer = async (ticketId, agentId) => {
    if (!agentId) return;
    setTransferringId(ticketId);
    try {
      await agentApi.transfer(ticketId, agentId);
      toastSuccess('Ticket transferred to agent');
      fetchTickets(true);
    } catch (err) {
      toastError(errMessage(err, 'Could not transfer ticket'));
    } finally {
      setTransferringId(null);
    }
  };

  return (
    <div className="tickets-page">
      <StatusCards counts={counts} activeStatus={activeStatus} onStatusSelect={setActiveStatus} />
      <PaidSearch value={query} onChange={setQuery} />
      <TicketsTable
        tickets={pageRows}
        loading={loading}
        activeStatus={activeStatus}
        mode="mine"
        busyId={busyId}
        actions={actions}
        agents={agents}
        transferringId={transferringId}
        onTransfer={handleTransfer}
        onEdit={setEditTicket}
      />
      <PaidPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />

      {editTicket && (
        <EditTicketModal
          ticket={editTicket}
          onClose={() => setEditTicket(null)}
          onSaved={fetchTickets}
        />
      )}
    </div>
  );
};

export default Tickets;
