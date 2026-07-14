import React, { useState, useMemo } from 'react';

const globalFont = "'Netflix Sans', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif";

const DUMMY_AGENTS = [
  { _id: 'a1',  name: 'Snehitha Reddy',  email: 'snehitha@mediamint.com',  availability: 'Yes', isOnBreak: false, role: 'Agent' },
  { _id: 'a2',  name: 'Sarthak Mehta',   email: 'sarthak@mediamint.com',   availability: 'Yes', isOnBreak: true,  role: 'Agent' },
  { _id: 'a3',  name: 'Nishanth Kumar',  email: 'nishanth@mediamint.com',  availability: 'No',  isOnBreak: false, role: 'Agent' },
  { _id: 'a4',  name: 'Harsha Vardhan',  email: 'harsha@mediamint.com',    availability: 'Yes', isOnBreak: false, role: 'Agent' },
  { _id: 'a5',  name: 'Priya Sharma',    email: 'priya@mediamint.com',     availability: 'No',  isOnBreak: true,  role: 'Agent' },
  { _id: 'a6',  name: 'Rahul Verma',     email: 'rahul@mediamint.com',     availability: 'Yes', isOnBreak: false, role: 'Agent' },
  { _id: 'a7',  name: 'Divya Nair',      email: 'divya@mediamint.com',     availability: 'Yes', isOnBreak: false, role: 'Agent' },
  { _id: 'a8',  name: 'Kiran Babu',      email: 'kiran@mediamint.com',     availability: 'No',  isOnBreak: false, role: 'Agent' },
  { _id: 'a9',  name: 'Ananya Pillai',   email: 'ananya@mediamint.com',    availability: 'Yes', isOnBreak: true,  role: 'Agent' },
  { _id: 'a10', name: 'Vikram Singh',    email: 'vikram@mediamint.com',    availability: 'No',  isOnBreak: false, role: 'Agent' },
  { _id: 'a11', name: 'Meera Krishnan',  email: 'meera@mediamint.com',     availability: 'Yes', isOnBreak: false, role: 'Agent' },
  { _id: 'a12', name: 'Arjun Patel',     email: 'arjun@mediamint.com',     availability: 'Yes', isOnBreak: true,  role: 'Agent' },
];

const ITEMS_PER_PAGE = 10;

const thStyle = {
  padding: '14px 16px',
  textAlign: 'left',
  fontSize: '11px',
  color: '#555',
  fontWeight: '700',
  fontFamily: globalFont,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  whiteSpace: 'nowrap',
  // ✅ Sticky header so it stays visible when scrolling
  position: 'sticky',
  top: 0,
  background: '#1e1e1e',
  zIndex: 1
};

const tdStyle = {
  padding: '16px',
  fontSize: '13px',
  color: '#ffffff',
  fontFamily: globalFont,
  fontWeight: '500'
};

