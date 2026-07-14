import React from 'react';

const globalFont = "'Netflix Sans', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif";

const colors = {
  text: '#ffffff',
  textSecondary: '#e5e5e5',
  textMuted: '#757575',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const cleanAndFormatDate = (dateString) => {
  if (!dateString) return { display: '—', timestamp: NaN };
  const cleanString = dateString
    .replace('@', '')
    .replace(/\(America\/Los_Angeles\)/, '')
    .trim();
  const dateObj = new Date(cleanString);
  if (isNaN(dateObj)) return { display: 'Invalid Date', timestamp: NaN };
  return {
    display: dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    dateOnly: dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    dateTime: dateObj.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    fullDisplay: dateObj.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
    timestamp: dateObj.getTime(),
  };
};

const getCommentsByType = (comments, type) => {
  if (!Array.isArray(comments)) return [];
  return comments.filter(
    (c) => c?.type?.toLowerCase() === type.toLowerCase()
  );
};

// ── CommentCell ────────────────────────────────────────────────────────────────
const CommentCell = ({ comments, setViewComment }) => (
  <div
    style={{ cursor: 'pointer', color: '#e50914', fontSize: '12px', fontWeight: '600' }}
    onClick={() =>
      setViewComment({
        show: true,
        text: comments.map((c) => c.message).join('\n\n'),
      })
    }
  >
    View ({comments.length})
  </div>
);

// ── AgentTable (exported) ──────────────────────────────────────────────────────
export default function AgentTable({
  tickets,
  activeTab,
  currentTime,
  setViewComment,
  handleWorkflowStatusChange,
  getStatusOptions,
}) {
  const thStyle = {
    padding: '16px 24px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white',
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          minWidth: '1500px',
          borderCollapse: 'collapse',
          textAlign: 'left',
        }}
      >
        {/* ── THEAD ── */}
        <thead>
          <tr style={{ borderBottom: '1px solid #404040' }}>
            <th style={thStyle}>Received</th>
            <th style={thStyle}>Publish Date (PST)</th>
            <th style={thStyle}>Socialite Link</th>
            <th style={thStyle}>Task Name</th>
            <th style={thStyle}>Task Type</th>

            {(activeTab === 'Assigned' ||
              activeTab === 'Calendar Invite' ||
              activeTab === 'Reassigned') && (
              <th
                style={{
                  ...thStyle,
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}
              >
                SLA
              </th>
            )}

            <th style={thStyle}>High Visibility</th>

            {(activeTab === 'All' ||
              activeTab === 'Assigned' ||
              activeTab === 'Calendar Invite' ||
              activeTab === 'Reassigned') && (
              <th style={thStyle}>Status</th>
            )}

            {(activeTab === 'Assigned' ||
              activeTab === 'Calendar Invite' ||
              activeTab === 'Reassigned') && (
              <th style={thStyle}>Checklist</th>
            )}

            <th style={thStyle}>QM Comments</th>
            <th style={thStyle}>QA Comments</th>
            <th style={thStyle}>Agent Comments</th>
            <th style={thStyle}></th>
          </tr>
        </thead>

        {/* ── TBODY ── */}
        <tbody>
          {tickets?.map((ticket) => {
            const qmComments    = getCommentsByType(ticket.comments, 'QM');
            const qaComments    = getCommentsByType(ticket.comments, 'QA');
            const agentComments = getCommentsByType(ticket.comments, 'Agent');

            // ── SLA calculation ───────────────────────────────────────────────
            let slaText          = 'NA';
            let formattedSlaTime = 'NA';
            let slaBg            = '#2a2a2a';
            let slaColor         = '#757575';
            let slaBorder        = '#404040';

            if (ticket.slaEndDate) {
              const now        = currentTime;
              const slaDateObj = new Date(ticket.slaEndDate);
              const diffMs     = slaDateObj.getTime() - now;
              const isOverdue  = diffMs <= 0;
              const absDiff    = Math.abs(diffMs);
              const totalMinutes = Math.floor(absDiff / (1000 * 60));
              const hours      = Math.floor(absDiff / (1000 * 60 * 60));
              const minutes    = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
              const seconds    = Math.floor((absDiff % (1000 * 60)) / 1000);

              slaText = isOverdue
                ? `-${hours}h ${minutes}m ${seconds}s`
                : `${hours}h ${minutes}m ${seconds}s`;

              if (isOverdue) {
                slaBg = '#7f1d1d'; slaColor = '#dc2626'; slaBorder = '#ef4444';
              } else if (totalMinutes > 60) {
                slaBg = '#7f1d1d'; slaColor = '#dc2626'; slaBorder = '#ef4444';
              } else if (totalMinutes >= 30 && totalMinutes <= 60) {
                slaBg = '#7c2d12'; slaColor = '#ea580c'; slaBorder = '#fb923c';
              } else {
                slaBg = '#713f12'; slaColor = '#ca8a04'; slaBorder = '#facc15';
              }

              formattedSlaTime = slaDateObj.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
              });
            }

            return (
              <tr
                key={ticket.id}
                style={{
                  borderBottom: '1px solid #404040',
                  transition: 'all 0.2s',
                  background: '#1a1a1a',
                }}
              >
                {/* Received */}
                <td
                  style={{
                    padding: '16px 24px',
                    fontSize: '12px',
                    color: colors.text,
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ticket.taskReceivedTime}
                </td>

                {/* Publish Date PST */}
                <td
                  style={{
                    padding: '16px 24px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#e50914',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cleanAndFormatDate(ticket.publishDateRaw).dateTime}
                </td>

                {/* Socialite Link */}
                <td
                  style={{
                    padding: '16px 24px',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  {ticket.socialiteLink ? (
                    <span
                      onClick={() =>
                        window.open(
                          ticket.socialiteLink,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                      style={{ color: colors.text, cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#e50914';
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = colors.text;
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {'********'}
                    </span>
                  ) : (
                    <span style={{ color: colors.text }}>{'********'}</span>
                  )}
                </td>

                {/* Task Name */}
                <td
                  style={{
                    padding: '16px 24px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: colors.textSecondary,
                    maxWidth: '250px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ticket.taskName}
                </td>

                {/* Task Type */}
                <td style={{ padding: '16px 24px' }}>
                  <span
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: `1px solid #404040`,
                      background: '#2a2a2a',
                      color: colors.text,
                      fontWeight: '600',
                      fontSize: '11px',
                      display: 'inline-block',
                      fontFamily: globalFont,
                      maxWidth: '150px',
                    }}
                  >
                    {ticket.taskType || 'Select Type'}
                  </span>
                </td>

                {/* SLA */}
                {(activeTab === 'Assigned' ||
                  activeTab === 'Calendar Invite' ||
                  activeTab === 'Reassigned') && (
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        flexDirection: 'column',
                        gap: '4px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background:
                          ticket.assignmentStatus === 'PAUSED'
                            ? '#333333'
                            : slaBg,
                        border: `1px solid ${
                          ticket.assignmentStatus === 'PAUSED'
                            ? '#555555'
                            : slaBorder
                        }`,
                        minWidth: '150px',
                        opacity: ticket.assignmentStatus === 'PAUSED' ? 0.6 : 1,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color:
                            ticket.assignmentStatus === 'PAUSED'
                              ? '#999999'
                              : slaColor,
                        }}
                      >
                        {ticket.assignmentStatus === 'PAUSED'
                          ? '⏸ SLA Paused'
                          : `⏱ ${slaText}`}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          color: colors.textMuted,
                          fontWeight: '500',
                        }}
                      >
                        {ticket.assignmentStatus === 'PAUSED'
                          ? 'Timer Stopped'
                          : `IST: ${formattedSlaTime}`}
                      </span>
                    </div>
                  </td>
                )}

                {/* High Visibility */}
                <td style={{ padding: '16px 24px' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background:
                        ticket.visibility === 'High' ? '#7f1d1d' : '#2a2a2a',
                      color:
                        ticket.visibility === 'High' ? '#ef4444' : '#757575',
                    }}
                  >
                    {ticket.visibility}
                  </span>
                </td>

                {/* Status */}
                {(activeTab === 'All' ||
                  ['Calendar Invite', 'Assigned', 'Reassigned'].includes(
                    activeTab
                  )) ? (
                  <td style={{ padding: '16px 24px' }}>
                    {activeTab === 'All' ? (
                      <span
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontWeight: '600',
                          fontSize: '12px',
                          background: '#2a2a2a',
                          color: '#e50914',
                        }}
                      >
                        {ticket.assignmentStatus}
                      </span>
                    ) : (
                      <div
                        style={{ position: 'relative', display: 'inline-block' }}
                      >
                        <select
                          value={ticket.assignmentStatus}
                          onChange={(e) =>
                            handleWorkflowStatusChange(ticket, e.target.value)
                          }
                          style={{
                            appearance: 'none',
                            padding: '6px 28px 6px 12px',
                            borderRadius: '20px',
                            border: 'none',
                            background: '#2a2a2a',
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '12px',
                            cursor: 'pointer',
                            outline: 'none',
                            fontFamily: globalFont,
                          }}
                        >
                          <option
                            value={ticket.assignmentStatus}
                            style={{ background: '#2a2a2a', color: '#ffffff' }}
                          >
                            {ticket.assignmentStatus}
                          </option>
                          {getStatusOptions()
                            .filter((s) => s !== ticket.status)
                            .map((s) => (
                              <option
                                key={s}
                                value={s}
                                style={{
                                  background: '#2a2a2a',
                                  color: '#ffffff',
                                  padding: '8px',
                                }}
                              >
                                {s}
                              </option>
                            ))}
                        </select>
                        <div
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            color: '#e50914',
                            fontSize: '10px',
                          }}
                        >
                          ▼
                        </div>
                      </div>
                    )}
                  </td>
                ) : null}

                {/* Checklist */}
                {(activeTab === 'Assigned' ||
                  activeTab === 'Calendar Invite' ||
                  activeTab === 'Reassigned') && (
                  <td style={{ padding: '16px 24px' }}>
                    <button
                      onClick={() => {
                        const url = `/agent-checklist/${ticket._id}?assignmentId=${
                          ticket.assignmentId || ''
                        }&socialiteLink=${encodeURIComponent(
                          ticket.socialiteLink || ''
                        )}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      disabled={ticket.isCheckListCompleted === true}
                      style={{
                        padding: '8px 16px',
                        background:
                          ticket.isChecklistCompleted === true
                            ? '#1a1a1a'
                            : '#2a2a2a',
                        border: '1px solid #e50914',
                        borderRadius: '6px',
                        color:
                          ticket.isChecklistCompleted === true
                            ? '#757575'
                            : '#e50914',
                        fontWeight: '600',
                        fontSize: '12px',
                        cursor:
                          ticket.isChecklistCompleted === true
                            ? 'not-allowed'
                            : 'pointer',
                        transition: 'all 0.2s',
                        opacity: ticket.isChecklistCompleted === true ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (ticket.isChecklistCompleted !== true) {
                          e.currentTarget.style.background = '#e50914';
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (ticket.isChecklistCompleted !== true) {
                          e.currentTarget.style.background = '#2a2a2a';
                          e.currentTarget.style.color = '#e50914';
                        }
                      }}
                    >
                      {ticket.isChecklistCompleted === true
                        ? 'Completed'
                        : 'Checklist'}
                    </button>
                  </td>
                )}

                {/* QM Comments */}
                <td style={{ padding: '16px 24px' }}>
                  {qmComments.length > 0 ? (
                    <CommentCell
                      comments={qmComments}
                      setViewComment={setViewComment}
                    />
                  ) : (
                    <span style={{ color: '#757575' }}>NA</span>
                  )}
                </td>

                {/* QA Comments */}
                <td style={{ padding: '16px 24px' }}>
                  {qaComments.length > 0 ? (
                    <CommentCell
                      comments={qaComments}
                      setViewComment={setViewComment}
                    />
                  ) : (
                    <span style={{ color: '#757575' }}>NA</span>
                  )}
                </td>

                {/* Agent Comments */}
                <td style={{ padding: '16px 24px' }}>
                  {agentComments.length > 0 ? (
                    <CommentCell
                      comments={agentComments}
                      setViewComment={setViewComment}
                    />
                  ) : (
                    <span style={{ color: '#757575' }}>NA</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {tickets?.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
          <p style={{ fontSize: '14px', fontWeight: '500' }}>
            No tickets match your filters
          </p>
        </div>
      )}
    </div>
  );
}