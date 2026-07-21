import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { agentApi, ticketApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList, mapCounts } from '../../../utils/tickets';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import useClientTable from '../../../hooks/useClientTable';
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
  const [agents, setAgents] = useState([]);
  const [transferringId, setTransferringId] = useState(null);
  const [editTicket, setEditTicket] = useState(null);

  const statusRef = useRef(activeStatus);
  statusRef.current = activeStatus;

  const { query, setQuery, page, setPage, total, totalPages, pageRows } = useClientTable(tickets, 10);

  // Region agent roster for the RTT-Assigned transfer dropdown.
  useEffect(() => {
    agentApi.getAgents().then((r) => setAgents(r?.data || [])).catch(() => setAgents([]));
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await agentApi.getTickets({ ...(AGENT_TAB_QUERY[statusRef.current] || {}), limit: 200 });
      setTickets(normalizeList(res?.data || []));

      // ON_HOLD count from the envelope mixes agent + QC holds; split them.
      const base = mapCounts(res?.counts || {});
      try {
        const [holdAgent, holdQc, completed] = await Promise.all([
          agentApi.getTickets({ status: 'ON_HOLD', holdReturn: 'IN_PROGRESS', limit: 1 }),
          agentApi.getTickets({ status: 'ON_HOLD', holdReturn: 'IN_QC', limit: 1 }),
          agentApi.getTickets({ status: 'TRAFFICKED', ciCompleted: 'true', limit: 1 }),
        ]);
        base.onHold = holdAgent?.total ?? 0;
        base.qcOnHold = holdQc?.total ?? 0;
        const completedCount = completed?.total ?? 0;
        base.completed = completedCount;
        base.trafficked = Math.max(0, (res?.counts?.TRAFFICKED ?? 0) - completedCount);
      } catch (_) { /* keep combined fallback */ }
      setCounts(base);
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
  const run = (fn, successMsg) => async (...args) => {
    const id = args[0];
    setBusyId(id);
    try {
      await fn(...args);
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
    onHold: run((id, note) => agentApi.hold(id, 'HOLD', note), 'Ticket put on hold'),
    onResume: run((id) => agentApi.resume(id), 'Work resumed — timer running'),
    onSubmit: run((id, note) => agentApi.submit(id, note), 'Submitted to QC'),
  };

  // Inline save for agent-editable cells (QC Thread / Tactical Link).
  const handleFieldSave = async (id, key, value) => {
    try {
      await ticketApi.updateFields(id, { [key]: value });
      toastSuccess('Saved');
      fetchTickets();
    } catch (err) {
      toastError(errMessage(err, 'Could not save'));
    }
  };

  const handleTransfer = async (ticketId, agentId) => {
    if (!agentId) return;
    setTransferringId(ticketId);
    try {
      await agentApi.transfer(ticketId, agentId);
      toastSuccess('Ticket transferred to agent');
      fetchTickets();
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
        onFieldSave={handleFieldSave}
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
