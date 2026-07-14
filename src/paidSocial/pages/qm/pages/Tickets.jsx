import React, { useState, useEffect } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import './Tickets.css';

const Tickets = () => {
  const [activeStatus, setActiveStatus] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ready for API Integration
  const [counts, setCounts] = useState({
    all: 25,
    rttUnassigned: 4,
    rttAssigned: 3,
    inProgress: 5,
    onHold: 2,
    readyToQc: 4,
    inQc: 3,
    rejected: 1,
    trafficked: 3,
  });

  useEffect(() => {
    // Replace this simulation block with your real Axios/Fetch call:
    // axios.get(`/api/tickets?status=${activeStatus}`).then(...)
    setLoading(true);
    const mockTimeout = setTimeout(() => {
      setTickets([
        { id: '1024', subject: 'Setup RTT pipeline routing', assignee: 'Jane Doe', statusText: 'In Progress', statusClass: 'progress', updatedAt: '2 mins ago' },
        { id: '1025', subject: 'Fix broken QC schema validation', assignee: 'Alex Smith', statusText: 'Ready to QC', statusClass: 'open', updatedAt: '1 hour ago' },
      ]);
      setLoading(false);
    }, 400);

    return () => clearTimeout(mockTimeout);
  }, [activeStatus]);

  return (
    <div className="tickets-page">
      <StatusCards 
        counts={counts} 
        activeStatus={activeStatus} 
        onStatusSelect={setActiveStatus} 
      />
      <TicketsTable tickets={tickets} loading={loading} />
    </div>
  );
};

export default Tickets;