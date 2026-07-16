import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { qcApi, ticketApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList } from '../../../utils/tickets';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import './MyDashboard.css';

// QC working queue. Each tab maps to a real endpoint:
//   readyToQc -> common pool (pickable)
//   inQc      -> my IN_QC / ON_HOLD tickets (approve / reject / hold / resume)
//   rejected  -> tickets I previously rejected (rework history, read-only)
//   trafficked-> my approved tickets (read-only)
const ACTION_TABS = ['readyToQc', 'inQc'];

const MyDashboard = () => {
    const [activeStatus, setActiveStatus] = useState('readyToQc');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [counts, setCounts] = useState({});
    const [busyId, setBusyId] = useState(null);

    const statusRef = useRef(activeStatus);
    statusRef.current = activeStatus;

    const loadList = useCallback(async () => {
        setLoading(true);
        try {
            const tab = statusRef.current;
            let res;
            if (tab === 'readyToQc') res = await qcApi.getPool();
            else if (tab === 'inQc') res = await qcApi.getMyTickets({ status: 'IN_QC,ON_HOLD' });
            else if (tab === 'rejected') res = await ticketApi.getRework('history');
            else res = await qcApi.getMyTickets({ status: 'TRAFFICKED' });
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
            const [pool, mine, history] = await Promise.all([
                qcApi.getPool({ limit: 1 }).catch(() => ({})),
                qcApi.getMyTickets().catch(() => ({})),
                ticketApi.getRework('history').catch(() => ({})),
            ]);
            setCounts({
                readyToQc: pool?.total ?? 0,
                inQc: (mine?.counts?.IN_QC ?? 0) + (mine?.counts?.ON_HOLD ?? 0),
                rejected: history?.total ?? (history?.data?.length ?? 0),
                trafficked: mine?.counts?.TRAFFICKED ?? 0,
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
        onPick: run((id) => qcApi.pick(id), 'Picked — QC timer running'),
        onApprove: run((id) => qcApi.approve(id), 'Approved & trafficked'),
        onReject: run((id, feedback, tags) => qcApi.reject(id, feedback, tags), 'Sent back for rework'),
        onHold: run((id) => qcApi.hold(id, 'HOLD'), 'On hold'),
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
                actions={actions}
            />
        </div>
    );
};

export default MyDashboard;
