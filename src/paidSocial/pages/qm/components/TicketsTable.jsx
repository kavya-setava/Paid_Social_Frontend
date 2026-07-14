import React from 'react';
import PropTypes from 'prop-types';
import './TicketsTable.css';

const TicketsTable = ({ tickets = [], loading = false }) => {
  if (loading) {
    return <div className="table-loading">Loading data from backend...</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="qm-table">
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Subject</th>
            <th>Assignee</th>
            <th>Status</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan="5" className="no-data">No tickets found matches this criteria.</td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="bold-text">#{ticket.id}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.assignee || 'Unassigned'}</td>
                <td>
                  <span className={`status-tag ${ticket.statusClass}`}>
                    {ticket.statusText}
                  </span>
                </td>
                <td>{ticket.updatedAt}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

TicketsTable.propTypes = {
  tickets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      subject: PropTypes.string.isRequired,
      assignee: PropTypes.string,
      statusClass: PropTypes.string,
      statusText: PropTypes.string.isRequired,
      updatedAt: PropTypes.string.isRequired,
    })
  ),
  loading: PropTypes.bool,
};

export default TicketsTable;