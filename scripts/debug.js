(function(){
  const get = (id)=> document.getElementById(id);
  const logEl = get('debug-log');
  const MAX_LINES = 2000;
  const TRIM_TO   = 1500;
  const buffer = [];
  const envHeader = () => {
    const ver = (window.dfs?.version) || window.DFS_VERSION || 'dev';
    return [
      'DFS Analyse – Debug Export',
      `Host: ${location.hostname}`,
      `Version: ${ver}`,
      `UserAgent: ${navigator.userAgent}`,
      `Timestamp: ${new Date().toISOString()}`,
      '----------------------------------------'
    ].join('\n');
  };

  function safe(a){
    if(a instanceof Error) return `${a.name}:${a.message}`;
    if(typeof a === 'object'){ try{ return JSON.stringify(a); }catch{ return '[object]'; } }
    return String(a);
  }
  function append(line){
    try{
      if(!logEl) return;
      if(window.dfs && window.dfs.debug===false) return;
      buffer.push(line);
      logEl.textContent += line + '\n';
      if(buffer.length > MAX_LINES){
        buffer.splice(0, buffer.length - TRIM_TO);
        logEl.textContent = buffer.join('\n') + '\n';
      }
      const panel = logEl.parentElement; if(panel) panel.scrollTop = panel.scrollHeight;
    }catch{}
  }

  const origError = console.error.bind(console);
  const origInfo  = console.info.bind(console);
  console.error = (...args)=>{ try{ if(window.dfsDebug && (window.dfs?.debug!==false)){ window.dfsDebug.log('error', ...args); } else { append(`[ERR] ${args.map(safe).join(' ')}`); } }catch{ append(`[ERR] ${args.map(safe).join(' ')}`);} origError(...args); };
  console.info  = (...args)=>{ try{ if(window.dfsDebug && (window.dfs?.debug!==false)){ window.dfsDebug.log('info', ...args); } else { append(`[INF] ${args.map(safe).join(' ')}`); } }catch{ append(`[INF] ${args.map(safe).join(' ')}`);} origInfo(...args); };

  window.debugLogClear = ()=>{ buffer.length=0; if(logEl) logEl.textContent=''; };

  document.addEventListener('DOMContentLoaded', ()=>{
    const copyBtn = get('debug-copy');
    if(copyBtn){ copyBtn.addEventListener('click', ()=>{ try{ const txt = (logEl?.textContent)||''; navigator.clipboard.writeText(txt).then(()=>{ if(window.dfsToastKeyed) dfsToastKeyed('debug-copy','Debug-Log kopiert','success',2000); else if(window.dfsToast) dfsToast('Debug-Log kopiert','success',2000); }); }catch{} }); }
    const dlBtn = get('debug-download');
    if(dlBtn){ dlBtn.addEventListener('click', ()=>{ try{ const body = [envHeader(), buffer.join('\n')].join('\n'); const blob = new Blob([body],{type:'text/plain;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); const ts=new Date().toISOString().replace(/[:.]/g,'-'); a.href=url; a.download=`dfs-debug-${ts}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); if(window.dfsToastKeyed) dfsToastKeyed('debug-dl','Debug-Log exportiert','success',2000); else if(window.dfsToast) dfsToast('Debug-Log exportiert','success',2000); }catch{} }); }
  });

  // expose error capture for firestore paths
  window.dfs = window.dfs || {};
  window.dfs.lastFsError = null;
  window.dfs.captureFsError = (e, ctx)=>{ const line = `[FIRESTORE-ERR] code=${e?.code||'unknown'} msg=${e?.message||'-'} ctx=${safe(ctx)}`; append(line); window.dfs.lastFsError={ ts:Date.now(), code:e?.code, message:e?.message, ctx }; };
})();
