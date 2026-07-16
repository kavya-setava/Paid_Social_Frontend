import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { qmApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList, mapCounts, QM_TAB_QUERY } from '../../../utils/tickets';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import './Tickets.css';

const Tickets = () => {
    const [activeStatus, setActiveStatus] = useState('all');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState({});
    const [operators, setOperators] = useState([]);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [assigningId, setAssigningId] = useState(null);

    const activeStatusRef = useRef(activeStatus);
    activeStatusRef.current = activeStatus;
    const searchRef = useRef(search);
    searchRef.current = search;

    // Load the region's agent roster once (for the assign dropdown).
    useEffect(() => {
        qmApi
            .getOperators('AGENT')
            .then((res) => setOperators(res?.data || []))
            .catch(() => setOperators([]));
    }, []);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const query = { ...QM_TAB_QUERY[activeStatusRef.current] };
            if (searchRef.current) query.search = searchRef.current;
            const res = await qmApi.getTickets(query);
            setTickets(normalizeList(res?.data || []));

            // Split the single RTT count into assigned / unassigned for the tabs.
            const base = mapCounts(res?.counts || {});
            try {
                const un = await qmApi.getTickets({ status: 'RTT', assigned: 'false', limit: 1 });
                const unassigned = un?.total ?? 0;
                base.rttUnassigned = unassigned;
                base.rttAssigned = Math.max(0, (res?.counts?.RTT ?? 0) - unassigned);
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
    }, [activeStatus, search, fetchTickets]);

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

    const submitSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput.trim());
    };

    return (
        <div className="tickets-page">
            <StatusCards
                counts={counts}
                activeStatus={activeStatus}
                onStatusSelect={setActiveStatus}
            />

            <form className="ps-search-bar" onSubmit={submitSearch}>
                <Search size={16} />
                <input
                    type="text"
                    placeholder="Search campaign, ticket ID, ad name, operator…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                {search && (
                    <button
                        type="button"
                        className="ps-search-clear"
                        onClick={() => { setSearchInput(''); setSearch(''); }}
                    >
                        Clear
                    </button>
                )}
                <button type="submit" className="ps-search-submit">Search</button>
            </form>

            <TicketsTable
                tickets={tickets}
                loading={loading}
                activeStatus={activeStatus}
                operators={operators}
                assigningId={assigningId}
                onAssign={handleAssign}
            />
        </div>
    );
};

export default Tickets;
