import React, { useState } from 'react';

const globalFont = "'Netflix Sans','Helvetica Neue','Segoe UI',Roboto,Arial,sans-serif";

// Assign-agent modal — QM adds a comment before assigning the operator.
export const AssignModal = ({ ticket, agentName, onConfirm, onCancel }) => {
  const [note, setNote] = useState('');
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#1a1a1a', borderRadius: '16px', padding: '30px', width: '460px', maxWidth: '92vw',
        boxShadow: '0 25px 60px rgba(0,0,0,0.8)', border: '1px solid #333', fontFamily: globalFont
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0,
            background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
          }}>🎬</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#fff' }}>Assign to agent</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
              {agentName ? <>Assigning to <b style={{ color: '#60a5fa' }}>{agentName}</b></> : 'Assigning operator'}
              {ticket?.taskName ? ` · ${ticket.taskName}` : ''}
            </p>
          </div>
        </div>

        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          QM Comment <span style={{ color: '#555', fontWeight: 500 }}>(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Instructions / context for the agent…"
          rows={4}
          autoFocus
          style={{
            width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #333',
            background: '#222', color: '#fff', fontSize: '13px', fontFamily: globalFont,
            resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: '20px', lineHeight: 1.6
          }}
          onFocus={(e) => e.target.style.border = '1px solid #3b82f6'}
          onBlur={(e) => e.target.style.border = '1px solid #333'}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onCancel} style={{
            padding: '10px 20px', background: '#2a2a2a', border: '1px solid #444',
            borderRadius: '8px', color: '#ccc', fontWeight: '600', fontSize: '13px', cursor: 'pointer', fontFamily: globalFont
          }}>Cancel</button>
          <button onClick={() => onConfirm(note.trim())} style={{
            padding: '10px 22px', background: '#3b82f6', border: 'none',
            borderRadius: '8px', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
            fontFamily: globalFont, boxShadow: '0 6px 18px rgba(59,130,246,0.35)'
          }}>Assign</button>
        </div>
      </div>
    </div>
  );
};

// Comment input modal (Ready to Queue)
export const CommentModal = ({ commentText, setCommentText, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  }}>
    <div style={{
      background: '#1a1a1a', borderRadius: '16px',
      padding: '32px', width: '420px',
      boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
      border: '1px solid #333', fontFamily: globalFont
    }}>
      <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '700', color: '#fff' }}>
        Ready to Queue
      </h2>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#777' }}>
        Add a context note before updating status.
      </p>
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Type context here..."
        rows={4}
        style={{
          width: '100%', padding: '14px',
          borderRadius: '10px', border: '1px solid #333',
          background: '#222', color: '#fff',
          fontSize: '13px', fontFamily: globalFont,
          resize: 'vertical', outline: 'none',
          boxSizing: 'border-box', marginBottom: '20px'
        }}
        onFocus={(e) => e.target.style.border = '1px solid #e50914'}
        onBlur={(e) => e.target.style.border = '1px solid #333'}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 20px', background: '#2a2a2a',
            border: '1px solid #444', borderRadius: '8px',
            color: '#ccc', fontWeight: '600',
            fontSize: '13px', cursor: 'pointer',
            fontFamily: globalFont
          }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: '10px 20px', background: '#e50914',
            border: 'none', borderRadius: '8px',
            color: '#fff', fontWeight: '700',
            fontSize: '13px', cursor: 'pointer',
            fontFamily: globalFont
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// View comment modal
export const ViewCommentModal = ({ text, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  }}>
    <div style={{
      background: '#1a1a1a', borderRadius: '16px',
      padding: '32px', width: '500px', maxWidth: '90vw',
      boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
      border: '1px solid #333', fontFamily: globalFont
    }}>
      <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: '#fff' }}>
        Ticket Notes & History
      </h2>
      <div style={{
        background: '#222', padding: '18px',
        borderRadius: '10px', border: '1px solid #333',
        minHeight: '120px', maxHeight: '280px',
        overflowY: 'auto', whiteSpace: 'pre-wrap',
        fontSize: '13px', color: '#ddd', lineHeight: '1.7'
      }}>
        {text || 'No comments'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 24px', background: '#e50914',
            border: 'none', borderRadius: '8px',
            color: '#fff', fontWeight: '700',
            fontSize: '13px', cursor: 'pointer',
            fontFamily: globalFont
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
);