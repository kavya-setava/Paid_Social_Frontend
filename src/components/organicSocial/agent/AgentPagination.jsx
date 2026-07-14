import React from 'react';
import { globalFont } from './AgentDashboardConstants';

const AgentPagination = ({ page, totalPages, limit, setPage, setLimit }) => {
  const btnBase = {
    padding: '6px 10px', borderRadius: '6px',
    border: '1px solid #333', fontSize: '12px',
    fontWeight: '600', fontFamily: globalFont,
    cursor: 'pointer', transition: 'all 0.2s'
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '14px 20px',
      borderTop: '1px solid #2a2a2a',
      flexWrap: 'wrap', gap: '10px'
    }}>

      {/* Rows per page */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: '#555', fontFamily: globalFont }}>
          Rows per page
        </span>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); }}
          style={{
            padding: '5px 10px', borderRadius: '6px',
            border: '1px solid #3b82f6',
            background: '#222', color: '#3b82f6',
            fontSize: '12px', fontWeight: '700',
            cursor: 'pointer', outline: 'none'
          }}
        >
          {[10, 20, 30, 50].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Page controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
          style={{
            ...btnBase,
            background: '#222', color: '#ccc',
            opacity: page === 1 ? 0.4 : 1,
            cursor: page === 1 ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (page !== 1) {
              e.currentTarget.style.background = '#3b82f6';
              e.currentTarget.style.color = '#fff';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#222';
            e.currentTarget.style.color = '#ccc';
          }}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              ...btnBase,
              background: page === p ? '#3b82f6' : '#222',
              color: page === p ? '#fff' : '#ccc',
              border: `1px solid ${page === p ? '#3b82f6' : '#333'}`
            }}
            onMouseEnter={(e) => {
              if (page !== p) {
                e.currentTarget.style.background = '#1d4ed8';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              if (page !== p) {
                e.currentTarget.style.background = '#222';
                e.currentTarget.style.color = '#ccc';
              }
            }}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page === totalPages}
          style={{
            ...btnBase,
            background: '#222', color: '#ccc',
            opacity: page === totalPages ? 0.4 : 1,
            cursor: page === totalPages ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (page !== totalPages) {
              e.currentTarget.style.background = '#3b82f6';
              e.currentTarget.style.color = '#fff';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#222';
            e.currentTarget.style.color = '#ccc';
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AgentPagination;