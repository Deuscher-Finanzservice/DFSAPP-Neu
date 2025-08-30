(function(){
  function getEl(id){ return document.getElementById(id); }
  function showToast(msg){ try{ const t=getEl('toast'); if(!t) return; t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 2000);}catch{} }
  function toggleMenu(){ const m=getEl('dev-menu'); if(!m) return; m.style.display = (m.style.display==='none'||!m.style.display)? 'block':'none'; }
  function hideMenu(){ const m=getEl('dev-menu'); if(m) m.style.display='none'; }
  function withCacheBust(url){
    try{ if(typeof withVersion==='function'){ return withVersion(url||location.href); } }catch{}
    try{
      const u=new URL(url||location.href, location.origin);
      u.searchParams.set('v', Date.now());
      return u.toString();
    }catch{
      const hasQ=(location.href||'').includes('?');
      return (location.href||'') + (hasQ?'&':'?') + 'v=' + Date.now();
    }
  }
  document.addEventListener('DOMContentLoaded', function(){
    // init dfs + debug
    window.dfs = window.dfs || {};
    try{ const persisted = localStorage.getItem('dfs.debug'); if(persisted!=null) window.dfs.debug = (persisted === 'true'); }catch{}
    if(typeof window.dfs.debug !== 'boolean') window.dfs.debug = !!window.dfs.debug;

    const gear = getEl('dev-gear');
    const menu = getEl('dev-menu');
    const toggle = getEl('dev-toggle-debug');
    const hard = getEl('dev-hard-reload');
    const openConsole = getEl('dev-open-console');
    const envInfo = getEl('dev-env-info');
    const verInfo = getEl('dev-version-info');
    const fsLink = getEl('dev-open-firestore');

    if(toggle){
      toggle.checked = !!window.dfs.debug;
      // show/hide debug panel on init
      try{ const panel=document.getElementById('debug-panel'); if(panel) panel.classList.toggle('hidden', !toggle.checked); }catch{}
      toggle.addEventListener('change', ()=>{
        window.dfs.debug = !!toggle.checked;
        try{ localStorage.setItem('dfs.debug', String(window.dfs.debug)); }catch{}
        try{ const panel=document.getElementById('debug-panel'); if(panel) panel.classList.toggle('hidden', !toggle.checked); }catch{}
        showToast('Debug: ' + (window.dfs.debug?'AN':'AUS'));
      });
    }
    if(gear){ gear.addEventListener('click', (e)=>{ e.stopPropagation(); toggleMenu(); }); }
    if(menu){ document.addEventListener('click', (e)=>{ if(!menu.contains(e.target) && e.target!==gear){ hideMenu(); } }); }
    if(hard){ hard.addEventListener('click', ()=>{ location.href = withCacheBust(); }); }
    if(openConsole){ openConsole.addEventListener('click', ()=>{ showToast('Konsole öffnen mit F12 (oder Ctrl+Shift+I)'); }); }
    if(envInfo){ envInfo.textContent = location.hostname; }
    if(verInfo){
      const ver = (localStorage.getItem('dfs.version') || (window.DFS_VERSION||'dev'));
      const now = new Date(); verInfo.textContent = 'Version ' + ver + ' · ' + now.toLocaleString('de-DE');
    }
    if(fsLink){
      let href = 'https://console.firebase.google.com/';
      try{
        // Attempt to infer projectId if available globally
        const pid = (window.firebaseApp && window.firebaseApp.options && window.firebaseApp.options.projectId) || null;
        if(pid) href = `https://console.firebase.google.com/project/${pid}/firestore/data`;
      }catch{}
      fsLink.href = href;
    }
  });
})();
