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
    const reqIdRef = useRef(0); // guards against stale (out-of-order) responses

    // Client-side search (all columns) + 10-per-page pagination.
    const { query, setQuery, page, setPage, total, totalPages, pageRows } = useClientTable(tickets, 10);

    // Region agent roster — live-refreshes when anyone's presence changes.
    const operators = useOperators(() => qmApi.getOperators('AGENT'));

    const fetchTickets = useCallback(async (silent = false) => {
        const reqId = ++reqIdRef.current;
        const tab = activeStatusRef.current;
        if (!silent) setLoading(true);
        try {
            const q = { ...QM_TAB_QUERY[tab], limit: 200, counts: 'false' };
            const [res, countsRes] = await Promise.all([
                qmApi.getTickets(q),
                qmApi.getCounts(),
            ]);
            // Ignore if the tab changed / a newer fetch started meanwhile.
            if (reqId !== reqIdRef.current || tab !== activeStatusRef.current) return;
            setTickets(normalizeList(res?.data || []));
            setCounts(countsRes?.counts || mapCounts(res?.counts || {}));
        } catch (err) {
            if (reqId === reqIdRef.current) {
                toastError(errMessage(err, 'Failed to load tickets'));
                setTickets([]);
            }
        } finally {
            if (reqId === reqIdRef.current && !silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [activeStatus, fetchTickets]);

    // Live refresh on any ticket event — silent (no loading flash).
    usePaidSocket(() => fetchTickets(true));

    const handleAssign = async (ticketId, agentId) => {
        if (!agentId) return;
        setAssigningId(ticketId);
        try {
            await qmApi.assign(ticketId, agentId);
            toastSuccess('Ticket assigned to agent');
            fetchTickets(true);
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
                fetchTickets(true);
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
