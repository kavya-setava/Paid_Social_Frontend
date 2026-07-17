import React, { useState, useEffect, useCallback } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { qcApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList, STATUS } from '../../../utils/tickets';
import { getUser } from '../../../api/session';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import './All.css';

// Shared QC board — visible to every QC. Shows all region tickets in a QC stage
// (Ready to QC / In QC / On Hold by a QC / Rejected / Trafficked) for pickup and
// tracking. A QC picks a Ready-to-QC ticket here → it moves to their My Dashboard.
const isQcHold = (t) => t._raw?.status === STATUS.ON_HOLD && t._raw?.holdReturnStatus === 'IN_QC';
const isQcRelevant = (t) =>
    [STATUS.READY_TO_QC, STATUS.IN_QC, STATUS.REJECTED, STATUS.TRAFFICKED].includes(t._raw?.status) ||
    isQcHold(t);

const All = () => {
    const [activeStatus, setActiveStatus] = useState('all');
    const [board, setBoard] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const myId = getUser()?.id || null;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await qcApi.getBoard({ limit: 200 });
            setBoard(normalizeList(res?.data || []).filter(isQcRelevant));
        } catch (err) {
            toastError(errMessage(err, 'Failed to load the QC board'));
            setBoard([]);
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
        onPick: run((id) => qcApi.pick(id), 'Picked — moved to your Ready to QC'),
        onStart: run((id) => qcApi.start(id), 'QC started — timer running'),
        onApprove: run((id) => qcApi.approve(id), 'Approved & trafficked'),
        onReject: run((id, feedback) => qcApi.reject(id, feedback), 'Sent back for rework'),
        onHold: run((id, note) => qcApi.hold(id, 'HOLD', note), 'On hold — timer paused'),
        onResume: run((id) => qcApi.resume(id), 'Resumed — QC timer running'),
    };

    const counts = {
        all: board.length,
        readyToQc: board.filter((t) => t._raw?.status === STATUS.READY_TO_QC).length,
        inQc: board.filter((t) => t._raw?.status === STATUS.IN_QC).length,
        onHold: board.filter(isQcHold).length,
        rejected: board.filter((t) => t._raw?.status === STATUS.REJECTED).length,
        trafficked: board.filter((t) => t._raw?.status === STATUS.TRAFFICKED).length,
    };

    const visible =
        activeStatus === 'all'
            ? board
            : activeStatus === 'onHold'
                ? board.filter(isQcHold)
                : board.filter((t) => t._raw?.status === {
                    readyToQc: STATUS.READY_TO_QC,
                    inQc: STATUS.IN_QC,
                    rejected: STATUS.REJECTED,
                    trafficked: STATUS.TRAFFICKED,
                }[activeStatus]);

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
                myId={myId}
                actions={actions}
            />
        </div>
    );
};

export default All;
