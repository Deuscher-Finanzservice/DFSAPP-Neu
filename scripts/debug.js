(function(){
  function get(id){ return document.getElementById(id); }
  function appendLog(prefix, args){
    try{
      const el = get('debug-log');
      if(!el) return; // no UI present
      if(window.dfs && window.dfs.debug===false) return; // only when debug mode is on
      const parts = Array.from(args).map(a=>{
        try{ return (typeof a==='object') ? JSON.stringify(a) : String(a); }catch{ return String(a); }
      });
      const msg = `[${prefix}] ${parts.join(' ')}`;
      el.textContent += msg + '\n';
      const panel = el.parentElement; if(panel) panel.scrollTop = panel.scrollHeight;
    }catch{}
  }
  const origError = console.error.bind(console);
  const origInfo  = console.info.bind(console);
  console.error = (...args)=>{ appendLog('ERR', args); origError(...args); };
  console.info  = (...args)=>{ appendLog('INF', args); origInfo(...args); };

  document.addEventListener('DOMContentLoaded', ()=>{
    const copyBtn = get('debug-copy');
    if(copyBtn){
      copyBtn.addEventListener('click', ()=>{
        try{
          const txt = (get('debug-log')?.textContent)||'';
          navigator.clipboard.writeText(txt).then(()=>{
            if(window.dfsToastKeyed) dfsToastKeyed('debug-copy','Debug-Log kopiert','success',2000);
            else if(window.dfsToast) dfsToast('Debug-Log kopiert','success',2000);
          });
        }catch{}
      });
    }
  });
})();

