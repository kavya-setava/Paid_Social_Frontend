// Shared ticket field columns (options, style maps, and cell components)
// used by the QM / Agent / QA tables so the dropdowns stay consistent.
import React, { useState } from 'react';

export const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

// ── Option lists ─────────────────────────────────────────────────────────────
export const SOCIALITE_STATUS_OPTIONS = [
  'Posted','Ready To Post','Scheduled','Removed','Cancelled',
  'Draft / Ready For Review','Rescheduled - Re-Work',
  'Takedown Request','Trafficked And Cancelled'
];
export const MONDAY_STATUS_OPTIONS = SOCIALITE_STATUS_OPTIONS;
export const SCHEDULED_PLATFORM_OPTIONS = ['Desktop','Mobile','Sprinklr'];
export const PLATFORM_COLUMN_OPTIONS = ['Instagram','Facebook','X','Tiktok','Threads','Pinterest'];
export const PLACEMENT_OPTIONS = [
  'Instagram Feed','Facebook Feed','X Feed','Instagram Reels','Instagram Story',
  'X Thread','Facebook Story','Facebook Reels','Tiktok Feed','X Retweet','Facebook Cover',
  'Instagram Collab','Facebook A/B Testing','X Website Card','X Cover','Instagram Poll',
  'Twitter Poll','Threads Feed','Ig Bio'
];
export const PAGE_OPTIONS = [
  'Netflix Romania','Netflix Türkiye','Netflix Netherlands & Belgium','Netflix Portugal',
  'Netflix Spain','Netflix MENA','Netflix South Africa','Netflix (FI, IS)','Netflix Italy',
  'Netflix (NO)','Netflix (DK)','Netflix Sverige','Netflix Israel','Netflix Germany',
  'Netflix danmark','Netflix Poland','Netflix (SE)','Netflix UK & Ireland','Netflix Nordic'
];
export const POST_TYPE_OPTIONS = [
  'Video Post','Single Image Post','Text Post','Carousel(Image + Video)'
];

// ── Style maps ───────────────────────────────────────────────────────────────
export const SOCIALITE_STYLES = {
  'Posted':                  { bg: '#0a1a0a', color: '#22c55e' },
  'Ready To Post':           { bg: '#2a2000', color: '#eab308' },
  'Scheduled':               { bg: '#0a1a2a', color: '#60a5fa' },
  'Removed':                 { bg: '#1a0a0a', color: '#f87171' },
  'Cancelled':               { bg: '#2a0a0a', color: '#ef4444' },
  'Draft / Ready For Review':{ bg: '#2a1a00', color: '#fb923c' },
  'Rescheduled - Re-Work':   { bg: '#1a1a0a', color: '#fbbf24' },
  'Takedown Request':        { bg: '#1a0a2a', color: '#c084fc' },
  'Trafficked And Cancelled':{ bg: '#2a0a0a', color: '#fca5a5' },
};
export const SCHEDULED_PLATFORM_STYLES = {
  'Desktop':  { bg: '#0a1a2a', color: '#60a5fa' },
  'Mobile':   { bg: '#0a2a1a', color: '#34d399' },
  'Sprinklr': { bg: '#1a0a2a', color: '#c084fc' },
};
export const PLATFORM_COLUMN_STYLES = {
  'Instagram': { bg: '#2a0a1a', color: '#f472b6' },
  'Facebook':  { bg: '#0a1a2a', color: '#60a5fa' },
  'X':         { bg: '#1a1a1a', color: '#e5e5e5' },
  'Tiktok':    { bg: '#0a2a2a', color: '#2dd4bf' },
  'Threads':   { bg: '#1a0a2a', color: '#a78bfa' },
  'Pinterest': { bg: '#2a0a0a', color: '#f87171' },
};
export const POST_TYPE_STYLES = {
  'Video Post':              { bg: '#2a0a0a', color: '#f87171' },
  'Single Image Post':       { bg: '#0a1a2a', color: '#60a5fa' },
  'Text Post':               { bg: '#1a1a0a', color: '#fbbf24' },
  'Carousel(Image + Video)': { bg: '#0a2a1a', color: '#4ade80' },
};
export const PLACEMENT_STYLE = { bg: '#1a0a2a', color: '#c084fc' };
export const PAGE_STYLE = { bg: '#0a1a2a', color: '#60a5fa' };

// ── Reusable inline select ───────────────────────────────────────────────────
// If the saved `value` isn't in this role's `options` (e.g. QM set
// "Ready To Post" but the agent's list is limited), we still inject it as an
// option so the controlled <select> can display it instead of falling back to
// the empty placeholder.
export const InlineSelect = ({ value, options, onChange, styleMap, disabled }) => {
  const s = styleMap?.[value] || { bg: '#222', color: '#888' };
  const opts = value && !options.includes(value) ? [value, ...options] : options;
  return (
    <select
      value={value || ''}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '5px 8px', borderRadius: '6px',
        border: `1px solid ${s.color}44`,
        background: s.bg, color: s.color,
        fontSize: '11px', fontWeight: '700',
        cursor: disabled ? 'not-allowed' : 'pointer', outline: 'none',
        fontFamily: globalFont, minWidth: '120px', opacity: disabled ? 0.6 : 1,
      }}
    >
      {!value && <option value="">— Select —</option>}
      {opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
};

// ── Read-only value badge (when the API already provides the value) ──────────
export const ReadOnlyBadge = ({ value, style }) => {
  const s = style || { bg: '#0a1a2a', color: '#60a5fa' };
  return (
    <span style={{
      display: 'inline-block', padding: '5px 10px', borderRadius: '6px',
      background: s.bg, color: s.color, fontSize: '11px', fontWeight: '700',
      fontFamily: globalFont, whiteSpace: 'nowrap',
    }}>
      {value}
    </span>
  );
};

// ── Creator team text input ──────────────────────────────────────────────────
export const CreatorTeamInput = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder="Enter team name…"
      style={{
        padding: '6px 10px', borderRadius: '6px',
        border: `1px solid ${focused ? '#60a5fa66' : '#2a2a2a'}`,
        background: focused ? '#0a1a2a' : '#1a1a1a',
        color: focused ? '#93c5fd' : '#aaa',
        fontSize: '12px', outline: 'none', fontFamily: globalFont,
        minWidth: '150px', maxWidth: '200px', transition: 'all 0.2s',
      }}
    />
  );
};
