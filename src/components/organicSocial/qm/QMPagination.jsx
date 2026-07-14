import React from 'react';

const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

const QMPagination = ({ page, totalPages, limit, setPage, setLimit }) => {
  const pages = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (page <= 3) pages.push(1, 2, 3, '...', totalPages);
    else if (page >= totalPages - 2) pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    else pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
  }

  const btnStyle = (active) => ({
    padding: '6px 10px', borderRadius: '6px',
    border: '1px solid #333',
    background: active ? '#e50914' : '#2a2a2a',
    color: active ? '#fff' : '#ccc',
    cursor: 'pointer', fontSize: '12px',
    fontWeight: active ? '700' : '500',
    fontFamily: globalFont, transition: 'all 0.2s'
  });

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '16px 20px',
      borderTop: '1px solid #2a2a2a'
    }}>
      {/* Rows per page */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: '#666', fontFamily: globalFont }}>
          Rows per page
        </span>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          style={{
            padding: '5px 10px', borderRadius: '6px',
            border: '1px solid #e50914',
            background: '#2a2a2a', color: '#e50914',
            fontSize: '12px', fontWeight: '700',
            cursor: 'pointer', outline: 'none',
            fontFamily: globalFont
          }}
        >
          {[10, 20, 30, 50, 100].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Page controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
          style={{ ...btnStyle(false), opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
        >
          Prev
        </button>

        {pages.map((p, i) => (
          <button
            key={i}
            onClick={() => typeof p === 'number' && setPage(p)}
            disabled={p === '...'}
            style={{
              ...btnStyle(page === p),
              cursor: p === '...' ? 'default' : 'pointer',
              opacity: p === '...' ? 0.5 : 1
            }}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page === totalPages}
          style={{ ...btnStyle(false), opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default QMPagination;