import React, { useState } from 'react';
import { globalFont } from './QADashboardConstants';

// ── View Comment Modal ─────────────────────────────────────────────────────
export const ViewCommentModal = ({ text, onClose }) => (
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
    <div style={{background:'#1a1a1a',borderRadius:'16px',padding:'32px',width:'480px',maxWidth:'90vw',border:'1px solid #2a2a2a',boxShadow:'0 25px 60px rgba(0,0,0,0.8)',fontFamily:globalFont}}>
      <h2 style={{margin:'0 0 16px',fontSize:'18px',fontWeight:'700',color:'#fff'}}>Notes</h2>
      <div style={{background:'#222',padding:'16px',borderRadius:'10px',border:'1px solid #2a2a2a',maxHeight:'260px',overflowY:'auto',whiteSpace:'pre-wrap',fontSize:'13px',color:'#ccc',lineHeight:'1.7'}}>
        {text||'No comments'}
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:'20px'}}>
        <button onClick={onClose} style={{padding:'10px 24px',background:'#6366f1',border:'none',borderRadius:'8px',color:'#fff',fontWeight:'700',fontSize:'13px',cursor:'pointer',fontFamily:globalFont}}
          onMouseEnter={(e)=>e.currentTarget.style.background='#4338ca'}
          onMouseLeave={(e)=>e.currentTarget.style.background='#6366f1'}>
          Close
        </button>
      </div>
    </div>
  </div>
);

