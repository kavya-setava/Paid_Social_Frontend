import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { qcApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList } from '../../../utils/tickets';
import { getUser } from '../../../api/session';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import useClientTable from '../../../hooks/useClientTable';
import { PaidSearch, PaidPagination } from '../../../components/PaidTableControls';
import './MyDashboard.css';

// The QC's individual dashboard — only tickets they claimed. Each tab maps to
// my QC tickets (current.qc = me) at a given status:
//   readyToQc -> claimed, not started yet  -> "Start QC" (begins timer, → In QC)
//   inQc      -> under review              -> Hold / Approve / Reject
//   onHold    -> I paused it              -> Resume
//   rejected  -> I rejected (read-only)
//   trafficked-> I approved (read-only)
const TAB_STATUS = {
    readyToQc: 'READY_TO_QC',
    inQc: 'IN_QC',
    onHold: 'ON_HOLD',
    rejected: 'REJECTED',
    trafficked: 'TRAFFICKED',
};
const ACTION_TABS = ['readyToQc', 'inQc', 'onHold'];

const MyDashboard = () => {
    const [activeStatus, setActiveStatus] = useState('readyToQc');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState({});
    const [busyId, setBusyId] = useState(null);
    const [qcers, setQcers] = useState([]);
    const [assigningId, setAssigningId] = useState(null);

    const myId = getUser()?.id || null;
    const statusRef = useRef(activeStatus);
    statusRef.current = activeStatus;

    const { query, setQuery, page, setPage, total, totalPages, pageRows } = useClientTable(tickets, 10);

    useEffect(() => {
        qcApi.getQcers().then((r) => setQcers(r?.data || [])).catch(() => setQcers([]));
    }, []);

    const loadList = useCallback(async () => {
        setLoading(true);
        try {
            const tab = statusRef.current;
            const query =
                tab === 'trafficked' ? { status: 'TRAFFICKED', ciCompleted: 'false' }
                    : tab === 'completed' ? { status: 'TRAFFICKED', ciCompleted: 'true' }
                        : { status: TAB_STATUS[tab] };
            const res = await qcApi.getMyTickets(query);
            setTickets(normalizeList(res?.data || []));
        } catch (err) {
            toastError(errMessage(err, 'Failed to load tickets'));
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCounts = useCallback(async () => {
        try {
            const [res, completed] = await Promise.all([
                qcApi.getMyTickets(), // counts scoped to current.qc = me
                qcApi.getMyTickets({ status: 'TRAFFICKED', ciCompleted: 'true', limit: 1 }),
            ]);
            const c = res?.counts || {};
            const completedCount = completed?.total ?? 0;
            setCounts({
                readyToQc: c.READY_TO_QC ?? 0,
                inQc: c.IN_QC ?? 0,
                onHold: c.ON_HOLD ?? 0,
                rejected: c.REJECTED ?? 0,
                trafficked: Math.max(0, (c.TRAFFICKED ?? 0) - completedCount),
                completed: completedCount,
            });
        } catch (_) { /* counts are best-effort */ }
    }, []);

    const refresh = useCallback(() => { loadList(); loadCounts(); }, [loadList, loadCounts]);

    useEffect(() => { refresh(); }, [activeStatus, refresh]);
    usePaidSocket(() => refresh());

    const run = (fn, msg) => async (...args) => {
        const id = args[0];
        setBusyId(id);
        try {
            await fn(...args);
            toastSuccess(msg);
            refresh();
        } catch (err) {
            toastError(errMessage(err, 'Action failed'));
        } finally {
            setBusyId(null);
        }
    };

    const actions = {
        onStart: run((id) => qcApi.start(id), 'QC started — timer running'),
        onApprove: run((id) => qcApi.approve(id), 'Approved & trafficked'),
        onReject: run((id, feedback) => qcApi.reject(id, feedback), 'Sent back for rework'),
        onHold: run((id, note) => qcApi.hold(id, 'HOLD', note), 'On hold — timer paused'),
        onResume: run((id) => qcApi.resume(id), 'Resumed — QC timer running'),
    };

    const handleAssignQc = async (id, qcId) => {
        if (!qcId) return;
        setAssigningId(id);
        try {
            await qcApi.assign(id, qcId);
            toastSuccess('Assigned to QCer');
            refresh();
        } catch (err) {
            toastError(errMessage(err, 'Could not assign QCer'));
        } finally {
            setAssigningId(null);
        }
    };

    return (
        <div className="my-dashboard-page">
            <StatusCards
                counts={counts}
                activeStatus={activeStatus}
                onStatusSelect={setActiveStatus}
                tabType="myDashboard"
            />
            <PaidSearch value={query} onChange={setQuery} />
            <TicketsTable
                tickets={pageRows}
                loading={loading}
                showActions={ACTION_TABS.includes(activeStatus)}
                busyId={busyId}
                myId={myId}
                actions={actions}
                assignable={activeStatus === 'readyToQc'}
                qcers={qcers}
                assigningId={assigningId}
                onAssignQc={handleAssignQc}
            />
            <PaidPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
        </div>
    );
};

export default MyDashboard;
