// scripts/save-status.js
window.dfsSaveStatus = (function(){
  function bind(elId, metaId){
    const el = document.getElementById(elId);
    const meta = metaId ? document.getElementById(metaId) : null;
    let fadeTimer=null;
    function spinnerOn(btnSel){ try{ const b=document.querySelector(btnSel); if(!b) return; if(!b.querySelector('.spinner')){ const s=document.createElement('span'); s.className='spinner'; b.appendChild(s);} b.disabled=true; }catch{} }
    function spinnerOff(btnSel){ try{ const b=document.querySelector(btnSel); if(!b) return; const s=b.querySelector('.spinner'); if(s) s.remove(); b.disabled=false; }catch{} }
    function set(state, opts={}){
      if(!el) return;
      if(fadeTimer){ clearTimeout(fadeTimer); fadeTimer=null; }
      el.classList.remove('fade-out');
      let text = '—';
      if(state==='dirty') text='Ungespeichert';
      else if(state==='saving') text='Speichert…';
      else if(state==='saved') text='Gespeichert';
      else if(state==='error') text='Fehler';
      el.textContent = text;
      if(opts.withSpinnerOn) spinnerOn(opts.withSpinnerOn);
      if(state!=='saving' && opts.withSpinnerOn) spinnerOff(opts.withSpinnerOn);
      if(state==='saved'){
        // timestamp
        try{ if(meta){ const d=new Date(); const hh=String(d.getHours()).padStart(2,'0'); const mm=String(d.getMinutes()).padStart(2,'0'); meta.textContent = `zuletzt gespeichert: ${hh}:${mm}`; } }catch{}
        fadeTimer = setTimeout(()=>{ try{ el.classList.add('fade-out'); setTimeout(()=>{ el.classList.remove('fade-out'); el.textContent='—'; }, 600); }catch{} }, 3000);
      }
    }
    return { set };
  }
  return { bind };
})();
