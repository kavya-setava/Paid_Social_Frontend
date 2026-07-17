import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { qcApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList } from '../../../utils/tickets';
import { getUser } from '../../../api/session';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
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

    const myId = getUser()?.id || null;
    const statusRef = useRef(activeStatus);
    statusRef.current = activeStatus;

    const loadList = useCallback(async () => {
        setLoading(true);
        try {
            const res = await qcApi.getMyTickets({ status: TAB_STATUS[statusRef.current] });
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
            const res = await qcApi.getMyTickets(); // counts scoped to current.qc = me
            const c = res?.counts || {};
            setCounts({
                readyToQc: c.READY_TO_QC ?? 0,
                inQc: c.IN_QC ?? 0,
                onHold: c.ON_HOLD ?? 0,
                rejected: c.REJECTED ?? 0,
                trafficked: c.TRAFFICKED ?? 0,
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

    return (
        <div className="my-dashboard-page">
            <StatusCards
                counts={counts}
                activeStatus={activeStatus}
                onStatusSelect={setActiveStatus}
                tabType="myDashboard"
            />
            <TicketsTable
                tickets={tickets}
                loading={loading}
                showActions={ACTION_TABS.includes(activeStatus)}
                busyId={busyId}
                myId={myId}
                actions={actions}
            />
        </div>
    );
};

export default MyDashboard;
