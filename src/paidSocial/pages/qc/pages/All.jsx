import React, { useState, useEffect, useCallback, useRef } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { qcApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList, STATUS } from '../../../utils/tickets';
import { getUser } from '../../../api/session';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import useClientTable from '../../../hooks/useClientTable';
import useOperators from '../../../hooks/useOperators';
import { PaidSearch, PaidPagination } from '../../../components/PaidTableControls';
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
    const [assigningId, setAssigningId] = useState(null);

    const myId = getUser()?.id || null;
    const qcers = useOperators(() => qcApi.getQcers());
    const reqIdRef = useRef(0);

    const load = useCallback(async (silent = false) => {
        const reqId = ++reqIdRef.current;
        if (!silent) setLoading(true);
        try {
            const res = await qcApi.getBoard({ limit: 200 });
            if (reqId !== reqIdRef.current) return; // stale
            setBoard(normalizeList(res?.data || []).filter(isQcRelevant));
        } catch (err) {
            if (reqId === reqIdRef.current) {
                toastError(errMessage(err, 'Failed to load the QC board'));
                setBoard([]);
            }
        } finally {
            if (reqId === reqIdRef.current && !silent) setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);
    usePaidSocket(() => load(true));

    const run = (fn, msg) => async (...args) => {
        const id = args[0];
        setBusyId(id);
        try {
            await fn(...args);
            toastSuccess(msg);
            load(true);
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
        onReject: run((id, feedback, rejectionType) => qcApi.reject(id, feedback, rejectionType), 'Sent back for rework'),
        onHold: run((id, note) => qcApi.hold(id, 'HOLD', note), 'On hold — timer paused'),
        onResume: run((id) => qcApi.resume(id), 'Resumed — QC timer running'),
    };

    const handleAssignQc = async (id, qcId) => {
        if (!qcId) return;
        setAssigningId(id);
        try {
            await qcApi.assign(id, qcId);
            toastSuccess('Assigned to QCer');
            load(true);
        } catch (err) {
            toastError(errMessage(err, 'Could not assign QCer'));
        } finally {
            setAssigningId(null);
        }
    };

    const isCompleted = (t) => t._raw?.status === STATUS.TRAFFICKED && t._raw?.ciStatus === 'CI_COMPLETED';
    const isTrafficked = (t) => t._raw?.status === STATUS.TRAFFICKED && !isCompleted(t);

    const counts = {
        all: board.length,
        readyToQc: board.filter((t) => t._raw?.status === STATUS.READY_TO_QC).length,
        inQc: board.filter((t) => t._raw?.status === STATUS.IN_QC).length,
        onHold: board.filter(isQcHold).length,
        rejected: board.filter((t) => t._raw?.status === STATUS.REJECTED).length,
        trafficked: board.filter(isTrafficked).length,
        completed: board.filter(isCompleted).length,
    };

    const visible =
        activeStatus === 'all'
            ? board
            : activeStatus === 'onHold'
                ? board.filter(isQcHold)
                : activeStatus === 'trafficked'
                    ? board.filter(isTrafficked)
                    : activeStatus === 'completed'
                        ? board.filter(isCompleted)
                        : board.filter((t) => t._raw?.status === {
                            readyToQc: STATUS.READY_TO_QC,
                            inQc: STATUS.IN_QC,
                            rejected: STATUS.REJECTED,
                        }[activeStatus]);

    const { query, setQuery, page, setPage, total, totalPages, pageRows } = useClientTable(visible, 10);

    return (
        <div className="all-page">
            <StatusCards
                counts={counts}
                activeStatus={activeStatus}
                onStatusSelect={setActiveStatus}
                tabType="all"
            />
            <PaidSearch value={query} onChange={setQuery} />
            <TicketsTable
                tickets={pageRows}
                loading={loading}
                showActions
                busyId={busyId}
                myId={myId}
                actions={actions}
                assignable={activeStatus === 'all' || activeStatus === 'readyToQc'}
                qcers={qcers}
                assigningId={assigningId}
                onAssignQc={handleAssignQc}
            />
            <PaidPagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
        </div>
    );
};

export default All;
