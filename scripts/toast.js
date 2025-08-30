// scripts/toast.js
(function(){
  const rootId = 'dfs-toast-root';
  function ensureRoot(){
    let r = document.getElementById(rootId);
    if(!r){
      r = document.createElement('div');
      r.id = rootId;
      r.setAttribute('aria-live', 'polite');
      document.body.appendChild(r);
    }
    return r;
  }
  window.dfsToast = function(msg, type='info', ttl=2000){
    const r = ensureRoot();
    const el = document.createElement('div');
    el.className = `dfs-toast dfs-toast--${type}`;
    el.textContent = msg;
    r.appendChild(el);
    setTimeout(()=>{ el.classList.add('out'); }, ttl);
    setTimeout(()=>{ el.remove(); }, ttl+400);
  };
})();

