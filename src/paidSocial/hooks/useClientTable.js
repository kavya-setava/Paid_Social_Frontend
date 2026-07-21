import { useState, useMemo, useEffect } from 'react';

// Client-side search (across ALL fields) + pagination for a table.
// Pass the full list of normalized rows; get back the current page's rows plus
// search/pagination state. Search matches any string/number field on the row
// (skips nested objects like _raw / _ticket).
export default function useClientTable(rows, pageSize = 10) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      Object.entries(r).some(([k, v]) => {
        if (k.startsWith('_')) return false;      // skip _raw / _ticket
        if (v == null || typeof v === 'object') return false;
        return String(v).toLowerCase().includes(q);
      })
    );
  }, [rows, query]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset to a valid page whenever the result set shrinks.
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return { query, setQuery, page, setPage, total, totalPages, pageRows };
}
