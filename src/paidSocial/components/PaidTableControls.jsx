import React from 'react';
import PropTypes from 'prop-types';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './PaidTableControls.css';

// Shared search bar (searches every column) — place above a table.
export const PaidSearch = ({ value, onChange, placeholder = 'Search any field…' }) => (
  <div className="ps-search-bar">
    <Search size={16} />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button type="button" className="ps-search-clear" onClick={() => onChange('')}>
        Clear
      </button>
    )}
  </div>
);

PaidSearch.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

// Shared pagination — place below a table.
export const PaidPagination = ({ page, totalPages, total, onPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="ps-pagination">
      <span className="ps-page-info">
        Page {page} of {totalPages} · {total} ticket{total === 1 ? '' : 's'}
      </span>
      <div className="ps-page-controls">
        <button type="button" disabled={page <= 1} onClick={() => onPage(Math.max(1, page - 1))}>
          <ChevronLeft size={16} /> Prev
        </button>
        <button type="button" disabled={page >= totalPages} onClick={() => onPage(Math.min(totalPages, page + 1))}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

PaidPagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onPage: PropTypes.func.isRequired,
};
