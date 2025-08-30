(function(){
  window.DFS_CLOUD_ONLY = true;
  document.addEventListener('DOMContentLoaded', ()=>{
    try{
      const note = document.createElement('div');
      note.textContent = 'Cloud-only – alle Daten werden automatisch gespeichert.';
      note.style.cssText = 'position:fixed;top:8px;left:12px;font-size:11px;color:#C0C0C0;background:rgba(0,0,0,0.6);padding:4px 8px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);z-index:9999';
      document.body.appendChild(note);
    }catch{}
  });
})();

