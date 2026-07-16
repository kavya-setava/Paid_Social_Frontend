import React, { useState } from 'react';
import TicketsTable from '../components/TicketsTable';
import { initialMockTickets, STATUS } from '../components/mockTickets';
import './Tickets.css';

// Dedicated rework queue: only tickets QC has rejected land here, with
// Continue Working / Reassign actions (handled by StatusActionCell).
const ReWork = () => {
  const [tickets, setTickets] = useState(initialMockTickets);

  const timestamp = () =>
    new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: newStatus,
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
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, operator: operatorName, updatedAt: timestamp() }
          : t
      )
    );
  };

  const reworkTickets = tickets.filter((t) => t.status === STATUS.REWORK);

  return (
    <div className="tickets-page">
      <TicketsTable
        tickets={reworkTickets}
        activeStatus="rework"
        onStatusChange={handleStatusChange}
        onOperatorChange={handleOperatorChange}
      />
    </div>
  );
};

export default ReWork;
