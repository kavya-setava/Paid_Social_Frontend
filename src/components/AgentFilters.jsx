import React, { useState } from 'react';

const globalFont = "'Netflix Sans', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif";

// ── Internal FilterDropdown (same as before, scoped to this file) ──────────────
function FilterDropdown({ label, options, selected, onChange, singleSelect = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else if (singleSelect) {
      onChange([option]);
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: '600',
          color: '#757575',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '8px',
          border: `1px solid #404040`,
          fontSize: '13px',
          fontWeight: '500',
          background: '#2a2a2a',
          color: '#e5e5e5',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.2s',
          boxShadow: isOpen ? '0 0 0 2px #141414, 0 0 0 4px #e50914' : 'none',
        }}
        onMouseEnter={(e) =>
          !isOpen && (e.currentTarget.style.background = '#3a3a3a')
        }
        onMouseLeave={(e) =>
          !isOpen && (e.currentTarget.style.background = '#2a2a2a')
        }
      >
        <span>
          {selected.length === 0 ? 'Select...' : `${selected.length} selected`}
        </span>
        <span
          style={{
            fontSize: '10px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: '#1a1a1a',
            border: `1px solid #404040`,
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 1000,
            maxHeight: '250px',
            overflowY: 'auto',
          }}
        >
          {options.map((option) => (
            <button
              key={option}
              onClick={() => toggleOption(option)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: selected.includes(option) ? '#2a2a2a' : 'transparent',
                color: selected.includes(option) ? '#e50914' : '#b3b3b3',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontSize: '13px',
                fontWeight: selected.includes(option) ? '600' : '500',
                borderLeft: selected.includes(option)
                  ? '3px solid #e50914'
                  : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2a2a2a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = selected.includes(option)
                  ? '#2a2a2a'
                  : 'transparent';
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => {}}
                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#e50914' }}
              />
              {option}
            </button>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#e50914', fontWeight: '600' }}>
          {selected.length} selected
        </p>
      )}
    </div>
  );
}

// ── AgentFilters (exported) ────────────────────────────────────────────────────
export default function AgentFilters({ filters, setFilters, onClear }) {
  const colors = { text: '#ffffff' };

  const hasActiveFilters =
    filters.highVis.length > 0 ||
    filters.operators.length > 0 ||
    filters.statuses.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end;

  const handleDateChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { ...prev.dateRange, [key]: value },
    }));
  };

  return (
    <div
      style={{
        padding: '20px 24px',
        borderBottom: '1px solid #404040',
        background: '#1a1a1a',
        transition: 'all 0.3s',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '20px',
          marginBottom: '16px',
          alignItems: 'start',
        }}
      >
        {/* High Visibility */}
        <FilterDropdown
          label="High Visibility"
          options={['Yes', 'No']}
          selected={filters.highVis}
          onChange={(val) => setFilters((prev) => ({ ...prev, highVis: val }))}
          singleSelect={true}
        />

        {/* Publish Date Range */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#757575',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Publish Date Range
          </label>
          <div style={{ display: 'flex', gap: '8px', flexDirection: 'row' }}>
            <input
              type="datetime-local"
              value={filters.dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #404040',
                fontSize: '12px',
                fontFamily: globalFont,
                outline: 'none',
                background: '#2a2a2a',
                color: colors.text,
              }}
              placeholder="Start date"
            />
            <input
              type="datetime-local"
              value={filters.dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #404040',
                fontSize: '12px',
                fontFamily: globalFont,
                outline: 'none',
                background: '#2a2a2a',
                color: colors.text,
              }}
              placeholder="End date"
            />
          </div>
          {(filters.dateRange.start || filters.dateRange.end) && (
            <p
              style={{
                margin: '6px 0 0 0',
                fontSize: '11px',
                color: '#e50914',
                fontWeight: '600',
              }}
            >
              Date range active
            </p>
          )}
        </div>
      </div>

      {/* Clear All */}
      {hasActiveFilters && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClear}
            style={{
              padding: '8px 16px',
              background: '#2a2a2a',
              border: '1px solid #404040',
              borderRadius: '6px',
              color: '#ef4444',
              fontWeight: '600',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#3a3a3a')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2a2a2a')}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}