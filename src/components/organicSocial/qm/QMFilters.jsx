import React, { useState } from 'react';

const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

const TICKET_STATUSES = [
  'Yet to Assign','Ready to Queue','Assigned','On Hold',
  'In Progress','Completed','Handoff','Pushed to QA','Reassigned'
];

// Mini multi-select dropdown
function FilterDropdown({ label, options, selected, onChange, singleSelect = false }) {
  const [open, setOpen] = useState(false);

  const toggle = (opt) => {
    if (singleSelect) {
      onChange(selected.includes(opt) ? [] : [opt]);
    } else {
      onChange(selected.includes(opt)
        ? selected.filter(o => o !== opt)
        : [...selected, opt]);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: '700',
        color: '#777', marginBottom: '6px',
        textTransform: 'uppercase', letterSpacing: '0.08em'
      }}>
        {label}
      </label>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%', padding: '10px 12px',
          borderRadius: '8px',
          border: `1px solid ${open ? '#E50914' : '#333'}`,
          background: '#222', color: '#fff',
          fontSize: '12px', fontWeight: '600',
          cursor: 'pointer', textAlign: 'left',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', fontFamily: globalFont,
          boxShadow: open ? '0 0 10px rgba(229,9,20,0.3)' : 'none',
          transition: 'all 0.2s'
        }}
      >
        <span>{selected.length === 0 ? 'Select...' : `${selected.length} selected`}</span>
        <span style={{
          fontSize: '10px', color: '#E50914',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s'
        }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '105%', left: 0, right: 0,
          background: '#181818', border: '1px solid #333',
          borderRadius: '10px', zIndex: 999,
          maxHeight: '220px', overflowY: 'auto',
          boxShadow: '0 12px 30px rgba(0,0,0,0.6)'
        }}>
          {options.map((opt) => {
            const sel = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                style={{
                  width: '100%', padding: '10px 14px',
                  border: 'none', background: sel ? 'rgba(229,9,20,0.15)' : 'transparent',
                  color: sel ? '#E50914' : '#ddd',
                  textAlign: 'left', cursor: 'pointer',
                  fontSize: '12px', fontWeight: sel ? '700' : '500',
                  borderLeft: `3px solid ${sel ? '#E50914' : 'transparent'}`,
                  display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'all 0.15s', fontFamily: globalFont
                }}
                onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
              >
                <input
                  type="checkbox" checked={sel} readOnly
                  style={{ accentColor: '#E50914', width: '13px', height: '13px' }}
                />
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const QMFilters = ({ filters, setFilters, onClear }) => {
  const hasActive =
    filters.highVis.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  return (
    <div style={{
      padding: '18px 24px',
      borderBottom: '1px solid #2a2a2a',
      background: '#161616'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '18px',
        marginBottom: hasActive ? '14px' : 0
      }}>
        {/* High Visibility */}
        <FilterDropdown
          label="High Visibility"
          options={['Yes', 'No']}
          selected={filters.highVis}
          onChange={(val) => setFilters(p => ({ ...p, highVis: val }))}
          singleSelect
        />

        {/* Status Filter */}
        <FilterDropdown
          label="Status"
          options={TICKET_STATUSES}
          selected={filters.statuses}
          onChange={(val) => setFilters(p => ({ ...p, statuses: val }))}
        />

        {/* Date Range */}
        <div>
          <label style={{
            display: 'block', fontSize: '11px', fontWeight: '700',
            color: '#777', marginBottom: '6px',
            textTransform: 'uppercase', letterSpacing: '0.08em'
          }}>
            Publish Date Range
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['start', 'end'].map((key) => (
              <input
                key={key}
                type="datetime-local"
                value={filters.dateRange[key]}
                onChange={(e) =>
                  setFilters(p => ({
                    ...p,
                    dateRange: { ...p.dateRange, [key]: e.target.value }
                  }))
                }
                style={{
                  width: '100%', padding: '10px 12px',
                  borderRadius: '8px', border: '1px solid #333',
                  background: '#222', color: '#fff',
                  fontSize: '12px', outline: 'none',
                  boxSizing: 'border-box', fontFamily: globalFont,
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.border = '1px solid #E50914'}
                onBlur={(e) => e.target.style.border = '1px solid #333'}
              />
            ))}
          </div>
        </div>
      </div>

      {hasActive && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClear}
            style={{
              padding: '7px 16px',
              background: '#2a2a2a', border: '1px solid #444',
              borderRadius: '6px', color: '#ef4444',
              fontWeight: '600', fontSize: '12px',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: globalFont
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#3a2a2a'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2a2a2a'}
          >
            ✕ Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default QMFilters;