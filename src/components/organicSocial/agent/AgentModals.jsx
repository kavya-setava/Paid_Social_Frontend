import React from 'react';
import { globalFont } from './AgentDashboardConstants';

export const ViewCommentModal = ({ text, onClose }) => (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  }}>
    <div style={{
      background: '#1a1a1a', borderRadius: '16px',
      padding: '32px', width: '480px', maxWidth: '90vw',
      border: '1px solid #2a2a2a',
      boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
      fontFamily: globalFont
    }}>
      <h2 style={{
        margin: '0 0 16px', fontSize: '18px',
        fontWeight: '700', color: '#fff'
      }}>
        Notes & Comments
      </h2>

      <div style={{
        background: '#222', padding: '16px',
        borderRadius: '10px', border: '1px solid #2a2a2a',
        maxHeight: '260px', overflowY: 'auto',
        whiteSpace: 'pre-wrap', fontSize: '13px',
        color: '#ccc', lineHeight: '1.7'
      }}>
        {text || 'No comments'}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        marginTop: '20px'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: '10px 24px',
            background: '#3b82f6',
            border: 'none', borderRadius: '8px',
            color: '#fff', fontWeight: '700',
            fontSize: '13px', cursor: 'pointer',
            fontFamily: globalFont, transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
        >
          Close
        </button>
      </div>
    </div>
  </div>
);