// ── QA Fail Modal ──────────────────────────────────────────────────────────
// QA must write a reason AND pick the agent who reworks the ticket before
// the FAIL can be submitted (maps to qa-complete { result:'FAIL', agentId, feedback }).
export const QAFailModal = ({ ticket, agentList = [], onSubmit, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [agentId, setAgentId]   = useState('');
  const canSubmit = feedback.trim().length > 0 && !!agentId;

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div style={{background:'#1a1a1a',borderRadius:'16px',padding:'32px',width:'520px',maxWidth:'90vw',border:'1px solid #2a2a2a',boxShadow:'0 25px 60px rgba(0,0,0,0.8)',fontFamily:globalFont}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>❌</div>
          <div>
            <h2 style={{margin:0,fontSize:'17px',fontWeight:'800',color:'#fff'}}>Fail & send for rework</h2>
            <p style={{margin:0,fontSize:'11px',color:'#555'}}>{ticket?.id} · {ticket?.taskName}</p>
          </div>
        </div>

        {/* Rework agent (required) */}
        <label style={{display:'block',fontSize:'11px',fontWeight:'700',color:'#555',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.08em'}}>
          Rework agent <span style={{color:'#ef4444'}}>*</span>
        </label>
        <select
          value={agentId}
          onChange={(e)=>setAgentId(e.target.value)}
          style={{width:'100%',padding:'12px',borderRadius:'10px',border:'1px solid #333',background:'#222',color:'#fff',fontSize:'13px',fontFamily:globalFont,outline:'none',boxSizing:'border-box',marginBottom:'18px',cursor:'pointer'}}
        >
          <option value="">— Select agent to rework —</option>
          {agentList.map(a => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </select>

        {/* Failure reason (required) */}
        <label style={{display:'block',fontSize:'11px',fontWeight:'700',color:'#555',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.08em'}}>
          Failure reason <span style={{color:'#ef4444'}}>*</span>
        </label>
        <textarea
          value={feedback}
          onChange={(e)=>setFeedback(e.target.value)}
          placeholder="What must the agent fix? Be specific…"
          rows={4}
          style={{width:'100%',padding:'14px',borderRadius:'10px',border:'1px solid #333',background:'#222',color:'#fff',fontSize:'13px',fontFamily:globalFont,resize:'vertical',outline:'none',boxSizing:'border-box',marginBottom:'16px',lineHeight:'1.6'}}
          onFocus={(e)=>e.target.style.border='1px solid #ef4444'}
          onBlur={(e)=>e.target.style.border='1px solid #333'}
        />

        {/* Quick reasons */}
        <div style={{marginBottom:'20px',display:'flex',gap:'6px',flexWrap:'wrap'}}>
          {['Asset size mismatch','Copy error','Wrong link','Thumbnail issue','Timing/schedule wrong'].map(t => (
            <button key={t} onClick={()=>setFeedback(f => f ? `${f}; ${t}` : t)}
              style={{padding:'5px 10px',borderRadius:'6px',border:'1px solid #333',background:'#222',color:'#888',fontSize:'11px',cursor:'pointer',fontFamily:globalFont}}
              onMouseEnter={(e)=>{e.currentTarget.style.background='rgba(239,68,68,0.15)';e.currentTarget.style.color='#f87171';}}
              onMouseLeave={(e)=>{e.currentTarget.style.background='#222';e.currentTarget.style.color='#888';}}>
              {t}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
          <button onClick={onClose}
            style={{padding:'10px 20px',background:'#222',border:'1px solid #333',borderRadius:'8px',color:'#aaa',fontWeight:'600',fontSize:'13px',cursor:'pointer',fontFamily:globalFont}}>
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={()=>onSubmit({ agentId, feedback: feedback.trim() })}
            title={canSubmit ? undefined : 'Pick an agent and write a reason first'}
            style={{padding:'10px 24px',background:canSubmit?'#ef4444':'#3a1a1a',border:'none',borderRadius:'8px',color:canSubmit?'#fff':'#77494a',fontWeight:'700',fontSize:'13px',cursor:canSubmit?'pointer':'not-allowed',fontFamily:globalFont}}>
            ❌ Fail & send to agent
          </button>
        </div>
      </div>
    </div>
  );
};

// ── QA Comment Modal ───────────────────────────────────────────────────────
export const QACommentModal = ({ ticket, onSave, onClose }) => {
  const [comment, setComment] = useState(ticket?.qaComment || '');

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
      <div style={{background:'#1a1a1a',borderRadius:'16px',padding:'32px',width:'500px',maxWidth:'90vw',border:'1px solid #2a2a2a',boxShadow:'0 25px 60px rgba(0,0,0,0.8)',fontFamily:globalFont}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>
            🔍
          </div>
          <div>
            <h2 style={{margin:0,fontSize:'17px',fontWeight:'800',color:'#fff'}}>QA Comment</h2>
            <p style={{margin:0,fontSize:'11px',color:'#555'}}>{ticket?.id} · {ticket?.taskName}</p>
          </div>
        </div>

        {/* QA Status Badge */}
        {ticket?.qaStatus && (
          <div style={{marginBottom:'16px',display:'inline-flex',alignItems:'center',gap:'6px',padding:'5px 12px',borderRadius:'999px',background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.25)'}}>
            <span style={{fontSize:'12px',color:'#818cf8',fontWeight:'700',fontFamily:globalFont}}>
              Status: {ticket.qaStatus}
            </span>
          </div>
        )}

        {/* Comment textarea */}
        <label style={{display:'block',fontSize:'11px',fontWeight:'700',color:'#555',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'0.08em'}}>
          QA Review Comment
        </label>
        <textarea
          value={comment}
          onChange={(e)=>setComment(e.target.value)}
          placeholder="Enter QA review notes, issues found, or approval comment..."
          rows={5}
          style={{width:'100%',padding:'14px',borderRadius:'10px',border:'1px solid #333',background:'#222',color:'#fff',fontSize:'13px',fontFamily:globalFont,resize:'vertical',outline:'none',boxSizing:'border-box',marginBottom:'20px',lineHeight:'1.6'}}
          onFocus={(e)=>e.target.style.border='1px solid #6366f1'}
          onBlur={(e)=>e.target.style.border='1px solid #333'}
        />

        {/* Quick templates */}
        <div style={{marginBottom:'20px'}}>
          <p style={{margin:'0 0 8px',fontSize:'11px',color:'#444',fontFamily:globalFont,fontWeight:'700',textTransform:'uppercase',letterSpacing:'0.07em'}}>
            Quick Templates
          </p>
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
            {[
              'All checks passed ✅',
              'Asset size mismatch ❌',
              'Copy error found ❌',
              'Approved with minor notes ✅',
              'Needs rework 🔄'
            ].map(t => (
              <button key={t} onClick={()=>setComment(t)}
                style={{padding:'5px 10px',borderRadius:'6px',border:'1px solid #333',background:'#222',color:'#888',fontSize:'11px',cursor:'pointer',fontFamily:globalFont,transition:'all 0.15s'}}
                onMouseEnter={(e)=>{e.currentTarget.style.background='rgba(99,102,241,0.15)';e.currentTarget.style.color='#818cf8';e.currentTarget.style.borderColor='rgba(99,102,241,0.3)';}}
                onMouseLeave={(e)=>{e.currentTarget.style.background='#222';e.currentTarget.style.color='#888';e.currentTarget.style.borderColor='#333';}}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{display:'flex',gap:'10px',justifyContent:'flex-end'}}>
          <button onClick={onClose}
            style={{padding:'10px 20px',background:'#222',border:'1px solid #333',borderRadius:'8px',color:'#aaa',fontWeight:'600',fontSize:'13px',cursor:'pointer',fontFamily:globalFont}}
            onMouseEnter={(e)=>e.currentTarget.style.background='#2a2a2a'}
            onMouseLeave={(e)=>e.currentTarget.style.background='#222'}>
            Cancel
          </button>
          <button onClick={()=>onSave(ticket.id, comment)}
            style={{padding:'10px 24px',background:'#6366f1',border:'none',borderRadius:'8px',color:'#fff',fontWeight:'700',fontSize:'13px',cursor:'pointer',fontFamily:globalFont,boxShadow:'0 4px 14px rgba(99,102,241,0.3)',transition:'all 0.2s'}}
            onMouseEnter={(e)=>{e.currentTarget.style.background='#4338ca';e.currentTarget.style.transform='translateY(-1px)';}}
            onMouseLeave={(e)=>{e.currentTarget.style.background='#6366f1';e.currentTarget.style.transform='none';}}>
            💾 Save Comment
          </button>
        </div>
      </div>
    </div>
  );
};