const OrganicSocialAgentsView = () => {
  const [searchTerm, setSearchTerm]                 = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [page, setPage]                             = useState(1);

  const totalAgents    = DUMMY_AGENTS.length;
  const availableCount = DUMMY_AGENTS.filter(a => a.availability === 'Yes').length;
  const activeCount    = DUMMY_AGENTS.filter(a => a.isOnBreak === false).length;
  const onBreakCount   = DUMMY_AGENTS.filter(a => a.isOnBreak === true).length;

  const filteredAgents = useMemo(() => {
    return DUMMY_AGENTS.filter((agent) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        agent?.name?.toLowerCase().includes(search) ||
        agent?.email?.toLowerCase().includes(search);

      let matchesAvailability = true;
      if (availabilityFilter === 'Yes') matchesAvailability = agent?.availability === 'Yes';
      else if (availabilityFilter === 'No') matchesAvailability = agent?.availability === 'No';

      return matchesSearch && matchesAvailability;
    });
  }, [searchTerm, availabilityFilter]);

  const totalPages      = Math.max(1, Math.ceil(filteredAgents.length / ITEMS_PER_PAGE));
  const paginatedAgents = filteredAgents.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const hasActiveFilters = searchTerm !== '' || availabilityFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setAvailabilityFilter('all');
    setPage(1);
  };

  return (
    // ✅ KEY FIX: outer wrapper is scrollable, not full page
    <div style={{
      padding: '24px',
      fontFamily: globalFont,
      // ✅ Makes the whole agents view scroll inside the dashboard body
      height: '100%',
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>

      {/* Page Title */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{
          margin: '0 0 4px', fontSize: '22px',
          fontWeight: '800', color: '#ffffff',
          letterSpacing: '-0.02em', fontFamily: globalFont
        }}>
          Agents
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#555', fontFamily: globalFont }}>
          Overview of all agents and their current availability
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {[
          { label: 'Total Agents', value: totalAgents,    color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)',  icon: '👥' },
          { label: 'Available',    value: availableCount, color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   icon: '✅' },
          { label: 'Active',       value: activeCount,    color: '#e50914', bg: 'rgba(229,9,20,0.1)',    border: 'rgba(229,9,20,0.25)',    icon: '🟢' },
          { label: 'On Break',     value: onBreakCount,   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', icon: '⏸️' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: stat.bg,
            border: `1px solid ${stat.border}`,
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '22px' }}>{stat.icon}</span>
            <div>
              <div style={{
                fontSize: '26px', fontWeight: '800',
                color: stat.color, lineHeight: 1,
                fontFamily: globalFont
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '12px', color: '#777',
                marginTop: '3px', fontFamily: globalFont, fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div style={{
        background: '#1a1a1a',
        borderRadius: '14px',
        border: '1px solid #2a2a2a',
        // ✅ Let card grow but don't clip — scroll is inside table area
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* Card Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #2a2a2a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          flexShrink: 0
        }}>
          <div>
            <h3 style={{
              margin: '0 0 2px', fontSize: '15px',
              fontWeight: '700', color: '#fff', fontFamily: globalFont
            }}>
              Agent Roster
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#555', fontFamily: globalFont }}>
              {filteredAgents.length} of {totalAgents} agents
              {hasActiveFilters && (
                <span style={{ color: '#e50914', marginLeft: '6px', fontWeight: '600' }}>
                  (filtered)
                </span>
              )}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              style={{
                width: '220px', padding: '9px 14px',
                borderRadius: '8px', border: '1px solid #333',
                outline: 'none', fontSize: '13px',
                background: '#222', color: '#e5e5e5',
                fontFamily: globalFont, transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #e50914';
                e.target.style.boxShadow = '0 0 0 2px rgba(229,9,20,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid #333';
                e.target.style.boxShadow = 'none';
              }}
            />

            {/* Availability Filter */}
            <select
              value={availabilityFilter}
              onChange={(e) => { setAvailabilityFilter(e.target.value); setPage(1); }}
              style={{
                padding: '9px 14px', borderRadius: '8px',
                border: '1px solid #333', background: '#222',
                color: '#e5e5e5', fontFamily: globalFont,
                fontSize: '13px', cursor: 'pointer',
                outline: 'none', minWidth: '155px', transition: 'border 0.2s'
              }}
              onFocus={(e) => e.target.style.border = '1px solid #e50914'}
              onBlur={(e) => e.target.style.border = '1px solid #333'}
            >
              <option value="all">All Availability</option>
              <option value="Yes">Available (Yes)</option>
              <option value="No">Unavailable (No)</option>
            </select>

            {/* Clear */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '9px 14px', borderRadius: '8px',
                  border: '1px solid #333', background: '#222',
                  color: '#e5e5e5', cursor: 'pointer',
                  fontWeight: '600', fontFamily: globalFont,
                  fontSize: '13px', display: 'flex',
                  alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e50914';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#e50914';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#222';
                  e.currentTarget.style.color = '#e5e5e5';
                  e.currentTarget.style.borderColor = '#333';
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* ✅ SCROLLABLE TABLE WRAPPER */}
        <div style={{
          overflowX: 'auto',
          overflowY: 'auto',
          // ✅ Fixed height so table scrolls inside the card
          maxHeight: '460px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Agent Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Availability</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedAgents.length > 0 ? (
                paginatedAgents.map((agent, index) => {
                  const isAvailable = agent?.availability === 'Yes';
                  const isOnBreak   = agent?.isOnBreak === true;

                  return (
                    <tr
                      key={agent._id || index}
                      style={{
                        borderBottom: '1px solid #1e1e1e',
                        background: '#1a1a1a',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#202020'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
                    >
                      {/* # */}
                      <td style={{ ...tdStyle, color: '#444', fontSize: '12px' }}>
                        {(page - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>

                      {/* Agent Name */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg,#e50914,#b91c1c)',
                            color: '#fff', fontWeight: '700', fontSize: '14px',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                            position: 'relative', textTransform: 'uppercase'
                          }}>
                            {agent?.name?.charAt(0)?.toUpperCase() || 'A'}
                            <span style={{
                              position: 'absolute', bottom: '1px', right: '1px',
                              width: '9px', height: '9px', borderRadius: '50%',
                              background: isAvailable ? '#22c55e' : '#555',
                              border: '2px solid #1a1a1a',
                              boxShadow: isAvailable ? '0 0 5px rgba(34,197,94,0.6)' : 'none'
                            }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#e5e5e5', fontFamily: globalFont }}>
                              {agent?.name || 'N/A'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#555', marginTop: '1px', fontFamily: globalFont }}>
                              {agent?.role || 'Agent'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ ...tdStyle, color: '#777', fontSize: '13px' }}>
                        {agent?.email || 'N/A'}
                      </td>

                      {/* Availability */}
                      <td style={tdStyle}>
                        <span style={{
                          padding: '5px 12px', borderRadius: '999px',
                          fontSize: '11px', fontWeight: '700',
                          fontFamily: globalFont,
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: isAvailable ? 'rgba(34,197,94,0.1)' : 'rgba(100,100,100,0.1)',
                          color: isAvailable ? '#22c55e' : '#666',
                          border: `1px solid ${isAvailable ? 'rgba(34,197,94,0.3)' : 'rgba(100,100,100,0.2)'}`
                        }}>
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: isAvailable ? '#22c55e' : '#555', flexShrink: 0
                          }} />
                          {isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <span style={{
                          padding: '5px 12px', borderRadius: '999px',
                          fontSize: '11px', fontWeight: '700',
                          fontFamily: globalFont,
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          background: isOnBreak ? 'rgba(245,158,11,0.1)' : 'rgba(229,9,20,0.1)',
                          color: isOnBreak ? '#f59e0b' : '#e50914',
                          border: `1px solid ${isOnBreak ? 'rgba(245,158,11,0.3)' : 'rgba(229,9,20,0.3)'}`
                        }}>
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: isOnBreak ? '#f59e0b' : '#e50914', flexShrink: 0
                          }} />
                          {isOnBreak ? 'On Break' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{
                    textAlign: 'center', padding: '48px',
                    color: '#444', fontSize: '14px',
                    fontWeight: '500', fontFamily: globalFont
                  }}>
                    {hasActiveFilters ? '🔍 No agents match your filters' : '👥 No agents found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAgents.length > ITEMS_PER_PAGE && (
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '14px 20px',
            borderTop: '1px solid #2a2a2a',
            flexWrap: 'wrap', gap: '10px', flexShrink: 0
          }}>
            <span style={{ fontSize: '12px', color: '#555', fontFamily: globalFont }}>
              Showing{' '}
              <span style={{ color: '#e50914', fontWeight: '700' }}>
                {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredAgents.length)}
              </span>
              {' '}of{' '}
              <span style={{ color: '#fff', fontWeight: '700' }}>{filteredAgents.length}</span>
              {' '}agents
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {/* Prev */}
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  padding: '7px 14px', borderRadius: '7px',
                  border: '1px solid #333',
                  background: page === 1 ? '#1e1e1e' : '#222',
                  color: page === 1 ? '#444' : '#ccc',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600', fontSize: '12px',
                  fontFamily: globalFont, transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (page !== 1) {
                    e.currentTarget.style.background = '#e50914';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = '#e50914';
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== 1) {
                    e.currentTarget.style.background = '#222';
                    e.currentTarget.style.color = '#ccc';
                    e.currentTarget.style.borderColor = '#333';
                  }
                }}
              >
                Prev
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    padding: '7px 12px', borderRadius: '7px',
                    border: '1px solid #333',
                    background: page === p ? '#e50914' : '#222',
                    color: page === p ? '#fff' : '#ccc',
                    cursor: 'pointer', fontWeight: '700',
                    fontSize: '12px', fontFamily: globalFont, transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (page !== p) {
                      e.currentTarget.style.background = '#2a2a2a';
                      e.currentTarget.style.borderColor = '#e50914';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== p) {
                      e.currentTarget.style.background = '#222';
                      e.currentTarget.style.borderColor = '#333';
                    }
                  }}
                >
                  {p}
                </button>
              ))}

              {/* Next */}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  padding: '7px 14px', borderRadius: '7px',
                  border: '1px solid #333',
                  background: page === totalPages ? '#1e1e1e' : '#222',
                  color: page === totalPages ? '#444' : '#ccc',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: '600', fontSize: '12px',
                  fontFamily: globalFont, transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (page !== totalPages) {
                    e.currentTarget.style.background = '#e50914';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = '#e50914';
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== totalPages) {
                    e.currentTarget.style.background = '#222';
                    e.currentTarget.style.color = '#ccc';
                    e.currentTarget.style.borderColor = '#333';
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganicSocialAgentsView;