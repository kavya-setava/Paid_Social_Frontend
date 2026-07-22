import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zap } from 'lucide-react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { qmApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList, mapCounts, QM_TAB_QUERY } from '../../../utils/tickets';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import useClientTable from '../../../hooks/useClientTable';
import useOperators from '../../../hooks/useOperators';
import { PaidSearch, PaidPagination } from '../../../components/PaidTableControls';
import EditTicketModal from '../../../components/EditTicketModal';
import './Tickets.css';

const Tickets = () => {
    const [activeStatus, setActiveStatus] = useState('all');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState({});
    const [assigningId, setAssigningId] = useState(null);
    const [autoAssigning, setAutoAssigning] = useState(false);
    const [editTicket, setEditTicket] = useState(null);

    const activeStatusRef = useRef(activeStatus);
    activeStatusRef.current = activeStatus;

    // Client-side search (all columns) + 10-per-page pagination.
    const { query, setQuery, page, setPage, total, totalPages, pageRows } = useClientTable(tickets, 10);

    // Region agent roster — live-refreshes when anyone's presence changes.
    const operators = useOperators(() => qmApi.getOperators('AGENT'));

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const q = { ...QM_TAB_QUERY[activeStatusRef.current], limit: 200 };
            const res = await qmApi.getTickets(q);
            setTickets(normalizeList(res?.data || []));

            // Split combined counts the envelope can't break down on its own:
            // RTT → unassigned/assigned, and ON_HOLD → agent-held/QC-held.
            const base = mapCounts(res?.counts || {});
            try {
                const [un, holdAgent, holdQc, completed] = await Promise.all([
                    qmApi.getTickets({ status: 'RTT', assigned: 'false', limit: 1 }),
                    qmApi.getTickets({ status: 'ON_HOLD', holdReturn: 'IN_PROGRESS', limit: 1 }),
                    qmApi.getTickets({ status: 'ON_HOLD', holdReturn: 'IN_QC', limit: 1 }),
                    qmApi.getTickets({ status: 'TRAFFICKED', ciCompleted: 'true', limit: 1 }),
                ]);
                const unassigned = un?.total ?? 0;
                base.rttUnassigned = unassigned;
                base.rttAssigned = Math.max(0, (res?.counts?.RTT ?? 0) - unassigned);
                base.onHold = holdAgent?.total ?? 0;
                base.qcOnHold = holdQc?.total ?? 0;
                const completedCount = completed?.total ?? 0;
                base.completed = completedCount;
                base.trafficked = Math.max(0, (res?.counts?.TRAFFICKED ?? 0) - completedCount);
            } catch (_) { /* keep combined fallback */ }
            setCounts(base);
        } catch (err) {
            toastError(errMessage(err, 'Failed to load tickets'));
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [activeStatus, fetchTickets]);

    // Live refresh on any ticket event.
    usePaidSocket(() => fetchTickets());

    const handleAssign = async (ticketId, agentId) => {
        if (!agentId) return;
        setAssigningId(ticketId);
        try {
            await qmApi.assign(ticketId, agentId);
            toastSuccess('Ticket assigned to agent');
            fetchTickets();
        } catch (err) {
            toastError(errMessage(err, 'Could not assign ticket'));
        } finally {
            setAssigningId(null);
        }
    };

    const handleAutoAssign = async () => {
        setAutoAssigning(true);
        try {
            const res = await qmApi.autoAssign();
            if (res?.success) {
                toastSuccess(res.message || 'Tickets auto-assigned');
                fetchTickets();
            } else {
                toastError(res?.message || 'Auto-assign failed');
            }
        } catch (err) {
            toastError(errMessage(err, 'Auto-assign failed'));
        } finally {
            setAutoAssigning(false);
        }
    };

    return (
        <div className="tickets-page">
            <StatusCards
                counts={counts}
                activeStatus={activeStatus}
                onStatusSelect={setActiveStatus}
            />

            {activeStatus === 'rttUnassigned' && (
                <div className="ps-toolbar">
                    <button
                        type="button"
                        className="ps-auto-assign-btn"
                        disabled={autoAssigning}
                        onClick={handleAutoAssign}
                    >
                        <Zap size={15} />
                        {autoAssigning ? 'Auto assigning…' : 'Auto Assign'}
                    </button>
                </div>
            )}

            <PaidSearch value={query} onChange={setQuery} />

            <TicketsTable
                tickets={pageRows}
                loading={loading}
                activeStatus={activeStatus}
                operators={operators}
                assigningId={assigningId}
                onAssign={handleAssign}
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
