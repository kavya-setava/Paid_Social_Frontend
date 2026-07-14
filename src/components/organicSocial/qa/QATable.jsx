import React, { useState, useEffect } from 'react';
import {
  QA_STATUS_STYLES,
  globalFont, formatMins, formatTimer
} from './QADashboardConstants';
import {
  SOCIALITE_STYLES, SCHEDULED_PLATFORM_STYLES, PLATFORM_COLUMN_STYLES,
  POST_TYPE_STYLES, PLACEMENT_STYLE, PAGE_STYLE,
  ReadOnlyBadge,
} from '../shared/ticketFields';

// QA is view-only for these fields — show the value the agent/QM set, or "—".
const ROField = ({ value, styleMap, style }) =>
  value
    ? <ReadOnlyBadge value={value} style={style || (styleMap ? styleMap[value] : undefined)} />
    : <span style={{ color: '#444', fontSize: '12px' }}>—</span>;

// ── Live Timer Hook ────────────────────────────────────────────────────────
const useLiveTimer = (startTime) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) { setElapsed(0); return; }
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  return elapsed;
};

// ── QA Utilization Cell ────────────────────────────────────────────────────
const QAUtilizationCell = ({ ticket, activeStartTime }) => {
  const isRunning   = ticket.apiStatus === 'QA_IN_PROGRESS';
  const liveElapsed = useLiveTimer(isRunning ? activeStartTime : null);

  // Running total = banked QA seconds (previous rounds/segments) + current
  // segment, so it continues across resume and survives tab close.
  const bankedSecs  = ticket.qaActiveSeconds || 0;
  const liveSecs    = isRunning ? liveElapsed : 0;
  const totalSecs   = bankedSecs + liveSecs;
  const totalMins   = Math.floor(totalSecs / 60);

  if (isRunning) {
    return (
      <div style={{ minWidth: '150px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'4px' }}>
          <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#3b82f6', flexShrink:0, boxShadow:'0 0 8px rgba(59,130,246,0.8)', animation:'qaTimerPulse 1.2s ease-in-out infinite', display:'inline-block' }} />
          <span style={{ fontFamily:'monospace', fontSize:'14px', fontWeight:'800', color:'#3b82f6', letterSpacing:'0.05em' }}>
            {formatTimer(totalSecs)}
          </span>
        </div>
        <div style={{ fontSize:'10px', color:'#555', fontFamily:globalFont }}>🔵 Live · total QA time</div>
      </div>
    );
  }

  if (totalMins === 0) {
    return (
      <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'4px 10px', borderRadius:'999px', background:'rgba(255,255,255,0.03)', border:'1px solid #2a2a2a' }}>
        <span style={{ fontSize:'10px', color:'#6b7280' }}>⏱</span>
        <span style={{ fontSize:'11px', color:'#6b7280', fontFamily:globalFont }}>Not started</span>
      </div>
    );
  }

  const col = QA_STATUS_STYLES[ticket.qaStatus]?.color || '#6366f1';
  return (
    <div style={{ minWidth:'130px' }}>
      <div style={{ height:'4px', borderRadius:'999px', background:'#2a2a2a', marginBottom:'6px', overflow:'hidden' }}>
        <div style={{ width:'100%', height:'100%', background:col, borderRadius:'999px' }} />
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
        <span style={{ fontSize:'12px' }}>🔍</span>
        <span style={{ fontSize:'13px', fontWeight:'800', color:col, fontFamily:globalFont }}>{formatMins(totalMins)}</span>
        <span style={{ fontSize:'10px', color:'#6b7280', fontFamily:globalFont }}>reviewed</span>
      </div>
    </div>
  );
};

// ── Agent Utilization Cell (read-only for QA) ─────────────────────────────
const AgentTimeCell = ({ ticket }) => {
  const mins = ticket.agentMinutes || 0;
  if (mins === 0) return <span style={{ color:'#6b7280', fontSize:'12px' }}>—</span>;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
      <span style={{ fontSize:'12px' }}>👤</span>
      <span style={{ fontSize:'12px', fontWeight:'700', color:'#3b82f6', fontFamily:globalFont }}>{formatMins(mins)}</span>
    </div>
  );
};

