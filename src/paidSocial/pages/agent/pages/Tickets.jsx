import React, { useState } from 'react';
import StatusCards from '../components/StatusCards';
import TicketsTable from '../components/TicketsTable';
import { initialMockTickets, STATUS } from '../components/mockTickets';
import './Tickets.css';

// Maps each StatusCards tab to the ticket(s) it should show. "In Progress"
// intentionally also surfaces On Hold tickets so the Pause/Resume actions
// and dropdown both make sense from that one tab.
const STATUS_FILTERS = {
  all: () => true,
  rttAssigned: (t) => t.status === STATUS.RTT,
  inProgress: (t) => t.status === STATUS.IN_PROGRESS || t.status === STATUS.ON_HOLD,
  onHold: (t) => t.status === STATUS.ON_HOLD,
  readyToQc: (t) => t.status === STATUS.READY_TO_QC,
  inQc: (t) => t.status === STATUS.IN_QC,
  rejected: (t) => t.status === STATUS.REJECTED,
  rework: (t) => t.status === STATUS.REWORK,
  trafficked: (t) => t.status === STATUS.TRAFFICKED,
};

const Tickets = () => {
  const [activeStatus, setActiveStatus] = useState('all');
  const [tickets, setTickets] = useState(initialMockTickets);

  const timestamp = () =>
    new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const handleStatusChange = (ticketId, newStatus, rejectionComment) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: newStatus,
              rejectionNote: newStatus === STATUS.REJECTED ? rejectionComment : undefined,
              inProgressStartedAt:
                newStatus === STATUS.IN_PROGRESS ? new Date().toISOString() : t.inProgressStartedAt,
              updatedAt: timestamp(),
            }
          : t
      )
    );
  };

  const handleOperatorChange = (ticketId, operatorName) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, operator: operatorName } : t))
    );
  };

  const handleTraffickerCommentChange = (ticketId, comment) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, traffickerComments: comment } : t))
    );
  };

  const counts = {
    all: tickets.length,
    rttAssigned: tickets.filter((t) => t.status === STATUS.RTT).length,
    inProgress: tickets.filter((t) => t.status === STATUS.IN_PROGRESS || t.status === STATUS.ON_HOLD).length,
    onHold: tickets.filter((t) => t.status === STATUS.ON_HOLD).length,
    readyToQc: tickets.filter((t) => t.status === STATUS.READY_TO_QC).length,
    inQc: tickets.filter((t) => t.status === STATUS.IN_QC).length,
    rejected: tickets.filter((t) => t.status === STATUS.REJECTED).length,
    rework: tickets.filter((t) => t.status === STATUS.REWORK).length,
    trafficked: tickets.filter((t) => t.status === STATUS.TRAFFICKED).length,
  };

  const visibleTickets = tickets.filter(STATUS_FILTERS[activeStatus] || STATUS_FILTERS.all);

  return (
    <div className="tickets-page">
      <StatusCards
        counts={counts}
        activeStatus={activeStatus}
        onStatusSelect={setActiveStatus}
      />
      <TicketsTable
        tickets={visibleTickets}
        activeStatus={activeStatus}
        onStatusChange={handleStatusChange}
        onOperatorChange={handleOperatorChange}
        onTraffickerCommentChange={handleTraffickerCommentChange}
      />
    </div>
  );
};

export default Tickets;