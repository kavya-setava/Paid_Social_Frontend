import React from 'react';
import { globalFont } from './QADashboardConstants';

const QAPagination = ({ page, totalPages, limit, setPage, setLimit }) => {
  const btn = (active) => ({
    padding:'6px 10px', borderRadius:'6px',
    border:`1px solid ${active?'#6366f1':'#333'}`,
    background: active ? '#6366f1' : '#222',
    color: active ? '#fff' : '#ccc',
    cursor:'pointer', fontSize:'12px',
    fontWeight: active ? '700' : '500',
    fontFamily:globalFont, transition:'all 0.2s'
  });

  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',borderTop:'1px solid #2a2a2a',flexWrap:'wrap',gap:'10px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        <span style={{fontSize:'12px',color:'#555',fontFamily:globalFont}}>Rows per page</span>
        <select value={limit} onChange={(e)=>setLimit(Number(e.target.value))}
          style={{padding:'5px 10px',borderRadius:'6px',border:'1px solid #6366f1',background:'#222',color:'#6366f1',fontSize:'12px',fontWeight:'700',cursor:'pointer',outline:'none'}}>
          {[10,20,30,50].map(n=><option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
        <button onClick={()=>setPage(p=>p-1)} disabled={page===1}
          style={{...btn(false),opacity:page===1?0.4:1,cursor:page===1?'not-allowed':'pointer'}}
          onMouseEnter={(e)=>{if(page!==1){e.currentTarget.style.background='#6366f1';e.currentTarget.style.color='#fff';}}}
          onMouseLeave={(e)=>{e.currentTarget.style.background='#222';e.currentTarget.style.color='#ccc';}}>
          Prev
        </button>
        {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
          <button key={p} onClick={()=>setPage(p)} style={btn(page===p)}
            onMouseEnter={(e)=>{if(page!==p){e.currentTarget.style.background='#4338ca';e.currentTarget.style.color='#fff';}}}
            onMouseLeave={(e)=>{if(page!==p){e.currentTarget.style.background='#222';e.currentTarget.style.color='#ccc';}}}>
            {p}
          </button>
        ))}
        <button onClick={()=>setPage(p=>p+1)} disabled={page===totalPages}
          style={{...btn(false),opacity:page===totalPages?0.4:1,cursor:page===totalPages?'not-allowed':'pointer'}}
          onMouseEnter={(e)=>{if(page!==totalPages){e.currentTarget.style.background='#6366f1';e.currentTarget.style.color='#fff';}}}
          onMouseLeave={(e)=>{e.currentTarget.style.background='#222';e.currentTarget.style.color='#ccc';}}>
          Next
        </button>
      </div>
    </div>
  );
};

export default QAPagination;