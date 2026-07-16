import React, { useState, useEffect, useCallback } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { qcApi, ticketApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList, STATUS } from '../../../utils/tickets';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import './All.css';

// QC region overview. There is no single "all QC tickets" endpoint, so we
// merge the common pool, my QC tickets and the region rework bucket, dedupe
// by id, and filter client-side by the selected tab.
const STATUS_BY_TAB = {
    readyToQc: STATUS.READY_TO_QC,
    inQc: STATUS.IN_QC,
    rejected: STATUS.REJECTED,
    trafficked: STATUS.TRAFFICKED,
};

const All = () => {
    const [activeStatus, setActiveStatus] = useState('all');
    const [allTickets, setAllTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [pool, mine, rework] = await Promise.all([
                qcApi.getPool().catch(() => ({})),
                qcApi.getMyTickets().catch(() => ({})),
                ticketApi.getRework('all').catch(() => ({})),
            ]);
            const merged = [
                ...(pool?.data || []),
                ...(mine?.data || []),
                ...(rework?.data || []),
            ];
            const seen = new Set();
            const unique = merged.filter((t) => {
                const id = t._id;
                if (seen.has(id)) return false;
                seen.add(id);
                return true;
            });
            setAllTickets(normalizeList(unique));
        } catch (err) {
            toastError(errMessage(err, 'Failed to load tickets'));
            setAllTickets([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);
    usePaidSocket(() => load());

    const run = (fn, msg) => async (...args) => {
        const id = args[0];
        setBusyId(id);
        try {
            await fn(...args);
            toastSuccess(msg);
            load();
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

    const counts = {
        all: allTickets.length,
        readyToQc: allTickets.filter((t) => t._raw?.status === STATUS.READY_TO_QC).length,
        inQc: allTickets.filter((t) => t._raw?.status === STATUS.IN_QC).length,
        rejected: allTickets.filter((t) => t._raw?.status === STATUS.REJECTED).length,
        trafficked: allTickets.filter((t) => t._raw?.status === STATUS.TRAFFICKED).length,
    };

    const visible =
        activeStatus === 'all'
            ? allTickets
            : allTickets.filter((t) => t._raw?.status === STATUS_BY_TAB[activeStatus]);

    return (
        <div className="all-page">
            <StatusCards
                counts={counts}
                activeStatus={activeStatus}
                onStatusSelect={setActiveStatus}
                tabType="all"
            />
            <TicketsTable
                tickets={visible}
                loading={loading}
                showActions
                busyId={busyId}
                actions={actions}
            />
        </div>
    );
};

export default All;
