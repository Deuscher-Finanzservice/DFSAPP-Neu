(function(){
  const el = { 
    root: document.getElementById('dfs-debug'),
    body: document.getElementById('dfs-debug-body'),
    meta: document.getElementById('dfs-debug-meta'),
    copy: document.getElementById('dfsdbg-copy'),
    save: document.getElementById('dfsdbg-save'),
    pause: document.getElementById('dfsdbg-pause'),
    clear: document.getElementById('dfsdbg-clear'),
    close: document.getElementById('dfsdbg-close'),
    fInfo: document.getElementById('dfsdbg-f-info'),
    fWarn: document.getElementById('dfsdbg-f-warn'),
    fErr:  document.getElementById('dfsdbg-f-error'),
  };
  if(!el.root){ return; }
  const state = { paused:false, buffer:[], filters:{info:true,warn:true,error:true} };
  function fmt(ts){ try{ return new Date(ts).toLocaleTimeString('de-DE',{hour12:false}); }catch{ return String(ts); } }
  function renderLine(ts, level, text){
    if(!state.filters[level]) return;
    const row = document.createElement('div');
    row.className = `dfsdbg__row dfsdbg__${level}`;
    row.innerHTML = `<span class="dfsdbg__ts"></span><span class="dfsdbg__lvl"></span><span class="dfsdbg__msg"></span>`;
    row.querySelector('.dfsdbg__ts').textContent = fmt(ts);
    row.querySelector('.dfsdbg__lvl').textContent = level.toUpperCase();
    row.querySelector('.dfsdbg__msg').textContent = text;
    el.body.appendChild(row);
    el.body.scrollTop = el.body.scrollHeight;
  }
  function toPlain(){
    return Array.from(el.body.querySelectorAll('.dfsdbg__row')).map(r=>`[${r.querySelector('.dfsdbg__ts').textContent}] ${r.querySelector('.dfsdbg__lvl').textContent}: ${r.querySelector('.dfsdbg__msg').textContent}`).join('\n');
  }
  function safe(a){ try{ return (typeof a==='string')? a : JSON.stringify(a); }catch{ return String(a); } }

  el.copy?.addEventListener('click', async ()=>{ try{ await navigator.clipboard.writeText(toPlain()); if(window.dfsToastKeyed) dfsToastKeyed('dbg-copy','Debug-Log kopiert','success',2000);}catch{} });
  el.save?.addEventListener('click', ()=>{ try{ const blob=new Blob([toPlain()],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`dfs-debug-${Date.now()}.txt`; a.click(); URL.revokeObjectURL(a.href); if(window.dfsToastKeyed) dfsToastKeyed('dbg-save','Debug-Log exportiert','success',2000);}catch{} });
  el.pause?.addEventListener('click', ()=>{ state.paused=!state.paused; el.pause.textContent = state.paused? 'Weiter':'Pausieren'; if(!state.paused && state.buffer.length){ state.buffer.splice(0).forEach(args=> renderLine(...args)); } });
  el.clear?.addEventListener('click', ()=>{ el.body.innerHTML=''; });
  el.close?.addEventListener('click', ()=>{ el.root.hidden = true; });
  [el.fInfo, el.fWarn, el.fErr].forEach(ch=> ch?.addEventListener('change', ()=>{ state.filters={ info: !!el.fInfo?.checked, warn: !!el.fWarn?.checked, error: !!el.fErr?.checked }; }));

  window.dfsDebug = window.dfsDebug || {};
  window.dfsDebug.show = ()=>{ el.root.hidden=false; };
  window.dfsDebug.hide = ()=>{ el.root.hidden=true; };
  window.dfsDebug.meta = (str)=>{ if(el.meta) el.meta.textContent = str||''; };
  window.dfsDebug.log = (level, ...args)=>{
    const text = args.map(safe).join(' ');
    const entry = [Date.now(), level, text];
    if(state.paused) state.buffer.push(entry); else renderLine(...entry);
  };
  // Initial meta
  try{ const ver=(window.DFS_VERSION||''); window.dfsDebug.meta(`${location.hostname}${ver?(' • '+ver):''}`); }catch{}
})();