// ── Comment Cell ───────────────────────────────────────────────────────────
const CommentCell = ({ comments, onView }) => {
  const list = Array.isArray(comments) ? comments : [];
  if (list.length === 0) return <span style={{ color:'#6b7280', fontSize:'12px' }}>—</span>;
  return (
    <span onClick={() => onView(list.map(c => c.message||c).join('\n\n'))}
      style={{ color:'#6366f1', fontSize:'12px', fontWeight:'600', cursor:'pointer' }}
      onMouseEnter={(e) => e.currentTarget.style.textDecoration='underline'}
      onMouseLeave={(e) => e.currentTarget.style.textDecoration='none'}>
      View ({list.length})
    </span>
  );
};

// ── Small action button ─────────────────────────────────────────────────────
const QaBtn = ({ label, onClick, disabled, bg, color, border }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding:'6px 12px', borderRadius:'7px',
      border:`1px solid ${disabled ? '#2a2a2a' : border}`,
      background: disabled ? '#181818' : bg,
      color: disabled ? '#555' : color,
      fontSize:'11px', fontWeight:'700',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily:globalFont, whiteSpace:'nowrap',
    }}
  >
    {label}
  </button>
);

// ── QA lifecycle action cell (Start / Pass / Fail→modal) ─────────────────────
const QAActionCell = ({ ticket, disabled, onQaStart, onQaComplete, onOpenFail }) => {
  const s = ticket.apiStatus;

  if (s === 'PENDING_QA') {
    return (
      <QaBtn
        label="▶ Start Review" disabled={disabled}
        onClick={() => onQaStart(ticket)}
        bg="rgba(99,102,241,0.12)" color="#818cf8" border="rgba(99,102,241,0.4)"
      />
    );
  }

  if (s === 'QA_IN_PROGRESS') {
    return (
      <div style={{ display:'flex', gap:'6px' }}>
        <QaBtn
          label="✅ Pass" disabled={disabled}
          onClick={() => onQaComplete(ticket, { result: 'PASS' })}
          bg="rgba(34,197,94,0.12)" color="#22c55e" border="rgba(34,197,94,0.4)"
        />
        <QaBtn
          label="❌ Fail" disabled={disabled}
          onClick={() => onOpenFail(ticket)}
          bg="rgba(239,68,68,0.12)" color="#ef4444" border="rgba(239,68,68,0.4)"
        />
      </div>
    );
  }

  const map = {
    QA_PASSED: { t: 'Passed',    c: '#22c55e', b: '#0a1a0a' },
    COMPLETED: { t: 'Completed', c: '#22c55e', b: '#0a1a0a' },
    QA_FAILED: { t: 'Failed → reworking', c: '#ef4444', b: '#2a0a0a' },
  };
  const m = map[s] || { t: ticket.qaStatus, c: '#888', b: '#222' };
  return (
    <span style={{
      padding:'5px 10px', borderRadius:'999px', background:m.b, color:m.c,
      fontSize:'11px', fontWeight:'700', whiteSpace:'nowrap', fontFamily:globalFont,
    }}>
      {m.t}
    </span>
  );
};

