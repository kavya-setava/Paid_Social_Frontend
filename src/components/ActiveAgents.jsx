import React, { useEffect, useState } from 'react';
import useApiCaller from '../utils/hooks/useApicaller';

const globalFont = "'Netflix Sans', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif";

const ActiveAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchData } = useApiCaller();
  const [page, setPage] = useState(1);
   const [availabilityFilter, setAvailabilityFilter] = useState('all'); 
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const res = await fetchData('get', 'users/agents');
        if (res?.agents) {
          setAgents(res.agents);
        }
      } catch (err) {
        console.error('❌ Failed to fetch agents', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

    const clearFilters = () => {
    setSearchTerm('');
    setAvailabilityFilter('all');
    setPage(1);
  };

 const filteredAgents = agents.filter((agent) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = 
      agent?.name?.toLowerCase().includes(search) ||
      agent?.email?.toLowerCase().includes(search);
    
    // Apply availability filter
    let matchesAvailability = true;
    if (availabilityFilter === 'Yes') {
      matchesAvailability = agent?.availability === 'Yes' || agent?.availability === 'Available';
    } else if (availabilityFilter === 'No') {
      matchesAvailability = agent?.availability === 'No' || agent?.availability === 'Busy' || agent?.availability === 'Away';
    }
    
    return matchesSearch && matchesAvailability;
  });

  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const paginatedAgents = filteredAgents.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div
      style={{
        padding: '24px',
        fontFamily: globalFont,
        background: '#141414',
        minHeight: '100vh',
        marginTop:"5%"
      }}
    >
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #404040',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '24px',
                color: '#ffffff',
                fontWeight: '700',
                letterSpacing: '-0.02em'
              }}
            >
              Active Agents
            </h2>
            <p
              style={{
                marginTop: '6px',
                color: '#757575',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Total Agents: {agents.length}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div style={{ marginTop: '18px', marginBottom: '24px',display:"flex" }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '320px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #404040',
              outline: 'none',
              fontSize: '14px',
              transition: '0.2s',
              background: '#2a2a2a',
              color: '#e5e5e5',
              fontFamily: globalFont
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid #e50914';
              e.target.style.boxShadow = '0 0 0 2px rgba(229,9,20,0.2)';
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid #404040';
              e.target.style.boxShadow = 'none';
            }}
          />
            <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #404040',
              outline: 'none',
              fontSize: '14px',
              background: '#2a2a2a',
              color: '#e5e5e5',
              fontFamily: globalFont,
              cursor: 'pointer',
              minWidth: '150px',
              marginLeft:"2%"
            }}
            onFocus={(e) => {
              e.target.style.border = '1px solid #e50914';
            }}
            onBlur={(e) => {
              e.target.style.border = '1px solid #404040';
            }}
          >
            <option value="all">All Availability</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>

           <button
            onClick={clearFilters}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #404040',
              background: '#2a2a2a',
              color: '#e5e5e5',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: globalFont,
              fontSize: '14px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginLeft:"2%"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e50914';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.borderColor = '#e50914';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2a2a2a';
              e.currentTarget.style.color = '#e5e5e5';
              e.currentTarget.style.borderColor = '#404040';
            }}
          >
            <span>✕</span>
            Clear Filters
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: '#757575',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Loading agents...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}
            >
              <thead>
                <tr
                  style={{
                    background: '#2a2a2a',
                    borderBottom: '1px solid #404040'
                  }}
                >
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Agent Name</th>
                  <th style={thStyle}>Email</th>
                    <th style={thStyle}>Availability</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedAgents?.length > 0 ? (
                  paginatedAgents?.map((agent, index) => (
                    <tr
                      key={agent._id || index}
                      style={{
                        borderBottom: '1px solid #404040',
                        transition: '0.2s',
                        background: '#1a1a1a'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#2a2a2a';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#1a1a1a';
                      }}
                    >
                      <td style={tdStyle}>
                        {(page - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #e50914, #b91c1c)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '14px',
                              textTransform: 'uppercase'
                            }}
                          >
                            {agent?.name?.charAt(0) || 'A'}
                          </div>
                          <span style={{ fontWeight: '600', color: '#ffffff' }}>
                            {agent?.name || 'N/A'}
                          </span>
                        </div>
                      </td>

                      <td style={{ ...tdStyle, color: '#e5e5e5' }}>
                        {agent?.email || 'N/A'}
                      </td>
                       <td style={tdStyle}>
                        <span
                          style={{
                            padding: '6px 14px',
                            borderRadius: '999px',
                            background: agent?.availability === 'Available' 
                              ? '#1a3a2a'
                              : agent?.availability === 'Yes'
                              ? '#3a1a1a'
                              : agent?.availability === 'No'
                              ? '#3a3a1a'
                              : '#2a2a2a',
                            color: agent?.availability === 'Available'
                              ? '#4ade80'
                              : agent?.availability === 'Busy'
                              ? '#ef4444'
                              : agent?.availability === 'Away'
                              ? '#fbbf24'
                              : '#757575',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: `1px solid ${
                              agent?.availability === 'Available'
                                ? '#22c55e'
                                : agent?.availability === 'Busy'
                                ? '#ef4444'
                                : agent?.availability === 'Away'
                                ? '#fbbf24'
                                : '#404040'
                            }`
                          }}
                             >
                          {agent?.availability || 'Unknown'}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: '6px 14px',
                            borderRadius: '999px',
                            background:
                              agent?.isOnBreak === false
                                ? '#1a3a2a'
                                : agent?.isOnBreak === true
                                ? '#3a1a1a'
                                : '#2a2a2a',
                            color:
                              agent?.isOnBreak === false
                                ? '#4ade80'
                                : agent?.isOnBreak === true
                                ? '#ef4444'
                                : '#757575',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: `1px solid ${
                              agent?.isOnBreak === false
                                ? '#22c55e'
                                : agent?.isOnBreak === true
                                ? '#ef4444'
                                : '#404040'
                            }`
                          }}
                        >
                          {agent?.isOnBreak === true
                            ? "Break"
                            : agent?.isOnBreak === false
                            ? "Active"
                            : "NA"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#757575',
                        fontSize: '15px',
                        fontWeight: '500'
                      }}
                    >
                      No active agents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            {filteredAgents.length > ITEMS_PER_PAGE && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '24px',
                  flexWrap: 'wrap'
                }}
              >
                {/* PREV */}
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #404040',
                    background: page === 1 ? '#2a2a2a' : '#1a1a1a',
                    color: page === 1 ? '#757575' : '#e5e5e5',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontFamily: globalFont,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (page !== 1) {
                      e.currentTarget.style.background = '#e50914';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = '#e50914';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== 1) {
                      e.currentTarget.style.background = '#1a1a1a';
                      e.currentTarget.style.color = '#e5e5e5';
                      e.currentTarget.style.borderColor = '#404040';
                    }
                  }}
                >
                  Prev
                </button>

                {/* PAGE NUMBERS */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #404040',
                      background: page === p ? '#e50914' : '#1a1a1a',
                      color: page === p ? '#ffffff' : '#e5e5e5',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontFamily: globalFont,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (page !== p) {
                        e.currentTarget.style.background = '#2a2a2a';
                        e.currentTarget.style.borderColor = '#e50914';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (page !== p) {
                        e.currentTarget.style.background = '#1a1a1a';
                        e.currentTarget.style.borderColor = '#404040';
                      }
                    }}
                  >
                    {p}
                  </button>
                ))}

                {/* NEXT */}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #404040',
                    background: page === totalPages ? '#2a2a2a' : '#1a1a1a',
                    color: page === totalPages ? '#757575' : '#e5e5e5',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontFamily: globalFont,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (page !== totalPages) {
                      e.currentTarget.style.background = '#e50914';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = '#e50914';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== totalPages) {
                      e.currentTarget.style.background = '#1a1a1a';
                      e.currentTarget.style.color = '#e5e5e5';
                      e.currentTarget.style.borderColor = '#404040';
                    }
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const thStyle = {
  padding: '16px',
  textAlign: 'left',
  fontSize: '12px',
  color: '#757575',
  fontWeight: '700',
  fontFamily: globalFont,
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const tdStyle = {
  padding: '18px 16px',
  fontSize: '14px',
  color: '#ffffff',
  fontFamily: globalFont,
  fontWeight: '500'
};

export default ActiveAgents;