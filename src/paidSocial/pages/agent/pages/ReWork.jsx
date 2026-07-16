import React, { useState, useEffect, useCallback } from 'react';
import TicketsTable from '../components/TicketsTable';
import { agentApi, ticketApi, errMessage } from '../../../api/paidSocialApi';
import { normalizeList } from '../../../utils/tickets';
import { toastSuccess, toastError } from '../../../utils/toast';
import usePaidSocket from '../../../hooks/usePaidSocket';
import './Tickets.css';

// Common rework bucket: REJECTED tickets any agent can claim (Pick).
const ReWork = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const fetchBucket = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ticketApi.getRework('available');
      setTickets(normalizeList(res?.data || []));
    } catch (err) {
      toastError(errMessage(err, 'Failed to load the rework bucket'));
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBucket(); }, [fetchBucket]);
  usePaidSocket(() => fetchBucket());

  const handlePick = async (id) => {
    setBusyId(id);
    try {
      await agentApi.pickRework(id);
      toastSuccess('Picked — it is now in your queue');
      fetchBucket();
    } catch (err) {
      toastError(errMessage(err, 'Could not pick this ticket (someone may have claimed it)'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="tickets-page">
      <h2 style={{ color: '#f5f5f5', margin: '4px 0 12px', fontSize: '18px' }}>Rework Bucket</h2>
      <TicketsTable
        tickets={tickets}
        loading={loading}
        activeStatus="rework"
        mode="bucket"
        busyId={busyId}
        actions={{ onPick: handlePick }}
      />
    </div>
  );
};

export default ReWork;