// ── Main QA Table ──────────────────────────────────────────────────────────
const QATable = ({ tickets, disabled, onQaStart, onQaComplete, onOpenFail, onViewComment, onOpenQAModal }) => {

  const formatDate = (raw) => {
    if (!raw) return '—';
    try { return new Date(raw).toLocaleString('en-US',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:true}); }
    catch { return '—'; }
  };

  const getByType = (comments, type) =>
    Array.isArray(comments) ? comments.filter(c => c?.type?.toLowerCase() === type.toLowerCase()) : [];

  const thStyle = {
    padding:'12px 14px', fontSize:'10px', fontWeight:'700',
    color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em',
    whiteSpace:'nowrap', position:'sticky', top:0,
    background:'#161616', zIndex:2, borderBottom:'2px solid #2a2a2a'
  };

  const headers = [
    'Ticket ID','Received','Publish Date','Socialite Link',
    'Task Name','Task Type','High Vis','No. of Assets',
    'Agent','Assigned QA',
    'Platform','Socialite Status','Monday Status','Scheduled Platform',
    'Placement','Page','Post Type','Creator Team on Socialite',
    'Monday Status Link','Agent Time',
    'QA Status',        // ← read-only badge
    'Action',           // ← Start / Pass / Fail (real lifecycle)
    'My QA Time',       // ← live timer
    'QA Comment',       // ← QA adds comment
    'Re-Assign QA',     // ← rework info
    'QM Notes','Agent Notes'
  ];

  return (
    <>
      <style>{`
        @keyframes qaTimerPulse {
          0%,100%{opacity:1;transform:scale(1);}
          50%{opacity:0.5;transform:scale(1.4);}
        }
      `}</style>

      <div style={{ overflowX:'auto', width:'100%' }}>
        <table style={{ width:'100%', minWidth:'2200px', borderCollapse:'collapse', textAlign:'left', fontFamily:globalFont }}>
          <thead>
            <tr>{headers.map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr><td colSpan={headers.length} style={{padding:'48px',textAlign:'center',color:'#6b7280',fontSize:'14px'}}>No tickets found</td></tr>
            ) : tickets.map((ticket) => {
              const tid  = ticket._id || ticket.id;
              const qmC  = getByType(ticket.comments, 'QM');
              const agC  = getByType(ticket.comments, 'Agent');
              const qs   = QA_STATUS_STYLES[ticket.qaStatus] || { bg:'#222', color:'#555' };

              return (
                <tr key={tid}
                  style={{ borderBottom:'1px solid #1e1e1e', background:'#1a1a1a', transition:'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background='#202020'}
                  onMouseLeave={(e) => e.currentTarget.style.background='#1a1a1a'}
                >
                  {/* Ticket ID */}
                  <td style={{padding:'12px 14px'}}>
                    <span style={{fontSize:'11px',fontWeight:'700',color:'#818cf8',fontFamily:'monospace'}}>{ticket.id}</span>
                  </td>

                  {/* Received */}
                  <td style={{padding:'12px 14px',fontSize:'12px',color:'#aab0bb',whiteSpace:'nowrap'}}>
                    {formatDate(ticket.taskReceivedTime)}
                  </td>

                  {/* Publish Date */}
                  <td style={{padding:'12px 14px',fontSize:'12px',color:'#e50914',fontWeight:'700',whiteSpace:'nowrap'}}>
                    {formatDate(ticket.publishDateRaw)}
                  </td>

                  {/* Socialite Link */}
                  <td style={{padding:'12px 14px'}}>
                    {ticket.socialiteLink ? (
                      <span onClick={()=>window.open(ticket.socialiteLink,'_blank')}
                        style={{color:'#60a5fa',cursor:'pointer',fontSize:'12px',fontWeight:'600'}}
                        onMouseEnter={(e)=>e.currentTarget.style.textDecoration='underline'}
                        onMouseLeave={(e)=>e.currentTarget.style.textDecoration='none'}>
                        ********
                      </span>
                    ) : <span style={{color:'#6b7280'}}>—</span>}
                  </td>

                  {/* Task Name */}
                  <td style={{padding:'12px 14px',fontSize:'13px',color:'#e5e5e5',maxWidth:'180px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {ticket.taskName||'—'}
                  </td>

                  {/* Task Type */}
                  <td style={{padding:'12px 14px'}}>
                    <span style={{padding:'4px 10px',borderRadius:'999px',background:'#1e3a8a',color:'#93c5fd',fontSize:'11px',fontWeight:'700',border:'1px solid #2563eb',whiteSpace:'nowrap'}}>
                      {ticket.taskType||'NA'}
                    </span>
                  </td>

                  {/* High Vis */}
                  <td style={{padding:'12px 14px'}}>
                    <span style={{padding:'4px 8px',borderRadius:'5px',fontSize:'11px',fontWeight:'700',background:ticket.visibility==='Yes'?'#7f1d1d':'#222',color:ticket.visibility==='Yes'?'#ef4444':'#555'}}>
                      {ticket.visibility||'No'}
                    </span>
                  </td>

                  {/* No. of Assets */}
                  <td style={{padding:'12px 14px'}}>
                    <div style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'4px 10px',borderRadius:'8px',background:'rgba(255,255,255,0.04)',border:'1px solid #2a2a2a'}}>
                      <span style={{fontSize:'12px'}}>📦</span>
                      <span style={{fontSize:'13px',fontWeight:'700',color:'#e5e5e5',fontFamily:globalFont}}>{ticket.noOfAssets||'—'}</span>
                    </div>
                  </td>

                  {/* Agent Name */}
                  <td style={{padding:'12px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <div style={{width:'24px',height:'24px',borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',color:'#fff',fontWeight:'700',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {ticket.assignedAgent?.charAt(0)?.toUpperCase()||'A'}
                      </div>
                      <span style={{fontSize:'12px',fontWeight:'600',color:'#e5e5e5',fontFamily:globalFont}}>
                        {ticket.assignedAgent||'—'}
                      </span>
                    </div>
                  </td>

                  {/* Assigned QA */}
                  <td style={{padding:'12px 14px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                      <div style={{width:'24px',height:'24px',borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#4338ca)',color:'#fff',fontWeight:'700',fontSize:'11px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        {ticket.assignedQA?.charAt(0)?.toUpperCase()||'Q'}
                      </div>
                      <span style={{fontSize:'12px',fontWeight:'600',color:'#818cf8',fontFamily:globalFont}}>
                        {ticket.assignedQA||'Unassigned'}
                      </span>
                    </div>
                  </td>

                  {/* All read-only for QA — shows whatever the agent/QM set */}
                  <td style={{padding:'12px 14px'}}><ROField value={ticket.platform}         styleMap={PLATFORM_COLUMN_STYLES} /></td>
                  <td style={{padding:'12px 14px'}}><ROField value={ticket.socialiteStatus}   styleMap={SOCIALITE_STYLES} /></td>
                  <td style={{padding:'12px 14px'}}><ROField value={ticket.mondayStatus}      styleMap={SOCIALITE_STYLES} /></td>
                  <td style={{padding:'12px 14px'}}><ROField value={ticket.scheduledPlatform} styleMap={SCHEDULED_PLATFORM_STYLES} /></td>
                  <td style={{padding:'12px 14px'}}><ROField value={ticket.placement}         style={PLACEMENT_STYLE} /></td>
                  <td style={{padding:'12px 14px'}}><ROField value={ticket.page}              style={PAGE_STYLE} /></td>
                  <td style={{padding:'12px 14px'}}><ROField value={ticket.postType}          styleMap={POST_TYPE_STYLES} /></td>
                  <td style={{padding:'12px 14px'}}>
                    <span style={{ fontSize:'12px', color: ticket.creatorTeam ? '#ccc' : '#444', fontFamily:globalFont }}>
                      {ticket.creatorTeam || '—'}
                    </span>
                  </td>

                  {/* Monday Status Link — read-only (entered by the agent) */}
                  <td style={{padding:'12px 14px'}}>
                    {ticket.mondayStatusLink ? (
                      <span
                        onClick={() => window.open(ticket.mondayStatusLink, '_blank')}
                        style={{ color:'#60a5fa', cursor:'pointer', fontSize:'12px', fontWeight:'600' }}
                        onMouseEnter={(e)=>e.currentTarget.style.textDecoration='underline'}
                        onMouseLeave={(e)=>e.currentTarget.style.textDecoration='none'}
                      >
                        🔗 Open
                      </span>
                    ) : <span style={{ color:'#6b7280' }}>—</span>}
                  </td>

                  {/* Agent Time (read-only) */}
                  <td style={{padding:'12px 14px'}}>
                    <AgentTimeCell ticket={ticket} />
                  </td>

                  {/* ✅ QA Status — read-only badge (driven by backend) */}
                  <td style={{padding:'12px 14px'}}>
                    <span style={{
                      padding:'5px 10px', borderRadius:'20px',
                      background:qs.bg, color:qs.color,
                      fontSize:'11px', fontWeight:'700',
                      whiteSpace:'nowrap', fontFamily:globalFont
                    }}>
                      {ticket.qaStatus || '—'}
                    </span>
                  </td>

                  {/* ✅ Action — real QA lifecycle */}
                  <td style={{padding:'12px 14px'}}>
                    <QAActionCell
                      ticket={ticket}
                      disabled={disabled}
                      onQaStart={onQaStart}
                      onQaComplete={onQaComplete}
                      onOpenFail={onOpenFail}
                    />
                  </td>

                  {/* ✅ My QA Time — live timer (backend clock) */}
                  <td style={{padding:'12px 14px'}}>
                    <QAUtilizationCell ticket={ticket} activeStartTime={ticket.qaRunningSince} />
                  </td>

                  {/* ✅ QA Comment */}
                  <td style={{padding:'12px 14px',minWidth:'180px'}}>
                    <button
                      onClick={()=>onOpenQAModal(ticket)}
                      style={{
                        padding:'6px 12px',borderRadius:'7px',
                        border: ticket.qaComment
                          ? '1px solid rgba(99,102,241,0.4)'
                          : '1px solid #333',
                        background: ticket.qaComment
                          ? 'rgba(99,102,241,0.12)'
                          : '#222',
                        color: ticket.qaComment ? '#818cf8' : '#666',
                        fontSize:'11px',fontWeight:'700',
                        cursor:'pointer',fontFamily:globalFont,
                        display:'flex',alignItems:'center',gap:'6px',
                        transition:'all 0.2s',whiteSpace:'nowrap'
                      }}
                      onMouseEnter={(e)=>{e.currentTarget.style.background='rgba(99,102,241,0.2)';e.currentTarget.style.color='#818cf8';}}
                      onMouseLeave={(e)=>{e.currentTarget.style.background=ticket.qaComment?'rgba(99,102,241,0.12)':'#222';e.currentTarget.style.color=ticket.qaComment?'#818cf8':'#666';}}
                    >
                      {ticket.qaComment ? '✏️ Edit Comment' : '+ Add QA Comment'}
                    </button>
                    {ticket.qaComment && (
                      <p style={{margin:'4px 0 0',fontSize:'10px',color:'#555',fontFamily:globalFont,maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {ticket.qaComment}
                      </p>
                    )}
                  </td>

                  {/* ✅ Re-Work info — FAIL routes rework to an agent (see Action) */}
                  <td style={{padding:'12px 14px'}}>
                    {ticket.reworkCount > 0 ? (
                      <div style={{display:'inline-flex',alignItems:'center',gap:'5px',padding:'4px 10px',borderRadius:'999px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)'}}>
                        <span style={{fontSize:'10px'}}>🔁</span>
                        <span style={{fontSize:'10px',color:'#f87171',fontWeight:'700',fontFamily:globalFont}}>
                          Rework ×{ticket.reworkCount}
                        </span>
                      </div>
                    ) : (
                      <span style={{fontSize:'12px',color:'#6b7280'}}>—</span>
                    )}
                  </td>

                  {/* QM Notes */}
                  <td style={{padding:'12px 14px'}}>
                    <CommentCell comments={qmC} onView={onViewComment} />
                  </td>

                  {/* Agent Notes */}
                  <td style={{padding:'12px 14px'}}>
                    <CommentCell comments={agC} onView={onViewComment} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default QATable;